import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

const styles = StyleSheet.create({
  glyph: { fontSize: 13 },
  label: { fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  row: { alignItems: 'center', flexDirection: 'row', gap: 8, paddingVertical: 4 },
});

export interface SectionLabelProps {
  label: string;
  glyph?: string;
  testID?: string;
}

/** A small uppercase section heading, led by an optional decorative glyph. */
export const SectionLabel = ({ label, glyph, testID }: SectionLabelProps): React.ReactElement => {
  const color = { color: useUi().theme.colors.textSecondary };
  return (
    <View style={styles.row} testID={testID}>
      {glyph === undefined ? null : <Text accessibilityElementsHidden importantForAccessibility="no" style={[styles.glyph, color]}>{glyph}</Text>}
      <Text accessibilityRole="header" style={[styles.label, color]}>{label}</Text>
    </View>
  );
};
