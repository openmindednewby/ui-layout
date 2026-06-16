/**
 * Heading — themed section heading text.
 */
import React from 'react';

import { StyleSheet, Text } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { LAYOUT_TEST_IDS } from '../constants';

const styles = StyleSheet.create({
  heading: {
    fontWeight: '700',
    fontSize: 16,
  },
});

export interface HeadingProps {
  text?: string;
  children?: React.ReactNode;
}

export const Heading = ({ text, children }: HeadingProps): React.ReactElement => {
  const { theme } = useUi();

  const headingStyle = React.useMemo(
    () => [styles.heading, { color: theme.colors.text }],
    [theme.colors.text],
  );

  return (
    <Text accessibilityRole="header" style={headingStyle} testID={LAYOUT_TEST_IDS.headingText}>
      {text ?? children}
    </Text>
  );
};

export default Heading;
