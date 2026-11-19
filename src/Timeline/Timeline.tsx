import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { BadgeTone } from '../StatusBadge/BadgeTone';
import { StatusBadge } from '../StatusBadge/StatusBadge';

const styles = StyleSheet.create({
  entry: { borderLeftWidth: 2, gap: 4, paddingBottom: 12, paddingLeft: 12 },
  head: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  time: { fontSize: 13 },
  title: { flexShrink: 1, fontSize: 15, fontWeight: '600' },
});

export interface TimelineEntry {
  key: string;
  time: string;
  title: string;
  accessibilityLabel: string;
  accessibilityHint: string;
  status?: string;
  tone?: BadgeTone;
}

export interface TimelineProps {
  entries: ReadonlyArray<TimelineEntry>;
  accessibilityLabel: string;
  accessibilityHint: string;
  testID?: string;
}

const entryTestId = (testID: string | undefined, key: string): string | undefined => (testID === undefined ? undefined : `${testID}-${key}`);

/** A vertical rail of entries: time, title and an optional status badge per entry, in the given order. */
export const Timeline = ({ entries, accessibilityLabel, accessibilityHint, testID }: TimelineProps): React.ReactElement => {
  const { colors } = useUi().theme;
  return (
    <View accessibilityHint={accessibilityHint} accessibilityLabel={accessibilityLabel} role="list" testID={testID}>
      {entries.map((entry) => (
        <View key={entry.key} accessibilityHint={entry.accessibilityHint} accessibilityLabel={entry.accessibilityLabel} role="listitem"
          style={[styles.entry, { borderLeftColor: colors.border }]} testID={entryTestId(testID, entry.key)}>
          {entry.time === '' ? null : <Text style={[styles.time, { color: colors.textSecondary }]}>{entry.time}</Text>}
          <View style={styles.head}>
            <Text style={[styles.title, { color: colors.text }]}>{entry.title}</Text>
            {entry.status === undefined || entry.status === '' ? null : <StatusBadge label={entry.status} tone={entry.tone ?? BadgeTone.Neutral} />}
          </View>
        </View>
      ))}
    </View>
  );
};

export default Timeline;
