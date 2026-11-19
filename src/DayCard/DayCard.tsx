import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { BadgeTone } from '../StatusBadge/BadgeTone';
import { StatusBadge } from '../StatusBadge/StatusBadge';

const PILL_RADIUS = 999;

const styles = StyleSheet.create({
  body: { borderRadius: 8, borderWidth: 1, overflow: 'hidden' },
  count: { borderRadius: PILL_RADIUS, borderWidth: 1, fontSize: 12, fontWeight: '700', paddingHorizontal: 8 },
  head: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  label: { fontSize: 13, fontWeight: '600' },
  stack: { gap: 6 },
});

export interface DayCardProps {
  label: string;
  badge: string;
  count: number;
  accessibilityLabel: string;
  accessibilityHint: string;
  badgeTone?: BadgeTone;
  testID?: string;
  children: React.ReactNode;
}

/** One day of a list: its label, an age badge and the item count over a card holding the day's rows. */
export const DayCard = ({
  label,
  badge,
  count,
  accessibilityLabel,
  accessibilityHint,
  badgeTone = BadgeTone.Warning,
  testID,
  children,
}: DayCardProps): React.ReactElement => {
  const { theme } = useUi();
  const { colors } = theme;
  return (
    <View style={styles.stack} testID={testID}>
      <View accessibilityHint={accessibilityHint} accessibilityLabel={accessibilityLabel} accessibilityRole="header" style={styles.head}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        <StatusBadge label={badge} tone={badgeTone} />
        <Text style={[styles.count, { borderColor: colors.border, color: colors.textSecondary }]}>{String(count)}</Text>
      </View>
      <View style={[styles.body, { backgroundColor: colors.surface, borderColor: colors.border }]}>{children}</View>
    </View>
  );
};

export default DayCard;
