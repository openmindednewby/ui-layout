import React from 'react';

import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

const styles = StyleSheet.create({
  full: { flexBasis: '100%' },
  half: { flexBasis: '45%', flexGrow: 1, minWidth: 0 },
  strip: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});

/** The style of one figure cell: an equal share of the strip when wide, half a row when narrow; span widens it. */
export function figureCell(wide: boolean, span = 1): StyleProp<ViewStyle> {
  if (wide) return { flexBasis: 0, flexGrow: span, minWidth: 0 };
  return span > 1 ? styles.full : styles.half;
}

export interface FigureStripProps {
  children: React.ReactNode;
  testID?: string;
}

/** A row of figure tiles that wraps into two columns when narrow; each child sizes itself with figureCell. */
export const FigureStrip = ({ children, testID }: FigureStripProps): React.ReactElement => (
  <View style={styles.strip} testID={testID}>{children}</View>
);

export default FigureStrip;
