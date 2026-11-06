import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

const SIZE = 22;
const BORDER = 2;
const GLYPH_SIZE = 14;
const GLYPH_LINE = 16;
const TICK = '✓';

const styles = StyleSheet.create({
  circle: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: { fontSize: GLYPH_SIZE, fontWeight: '700', lineHeight: GLYPH_LINE },
});

interface CheckMarkProps {
  filled: boolean;
  accent: string;
  ring: string;
  glyphColor: string;
  testID?: string;
}

/** The decorative selection circle of the `check` row style. */
export const CheckMark = ({ filled, accent, ring, glyphColor, testID }: CheckMarkProps): React.ReactElement => (
  <View
    aria-hidden
    accessibilityElementsHidden
    importantForAccessibility="no-hide-descendants"
    style={[styles.circle, { borderColor: filled ? accent : ring, backgroundColor: filled ? accent : undefined }]}
    testID={testID}
  >
    {filled ? <Text style={[styles.glyph, { color: glyphColor }]}>{TICK}</Text> : null}
  </View>
);
