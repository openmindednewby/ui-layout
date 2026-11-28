import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

const PILL_RADIUS = 999;

const styles = StyleSheet.create({
  aside: { flexShrink: 1, fontSize: 12 },
  card: { borderRadius: 8, borderWidth: 1, gap: 12, minWidth: 0, padding: 16 },
  count: { borderRadius: PILL_RADIUS, fontSize: 12, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 2 },
  head: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  title: { fontSize: 15, fontWeight: '700' },
});

export interface SectionCardProps {
  title: string;
  testID: string;
  count?: string;
  aside?: string;
  children: React.ReactNode;
}

/** A bordered card with a bold title, an optional count pill and an optional muted aside line. */
export const SectionCard = ({ title, testID, count, aside, children }: SectionCardProps): React.ReactElement => {
  const { theme } = useUi();
  const muted = { color: theme.colors.textSecondary };
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]} testID={testID}>
      <View style={styles.head}>
        <Text accessibilityRole="header" style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        {count === undefined ? null : <Text style={[styles.count, muted, { backgroundColor: theme.colors.background }]} testID={`${testID}-count`}>{count}</Text>}
        {aside === undefined ? null : <Text style={[styles.aside, muted]} testID={`${testID}-aside`}>{aside}</Text>}
      </View>
      {children}
    </View>
  );
};
