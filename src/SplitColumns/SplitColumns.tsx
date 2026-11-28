import React, { useState } from 'react';

import { StyleSheet, View } from 'react-native';

const DEFAULT_GAP = 16;

const styles = StyleSheet.create({
  column: { flex: 1, minWidth: 0 },
  row: { alignItems: 'stretch', flexDirection: 'row' },
});

export interface SplitColumnsProps {
  start: React.ReactNode;
  end: React.ReactNode;
  minWidth: number;
  gap?: number;
  testID?: string;
}

/** Whether the measured container is wide enough to put the two columns side by side. */
export function isSplitAt(width: number | null, minWidth: number): boolean {
  return width !== null && width >= minWidth;
}

/** Two equal columns side by side once the container (not the window) is at least minWidth wide, stacked below that. */
export const SplitColumns = ({ start, end, minWidth, gap = DEFAULT_GAP, testID }: SplitColumnsProps): React.ReactElement => {
  const [width, setWidth] = useState<number | null>(null);
  const split = isSplitAt(width, minWidth);
  return (
    <View style={[split ? styles.row : null, { gap }]} testID={testID} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      <View style={split ? styles.column : null}>{start}</View>
      <View style={split ? styles.column : null}>{end}</View>
    </View>
  );
};
