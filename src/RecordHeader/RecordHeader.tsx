import React from 'react';

import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { isRecordHeaderCompact } from './recordHeaderLayout';

const GAP = 8;
const WIDE_GAP = 16;

const styles = StyleSheet.create({
  actions: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: GAP, justifyContent: 'flex-end' },
  compactActions: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  identity: { flex: 1, gap: GAP, minWidth: 0 },
  root: { gap: GAP },
  top: { alignItems: 'flex-start', flexDirection: 'row', gap: WIDE_GAP },
});

export interface RecordHeaderProps {
  breadcrumb?: React.ReactNode;
  title: React.ReactNode;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  collapseBelow?: number;
  testID?: string;
}

/** A record page header: breadcrumb, title and id meta left, record actions top right; stacked on a phone. */
export const RecordHeader = ({ breadcrumb, title, meta, actions, collapseBelow, testID }: RecordHeaderProps): React.ReactElement => {
  const compact = isRecordHeaderCompact(useWindowDimensions().width, collapseBelow);
  const actionRow = actions === undefined ? null : <View style={compact ? styles.compactActions : styles.actions}>{actions}</View>;
  return (
    <View style={styles.root} testID={testID}>
      <View style={compact ? styles.root : styles.top}>
        <View style={styles.identity}>
          {breadcrumb}
          {title}
          {meta}
        </View>
        {actionRow}
      </View>
    </View>
  );
};

export default RecordHeader;
