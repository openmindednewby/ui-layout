import React from 'react';

import { StyleSheet, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';
import { SvgIcon } from '@dloizides/ui-icons';

import { StepMarkerNumber } from './StepMarkerNumber';
import { StepMarkerState } from './StepMarkerState';

export const STEP_MARKER_SIZE = 28;
const CHECK_SIZE = 16;
const BORDER = 2;
const ACCENT_STEP = '700';
const styles = StyleSheet.create({
  mark: { alignItems: 'center', borderRadius: STEP_MARKER_SIZE / 2, borderWidth: BORDER, height: STEP_MARKER_SIZE, justifyContent: 'center', width: STEP_MARKER_SIZE },
});

export interface StepMarkerProps {
  state: StepMarkerState;
  number: number;
  testID?: string;
}

/** Atom: the round marker of a step, a check when done, otherwise the step number in the accent when current. */
export const StepMarker = ({ state, number, testID }: StepMarkerProps): React.ReactElement => {
  const { theme } = useUi();
  const accent = theme.palette.primary[ACCENT_STEP] ?? theme.colors.text;
  if (state === StepMarkerState.Done)
    return (
      <View style={[styles.mark, { backgroundColor: accent, borderColor: accent }]} testID={testID}>
        <SvgIcon color={theme.colors.background} name="check" size={CHECK_SIZE} />
      </View>
    );
  const current = state === StepMarkerState.Current;
  return (
    <View style={[styles.mark, { backgroundColor: theme.colors.background, borderColor: current ? accent : theme.colors.border }]} testID={testID}>
      <StepMarkerNumber color={current ? accent : theme.colors.text} value={number} />
    </View>
  );
};
