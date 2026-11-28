import React from 'react';

import { StyleSheet, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { STEP_MARKER_SIZE, StepMarker } from './StepMarker';

import type { StepMarkerState } from './StepMarkerState';

const GAP = 12;
const LINE_WIDTH = 2;
const LINE_TOP = 4;
const styles = StyleSheet.create({
  body: { flex: 1, minWidth: 0 },
  line: { flex: 1, marginTop: LINE_TOP, width: LINE_WIDTH },
  rail: { alignItems: 'center', width: STEP_MARKER_SIZE },
  step: { flexDirection: 'row', gap: GAP },
});

export interface TimelineStepProps {
  state: StepMarkerState;
  number: number;
  isLast: boolean;
  testID: string;
  markerTestID?: string;
  lineTestID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  children: React.ReactNode;
}

/** Molecule: one step of a vertical progress rail, its marker and the line to the next step beside the body slot. */
export const TimelineStep = ({
  state, number, isLast, testID, markerTestID, lineTestID, accessibilityLabel, accessibilityHint, children,
}: TimelineStepProps): React.ReactElement => {
  const { colors } = useUi().theme;
  return (
    <View accessibilityHint={accessibilityHint} accessibilityLabel={accessibilityLabel} style={styles.step} testID={testID}>
      <View style={styles.rail}>
        <StepMarker number={number} state={state} testID={markerTestID ?? `${testID}-marker`} />
        {isLast ? null : <View style={[styles.line, { backgroundColor: colors.border }]} testID={lineTestID ?? `${testID}-line`} />}
      </View>
      <View style={styles.body}>{children}</View>
    </View>
  );
};
