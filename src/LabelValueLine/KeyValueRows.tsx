import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

const DEFAULT_LABEL_WIDTH = 140;

export interface KeyValueRow {
  key: string;
  label: string;
  value: string;
}

export interface KeyValueRowsProps {
  rows: readonly KeyValueRow[];
  testID?: string;
  labelWidth?: number;
}

const styles = StyleSheet.create({
  label: { fontSize: 13 },
  row: { columnGap: 12, flexDirection: 'row', paddingVertical: 2 },
  value: { flexShrink: 1, fontSize: 13 },
});

/** Labelled values in two aligned columns, one row per fact; each row is `${testID}-${key}`. */
export const KeyValueRows = ({ rows, testID, labelWidth = DEFAULT_LABEL_WIDTH }: KeyValueRowsProps): React.ReactElement => {
  const { theme } = useUi();
  return (
    <View testID={testID}>
      {rows.map((row) => (
        <View key={row.key} style={styles.row} testID={testID === undefined ? undefined : `${testID}-${row.key}`}>
          <Text style={[styles.label, { color: theme.colors.textSecondary, width: labelWidth }]}>{row.label}</Text>
          <Text style={[styles.value, { color: theme.colors.text }]}>{row.value}</Text>
        </View>
      ))}
    </View>
  );
};
