import React from 'react';

import { StyleSheet, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { AppText } from '../AppText/AppText';
import { TextKind } from '../AppText/TextKind';

const GAP = 12;
const PAD_H = 16;
const PAD_V = 10;
const NOTES_GAP = 2;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: GAP, paddingHorizontal: PAD_H, paddingVertical: PAD_V, borderTopWidth: 1 },
  first: { borderTopWidth: 0 },
  grow: { flex: 1, minWidth: 0, gap: NOTES_GAP },
  value: { flexShrink: 0, textAlign: 'right' },
});

export interface FactRowProps {
  label: string;
  value: string;
  first?: boolean;
  testID?: string;
  children?: React.ReactNode;
}

/** One FactCard row: a strong label with optional notes below it and its value on the right; `first` drops the top divider. */
export const FactRow = ({ label, value, first = false, testID, children }: FactRowProps): React.ReactElement => {
  const { theme } = useUi();
  return (
    <View style={[styles.row, { borderColor: theme.colors.border }, first && styles.first]} testID={testID}>
      <View style={styles.grow}>
        <AppText kind={TextKind.Strong}>{label}</AppText>
        {children}
      </View>
      <AppText style={styles.value} testID={testID === undefined ? undefined : `${testID}-value`}>{value}</AppText>
    </View>
  );
};

export default FactRow;
