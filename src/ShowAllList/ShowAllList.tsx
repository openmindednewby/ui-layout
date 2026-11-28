import React, { useState } from 'react';

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { visibleRows } from './visibleRows';

const MIN_HIT = 44;
const LINK_STEP = '600';

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600' },
  root: { gap: 4 },
  toggle: { alignSelf: 'flex-start', justifyContent: 'center', minHeight: MIN_HIT, minWidth: MIN_HIT },
});

export interface ShowAllListProps<T> {
  rows: readonly T[];
  limit: number;
  testID: string;
  showAllLabel: string;
  showFewerLabel: string;
  toggleHint: string;
  children: (shown: T[]) => React.ReactNode;
}

/** The first `limit` rows with a Show all / Show fewer toggle (`${testID}-toggle`) when there are more. */
export const ShowAllList = <T,>({ rows, limit, testID, showAllLabel, showFewerLabel, toggleHint, children }: ShowAllListProps<T>): React.ReactElement => {
  const { theme } = useUi();
  const [expanded, setExpanded] = useState(false);
  const slice = visibleRows(rows, limit, expanded);
  const label = expanded ? showFewerLabel : showAllLabel;
  return (
    <View style={styles.root} testID={testID}>
      {children(slice.rows)}
      {slice.collapsible ? (
        <Pressable accessibilityHint={toggleHint} accessibilityLabel={label} accessibilityRole="button" accessibilityState={{ expanded }} style={styles.toggle} testID={`${testID}-toggle`} onPress={() => setExpanded((open) => !open)}>
          <Text style={[styles.label, { color: theme.palette.primary[LINK_STEP] ?? theme.colors.text }]}>{label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
};
