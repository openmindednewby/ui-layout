import React from 'react';

import { StyleSheet, View } from 'react-native';

const STEP_WIDTH = 8;
const STEP_OPACITIES = [0.35, 0.65, 0.9] as const;

const styles = StyleSheet.create({
  fade: { bottom: 0, flexDirection: 'row', position: 'absolute', right: 0, top: 0 },
  step: { width: STEP_WIDTH },
});

/** A stepped end-edge fade that hints more content scrolls in from the right. */
export const EdgeFadeStrip = ({ color }: { color: string }): React.ReactElement => (
  <View aria-hidden pointerEvents="none" style={styles.fade}>
    {STEP_OPACITIES.map((opacity) => <View key={opacity} style={[styles.step, { backgroundColor: color, opacity }]} />)}
  </View>
);
