import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

const DEFAULT_LABEL_WIDTH = 120;
const VALUE_BASIS = 160;

const styles = StyleSheet.create({
  label: { fontSize: 13, lineHeight: 22 },
  row: { alignItems: 'flex-start', flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingVertical: 4 },
  value: { flexBasis: VALUE_BASIS, flexGrow: 1, flexShrink: 1, gap: 4, minWidth: 0 },
});

export interface LabelValueLineProps {
  label: string;
  testID: string;
  children: React.ReactNode;
  labelWidth?: number;
}

/** A label-left, value-right fact line; the value slot wraps under the label when the row is narrow. */
export const LabelValueLine = ({ label, testID, children, labelWidth = DEFAULT_LABEL_WIDTH }: LabelValueLineProps): React.ReactElement => {
  const { theme } = useUi();
  return (
    <View style={styles.row} testID={testID}>
      <Text style={[styles.label, { color: theme.colors.textSecondary, width: labelWidth }]} testID={`${testID}-label`}>{label}</Text>
      <View style={styles.value} testID={`${testID}-value`}>{children}</View>
    </View>
  );
};
