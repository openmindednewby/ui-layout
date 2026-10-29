/**
 * OptionRow — a single selectable option, shared by both the modal and the inline
 * menu variants of ModalDropdown so selection/rendering logic is never duplicated.
 */
import React, { useCallback } from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { LAYOUT_I18N, MIN_TARGET_PX } from '../constants';

import { SelectedMarker } from './SelectedMarker';

const OPTION_BORDER_RADIUS = 4;
const BODY_FONT_SIZE = 14;
const SELECTED_FONT_WEIGHT = '600' as const;
const OPTION_PADDING_H = 16;
const OPTION_PADDING_V = 12;
const ACCENT_BAR_WIDTH = 3;
const CHECK_GAP = 8;
const CHECK_GLYPH = '✓';

const styles = StyleSheet.create({
  option: {
    paddingHorizontal: OPTION_PADDING_H,
    paddingVertical: OPTION_PADDING_V,
    minHeight: MIN_TARGET_PX,
    justifyContent: 'center',
    borderRadius: OPTION_BORDER_RADIUS,
  },
  optionText: { fontSize: BODY_FONT_SIZE },
  selectedText: { fontWeight: SELECTED_FONT_WEIGHT },
  markedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: CHECK_GAP,
    borderLeftWidth: ACCENT_BAR_WIDTH,
    borderLeftColor: 'transparent',
    paddingLeft: OPTION_PADDING_H - ACCENT_BAR_WIDTH,
  },
  markedText: { flexShrink: 1 },
});

export interface OptionRowProps {
  testID: string;
  label: string;
  isSelected: boolean;
  /** Keyboard-highlighted row (arrow-key navigation) in the inline menu. */
  isHighlighted?: boolean;
  onSelect: () => void;
  /** `AccentCheck` marks the selected row with an accent left bar and a trailing check. */
  selectedMarker?: SelectedMarker;
  /** Renders the row as `role="menuitem"` (rows of a `role="menu"` popover). */
  asMenuItem?: boolean;
}

export const OptionRow = ({
  testID,
  label,
  isSelected,
  isHighlighted = false,
  onSelect,
  selectedMarker = SelectedMarker.Bold,
  asMenuItem = false,
}: OptionRowProps): React.ReactElement => {
  const { theme, t } = useUi();
  const { colors } = theme;

  const handlePress = useCallback(() => { onSelect(); }, [onSelect]);

  const accentColor = theme.palette.primary['500'];
  const isMarked = selectedMarker === SelectedMarker.AccentCheck;
  const isActive = isSelected || isHighlighted;
  const rowStyle = [
    styles.option,
    isMarked ? styles.markedRow : null,
    isActive ? { backgroundColor: colors.surfaceElevated } : null,
    isMarked && isSelected ? { borderLeftColor: accentColor } : null,
  ];
  const textStyle = [
    styles.optionText,
    { color: colors.text },
    isSelected ? styles.selectedText : null,
    isMarked ? styles.markedText : null,
  ];
  const selectionProps = asMenuItem ? { 'aria-current': isSelected ? 'true' : undefined } : { 'aria-selected': isSelected };

  return (
    <TouchableOpacity
      accessible
      accessibilityHint={t(LAYOUT_I18N.selectOptionHint)}
      accessibilityLabel={label}
      accessibilityRole={asMenuItem ? 'menuitem' : 'button'}
      {...(selectionProps as object)}
      style={rowStyle}
      testID={testID}
      onPress={handlePress}
    >
      <Text style={textStyle}>{label}</Text>
      {isMarked && isSelected ? (
        <View aria-hidden testID={`${testID}-check`}>
          <Text style={[styles.selectedText, { color: accentColor }]}>{CHECK_GLYPH}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

export default OptionRow;
