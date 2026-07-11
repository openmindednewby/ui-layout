/**
 * OptionRow — a single selectable option, shared by both the modal and the inline
 * menu variants of ModalDropdown so selection/rendering logic is never duplicated.
 */
import React, { useCallback } from 'react';

import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

const OPTION_BORDER_RADIUS = 4;
const BODY_FONT_SIZE = 14;
const SELECTED_FONT_WEIGHT = '600' as const;
const OPTION_PADDING_H = 16;
const OPTION_PADDING_V = 12;

const styles = StyleSheet.create({
  option: {
    paddingHorizontal: OPTION_PADDING_H,
    paddingVertical: OPTION_PADDING_V,
    borderRadius: OPTION_BORDER_RADIUS,
  },
  optionText: { fontSize: BODY_FONT_SIZE },
  selectedText: { fontWeight: SELECTED_FONT_WEIGHT },
});

export interface OptionRowProps {
  testID: string;
  label: string;
  isSelected: boolean;
  /** Keyboard-highlighted row (arrow-key navigation) in the inline menu. */
  isHighlighted?: boolean;
  onSelect: () => void;
}

export const OptionRow = ({
  testID,
  label,
  isSelected,
  isHighlighted = false,
  onSelect,
}: OptionRowProps): React.ReactElement => {
  const { theme, t } = useUi();
  const { colors } = theme;

  const handlePress = useCallback(() => { onSelect(); }, [onSelect]);

  const isActive = isSelected || isHighlighted;
  const rowStyle = [styles.option, isActive ? { backgroundColor: colors.surfaceElevated } : null];
  const textStyle = [styles.optionText, { color: colors.text }, isSelected ? styles.selectedText : null];

  return (
    <TouchableOpacity
      accessible
      accessibilityHint={t('common.selectOptionHint')}
      accessibilityLabel={label}
      accessibilityRole="button"
      aria-selected={isSelected}
      style={rowStyle}
      testID={testID}
      onPress={handlePress}
    >
      <Text style={textStyle}>{label}</Text>
    </TouchableOpacity>
  );
};

export default OptionRow;
