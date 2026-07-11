/**
 * InlineMenu — the anchored inline dropdown popover (web-native `<select>` feel).
 *
 * Rendered absolutely just under the trigger so it never pushes page layout, it
 * scrolls when long, and it is dismissible via click-outside / Escape and
 * navigable with the arrow keys + Enter (see {@link useMenuKeyboard}). It reuses
 * {@link OptionRow} for rendering/selection so no option logic is duplicated.
 *
 * The `containerRef` is the relatively-positioned wrapper owned by ModalDropdown
 * that holds BOTH the trigger and this popover, so an "outside" click excludes
 * the trigger itself.
 */
import React, { useCallback, useMemo, useState } from 'react';
import type { RefObject } from 'react';

import { ScrollView, StyleSheet, View } from 'react-native';
import type { View as RNView } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import type { DropdownOption } from './dropdownTypes';
import { OptionRow } from './OptionRow';
import { useMenuKeyboard } from './useMenuKeyboard';

const BORDER_RADIUS = 8;
const BORDER_WIDTH = 1;
const MENU_PADDING = 4;
const MENU_MAX_HEIGHT = 300;
const MENU_TOP_GAP = 4;
const MENU_Z_INDEX = 1000;
const MENU_ELEVATION = 8;
/** Soft drop shadow so the popover reads as floating above the page. */
const MENU_BOX_SHADOW = '0px 2px 8px rgba(0, 0, 0, 0.15)';

const styles = StyleSheet.create({
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
  onSelect: (value: T) => void;
  onClose: () => void;
}

export const InlineMenu = <T extends string | number>({
  testID,
  accessibilityLabel,
  value,
  options,
  containerRef,
  onSelect,
  onClose,
}: InlineMenuProps<T>): React.ReactElement => {
  const { theme } = useUi();
  const { colors } = theme;

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
    enabled: true,
    itemCount: options.length,
    onHighlightChange: setHighlightedIndex,
    onSelectHighlighted: selectHighlighted,
    onClose,
  });

  const popoverStyle = useMemo(
    () => [styles.popover, { borderColor: colors.border, backgroundColor: colors.surface }],
    [colors.border, colors.surface],
  );

  return (
    <View
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
            testID={`${testID}-option-${String(option.value)}`}
            onSelect={() => onSelect(option.value)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default InlineMenu;
