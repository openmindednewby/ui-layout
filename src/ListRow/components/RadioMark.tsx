import React from 'react';

import { StyleSheet, View } from 'react-native';

const SIZE = 22;
const BORDER = 2;
const DOT = 10;

const styles = StyleSheet.create({
  ring: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { width: DOT, height: DOT, borderRadius: DOT / 2 },
});

interface RadioMarkProps {
  filled: boolean;
  accent: string;
  ring: string;
  testID?: string;
}

/** The decorative radio circle of the `radio` row style; the row itself carries the radio role. */
export const RadioMark = ({ filled, accent, ring, testID }: RadioMarkProps): React.ReactElement => (
  <View
    aria-hidden
    accessibilityElementsHidden
    importantForAccessibility="no-hide-descendants"
    style={[styles.ring, { borderColor: filled ? accent : ring }]}
    testID={testID}
  >
    {filled ? <View style={[styles.dot, { backgroundColor: accent }]} testID={testID === undefined ? undefined : `${testID}-dot`} /> : null}
  </View>
);
