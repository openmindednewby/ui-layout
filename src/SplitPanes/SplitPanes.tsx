import React, { useMemo } from 'react';

import { StyleSheet, View, useWindowDimensions, type ViewStyle } from 'react-native';

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
  fixedPane: { flexGrow: 0, flexShrink: 0, minWidth: 0 },
});

function sidePaneStyle(weight: number, fixedWidth: number | undefined): ViewStyle[] {
  if (fixedWidth === undefined) return [styles.sidePane, { flexGrow: weight }];
  return [styles.fixedPane, { width: fixedWidth }];
}

export interface SplitPanesProps {
  start: React.ReactNode;
  end: React.ReactNode;
  layout?: SplitLayout;
  startWeight?: number;
  endWeight?: number;
  startWidth?: number;
  endWidth?: number;
  gap?: number;
  breakpoint?: number;
  testID?: string;
}

/** Two panes; the default Auto stacks below `breakpoint` (phones), pass Side to keep them side by side at 360.
 * `startWidth` / `endWidth` fix that pane (a rail) at that width while side by side; stacked it stays full width. */
export const SplitPanes = ({
  start,
  end,
  layout = SplitLayout.Auto,
  startWeight = DEFAULT_WEIGHT,
  endWeight = DEFAULT_WEIGHT,
  startWidth,
  endWidth,
  gap = DEFAULT_GAP,
  breakpoint = LAYOUT_COLLAPSE_BREAKPOINT,
  testID = LAYOUT_TEST_IDS.splitPanes,
}: SplitPanesProps): React.ReactElement => {
  const { width } = useWindowDimensions();
  const isSide = isSplitSideBySide(layout, width, breakpoint);
  const container = useMemo(() => [isSide ? styles.row : styles.column, { gap }], [isSide, gap]);
  const startStyle = isSide ? sidePaneStyle(startWeight, startWidth) : styles.stackPane;
  const endStyle = isSide ? sidePaneStyle(endWeight, endWidth) : styles.stackPane;

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
