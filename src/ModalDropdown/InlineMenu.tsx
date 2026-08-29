/**
 * InlineMenu — the anchored inline dropdown popover (web-native `<select>` feel).
 *
 * Dismissible via click-outside / Escape and navigable with the arrow keys + Enter (see
 * {@link useMenuKeyboard}). It reuses {@link OptionRow} for rendering/selection so no option
 * logic is duplicated.
 *
 * STACKING (the bug this file fixes): react-native-web gives every `View`
 * `position: relative; z-index: 0`, making each View its own stacking context. An absolutely
 * positioned popover therefore has its `zIndex` trapped inside its anchor/field wrapper and paints
 * UNDER later siblings (adjacent filter fields, the results table, cards). To escape that, on WEB
 * the popover is rendered in a PORTAL to `document.body` with `position: fixed` at the trigger's
 * measured viewport rect and a high `zIndex` — clipped by nothing, above everything. On native it
 * stays in-tree (`position:absolute` + `elevation`). See {@link menuStacking}.
 *
 * The `containerRef` is the relatively-positioned wrapper owned by ModalDropdown that holds the
 * trigger; on native the popover renders inside it. On web the popover lives in the portal, so
 * outside-click detection also consults this popover's own node (`menuRef`).
 *
 * `position: fixed` is viewport-relative, so the measured rect goes stale the moment anything moves
 * the trigger. {@link useAnchorTracking} owns keeping the two together — and closes the menu once
 * the trigger has left the viewport, rather than leaving it orphaned over unrelated content.
 *
 * MOUNTED IS NOT OPEN. ModalDropdown keeps this component mounted PAST logical close so the exit
 * fade can play (`useEnterExit`'s `mounted`). Anything here keyed on mount therefore outlives the
 * menu by the length of that animation — and {@link useMenuKeyboard} installs a DOCUMENT-CAPTURE
 * keydown listener that `preventDefault()`s Enter/Escape/Arrows. Left keyed on mount, a closing
 * menu swallows the user's next keystroke for the whole exit window: the trigger already reports
 * `aria-expanded="false"`, yet Enter never reaches it and the browser never synthesises the click
 * that would re-open it. `isOpen` is that distinction, threaded down from the owner.
 */
import React, { useCallback, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';

import { createPortal } from 'react-dom';
import { Animated, Platform, ScrollView, StyleSheet, View } from 'react-native';
import type { View as RNView } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';
import type { UseEnterExitResult } from '@dloizides/ui-motion';

import type { DropdownOption } from './dropdownTypes';
import {
  MENU_BOX_SHADOW,
  MENU_ELEVATION,
  MENU_MAX_HEIGHT,
  MENU_SCROLL_MAX_HEIGHT,
  MENU_TOP_GAP,
  MENU_Z_INDEX,
  buildPortalPopoverStyle,
} from './menuStacking';
import { OptionRow } from './OptionRow';
import { useAnchorTracking } from './useAnchorTracking';
import { useMenuKeyboard } from './useMenuKeyboard';

const IS_WEB = Platform.OS === 'web';

const BORDER_RADIUS = 8;
const BORDER_WIDTH = 1;
const MENU_PADDING = 4;

const styles = StyleSheet.create({
  /** Native (in-tree) popover — anchored absolutely just under the trigger. */
  popover: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: MENU_TOP_GAP,
    zIndex: MENU_Z_INDEX,
    borderWidth: BORDER_WIDTH,
    borderRadius: BORDER_RADIUS,
    padding: MENU_PADDING,
    maxHeight: MENU_MAX_HEIGHT,
    boxShadow: MENU_BOX_SHADOW,
    elevation: MENU_ELEVATION,
  },
  // The enter/exit fade+scale lives on an INNER wrapper so the outer popover keeps its raw DOM
  // node (the `menuRef` outside-click / keyboard logic and the web portal target depend on it).
  // `transformOrigin: 'top'` makes the scale grow downward FROM the anchor rather than the centre.
  animated: { transformOrigin: 'top' },
  // Bound the scroll viewport so a list longer than the popover scrolls (with a scrollbar) instead of
  // overflowing the frame — the popover's own maxHeight cannot do this (see MENU_SCROLL_MAX_HEIGHT).
  scroll: { maxHeight: MENU_SCROLL_MAX_HEIGHT },
});

