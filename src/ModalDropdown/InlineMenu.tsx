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
 */
import React, { useCallback, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';

import { createPortal } from 'react-dom';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import type { View as RNView } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import type { DropdownOption } from './dropdownTypes';
import {
  MENU_BOX_SHADOW,
  MENU_ELEVATION,
  MENU_MAX_HEIGHT,
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
});

export interface InlineMenuProps<T> {
  testID: string;
  accessibilityLabel: string;
  value: T;
  options: ReadonlyArray<DropdownOption<T>>;
  containerRef: RefObject<RNView | null>;
  /** Custom testID per option row. Defaults to `` `${testID}-option-${value}` ``. */
  optionTestID?: (value: T) => string;
  /** Minimum popover width — a floor for COMPACT anchors, whose width cannot fit an option label. */
  menuMinWidth?: number;
  onSelect: (value: T) => void;
  onClose: () => void;
}

export const InlineMenu = <T extends string | number>({
  testID,
  accessibilityLabel,
  value,
  options,
  containerRef,
  optionTestID,
  menuMinWidth = 0,
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
    enabled: true,
    itemCount: options.length,
    onHighlightChange: setHighlightedIndex,
    onSelectHighlighted: selectHighlighted,
    onClose,
  });

  const popoverStyle = useMemo(() => {
    const themed = { borderColor: colors.border, backgroundColor: colors.surface };
    // Web: fixed-positioned in a portal at the measured trigger rect (escapes stacking + clipping).
    if (IS_WEB)
      return [
        buildPortalPopoverStyle(rect ?? { top: 0, left: 0, width: 0, bottom: 0 }, menuMinWidth),
        themed,
      ];
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
      <ScrollView keyboardShouldPersistTaps="handled">
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
    </View>
  );

  // Portal to document.body on web so no ancestor stacking context / overflow can trap or clip it.
  if (IS_WEB) return createPortal(menu, document.body);
  return menu;
};

export default InlineMenu;
