import React from 'react';

import { StyleSheet, Text } from 'react-native';

const NUMBER_SIZE = 13;
const NUMBER_LINE = 16;
const styles = StyleSheet.create({
  number: { fontSize: NUMBER_SIZE, fontWeight: '700', lineHeight: NUMBER_LINE },
});

/** Atom: the step number printed inside a step marker, in the given colour. */
export const StepMarkerNumber = ({ value, color }: { value: number; color: string }): React.ReactElement => (
  <Text style={[styles.number, { color }]}>{String(value)}</Text>
);
