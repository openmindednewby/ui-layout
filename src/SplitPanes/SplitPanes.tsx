import React, { useMemo } from 'react';

import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { LAYOUT_COLLAPSE_BREAKPOINT, LAYOUT_TEST_IDS } from '../constants';

import { isSplitSideBySide } from './isSplitSideBySide';
import { SplitLayout } from './SplitLayout';

const DEFAULT_GAP = 12;
const DEFAULT_WEIGHT = 1;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', width: '100%' },
  column: { flexDirection: 'column', width: '100%' },
  sidePane: { flexBasis: 0, flexShrink: 1, minWidth: 0 },
  stackPane: { width: '100%', minWidth: 0 },
});

export interface SplitPanesProps {
  start: React.ReactNode;
  end: React.ReactNode;
  layout?: SplitLayout;
  startWeight?: number;
  endWeight?: number;
  gap?: number;
  breakpoint?: number;
  testID?: string;
}

/** Two panes; the default Auto stacks below `breakpoint` (phones), pass Side to keep them side by side at 360. */
export const SplitPanes = ({
  start,
  end,
  layout = SplitLayout.Auto,
  startWeight = DEFAULT_WEIGHT,
  endWeight = DEFAULT_WEIGHT,
  gap = DEFAULT_GAP,
  breakpoint = LAYOUT_COLLAPSE_BREAKPOINT,
  testID = LAYOUT_TEST_IDS.splitPanes,
}: SplitPanesProps): React.ReactElement => {
  const { width } = useWindowDimensions();
  const isSide = isSplitSideBySide(layout, width, breakpoint);
  const container = useMemo(() => [isSide ? styles.row : styles.column, { gap }], [isSide, gap]);
  const startStyle = isSide ? [styles.sidePane, { flexGrow: startWeight }] : styles.stackPane;
  const endStyle = isSide ? [styles.sidePane, { flexGrow: endWeight }] : styles.stackPane;

  return (
    <View style={container} testID={testID}>
      <View style={startStyle} testID={`${testID}-start`}>
        {start}
      </View>
      <View style={endStyle} testID={`${testID}-end`}>
        {end}
      </View>
    </View>
  );
};
