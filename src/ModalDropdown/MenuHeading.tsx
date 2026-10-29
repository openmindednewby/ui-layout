import React from 'react';

import { StyleSheet, Text } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

const HEADING_FONT_SIZE = 12;
const HEADING_FONT_WEIGHT = '600' as const;
const HEADING_PADDING_H = 16;
const HEADING_PADDING_TOP = 8;
const HEADING_PADDING_BOTTOM = 4;
const HEADING_LETTER_SPACING = 0.5;

const styles = StyleSheet.create({
  heading: {
    fontSize: HEADING_FONT_SIZE,
    fontWeight: HEADING_FONT_WEIGHT,
    letterSpacing: HEADING_LETTER_SPACING,
    paddingHorizontal: HEADING_PADDING_H,
    paddingTop: HEADING_PADDING_TOP,
    paddingBottom: HEADING_PADDING_BOTTOM,
  },
});

export interface MenuHeadingProps {
  testID: string;
  text: string;
}

/** Visible, non-focusable heading shown at the top of an open dropdown menu. */
export const MenuHeading = ({ testID, text }: MenuHeadingProps): React.ReactElement => {
  const { theme } = useUi();

  return (
    <Text
      accessibilityRole="header"
      style={[styles.heading, { color: theme.colors.textSecondary }]}
      testID={`${testID}-menu-heading`}
    >
      {text}
    </Text>
  );
};

export default MenuHeading;