export interface InlineMenuProps<T> {
  testID: string;
  accessibilityLabel: string;
  value: T;
  options: ReadonlyArray<DropdownOption<T>>;
  containerRef: RefObject<RNView | null>;
  /**
   * The owner's LOGICAL open state — not "is this component mounted". Gates the document-capture
   * keyboard listener so a menu that is closing (still mounted for its exit fade) stops claiming
   * keys the moment it is logically closed. See the file header.
   */
  isOpen: boolean;
  /** Custom testID per option row. Defaults to `` `${testID}-option-${value}` ``. */
  optionTestID?: (value: T) => string;
  /** Minimum popover width — a floor for COMPACT anchors, whose width cannot fit an option label. */
  menuMinWidth?: number;
  /** Enter/exit fade+scale style from the owner's `useEnterExit`, applied to the inner wrapper. */
  animatedStyle?: UseEnterExitResult['style'];
  onSelect: (value: T) => void;
  onClose: () => void;
}

export const InlineMenu = <T extends string | number>({
  testID,
  accessibilityLabel,
  value,
  options,
  containerRef,
  isOpen,
  optionTestID,
  menuMinWidth = 0,
  animatedStyle,
  onSelect,
  onClose,
}: InlineMenuProps<T>): React.ReactElement | null => {
  const { theme } = useUi();
  const { colors } = theme;

  const menuRef = useRef<RNView>(null);
  // Tracks the trigger while open, and closes rather than orphaning the menu once the trigger
  // has scrolled out of the viewport entirely.
  const rect = useAnchorTracking(containerRef, onClose);

  const selectedIndex = useMemo(
    () => Math.max(0, options.findIndex((opt) => opt.value === value)),
    [options, value],
  );
  // Lazy init: start the keyboard highlight on the currently-selected option.
  const [highlightedIndex, setHighlightedIndex] = useState<number>(() => selectedIndex);

  const selectAt = useCallback(
    (index: number) => {
      const option = options[index];
      if (option !== undefined) onSelect(option.value);
    },
    [options, onSelect],
  );

  const selectHighlighted = useCallback(
    () => { selectAt(highlightedIndex); },
    [selectAt, highlightedIndex],
  );

  useMenuKeyboard({
    containerRef,
    menuRef,
    enabled: isOpen,
    itemCount: options.length,
    onHighlightChange: setHighlightedIndex,
    onSelectHighlighted: selectHighlighted,
    onClose,
  });

  const popoverStyle = useMemo(() => {
    const themed = { borderColor: colors.border, backgroundColor: colors.surface };
    // Web: fixed-positioned in a portal at the measured trigger rect (escapes stacking + clipping).
    // Pass the viewport width so a floored menu wider than its trigger is clamped inside the edge
    // rather than spilling off-screen. `rect` is a memo dep and re-measures on scroll/resize, so the
    // width is re-read then too.
    if (IS_WEB) {
      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
      return [
        buildPortalPopoverStyle(rect ?? { top: 0, left: 0, width: 0, bottom: 0 }, menuMinWidth, viewportWidth),
        themed,
      ];
    }
    // Native: in-tree absolute popover under the trigger (stretched to the anchor, floored the same).
    return [styles.popover, { minWidth: menuMinWidth }, themed];
  }, [colors.border, colors.surface, menuMinWidth, rect]);

  const menu = (
    <View
      ref={menuRef}
      accessibilityRole="menu"
      aria-label={accessibilityLabel}
      style={popoverStyle}
      testID={`${testID}-menu`}
    >
      <Animated.View style={[styles.animated, animatedStyle]}>
        <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
          {options.map((option, index) => (
            <OptionRow
              key={String(option.value)}
              isHighlighted={index === highlightedIndex}
              isSelected={option.value === value}
              label={option.label}
              testID={
                optionTestID !== undefined ? optionTestID(option.value) : `${testID}-option-${String(option.value)}`
              }
              onSelect={() => onSelect(option.value)}
            />
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );

  // Portal to document.body on web so no ancestor stacking context / overflow can trap or clip it.
  if (IS_WEB) return createPortal(menu, document.body);
  return menu;
};

export default InlineMenu;
