import React, { useMemo } from 'react';

import { StyleSheet, View } from 'react-native';

import { Accordion } from '../Accordion/Accordion';
import { AccordionItem } from '../Accordion/AccordionItem';
import { CountBadge } from '../CountBadge/CountBadge';

import { groupItems, type GroupKey } from './groupItems';

const STACK_GAP = 16;
const FIGURES_GAP = 12;
const DEFAULT_TEST_ID = 'folding-groups';

const styles = StyleSheet.create({
  stack: { gap: STACK_GAP, alignSelf: 'stretch' },
  figures: { flexDirection: 'row', flexWrap: 'wrap', gap: FIGURES_GAP },
});

export interface FoldingGroupsLabels {
  count?: (count: number, title: string) => string;
  toggleHint?: string;
}

export interface FoldingGroupsProps<T> {
  items: readonly T[];
  groupOf: (item: T) => GroupKey;
  rowKey: (item: T) => string;
  renderRow: (item: T, index: number) => React.ReactNode;
  figures?: React.ReactNode;
  empty?: React.ReactNode;
  defaultOpenIds?: readonly string[];
  openIds?: readonly string[];
  onOpenChange?: (openIds: string[]) => void;
  allowMultiple?: boolean;
  labels?: FoldingGroupsLabels;
  testID?: string;
}

/** Rows grouped under folding headers, each with a count badge; all groups start open by default. */
export function FoldingGroups<T>({
  items,
  groupOf,
  rowKey,
  renderRow,
  figures,
  empty,
  defaultOpenIds,
  openIds,
  onOpenChange,
  allowMultiple = true,
  labels,
  testID = DEFAULT_TEST_ID,
}: FoldingGroupsProps<T>): React.ReactElement {
  const groups = useMemo(() => groupItems(items, groupOf), [items, groupOf]);
  const initialOpen = useMemo(
    () => defaultOpenIds ?? groups.map((group) => group.id),
    [defaultOpenIds, groups],
  );
  const hasGroups = groups.length > 0;

  return (
    <View style={styles.stack} testID={testID}>
      {figures !== undefined ? (
        <View style={styles.figures} testID={`${testID}-figures`}>
          {figures}
        </View>
      ) : null}
      {hasGroups ? (
        <Accordion
          allowMultiple={allowMultiple}
          defaultOpenIds={initialOpen}
          openIds={openIds}
          testID={`${testID}-list`}
          onOpenChange={onOpenChange}
        >
          {groups.map((group) => {
            const count = group.items.length;
            return (
              <AccordionItem
                key={group.id}
                accessibilityHint={labels?.toggleHint}
                accessibilityLabel={labels?.count?.(count, group.title) ?? group.title}
                id={group.id}
                right={<CountBadge count={count} testID={`${testID}-count-${group.id}`} />}
                testID={`${testID}-group-${group.id}`}
                title={group.title}
              >
                {group.items.map((item, index) => (
                  <React.Fragment key={rowKey(item)}>{renderRow(item, index)}</React.Fragment>
                ))}
              </AccordionItem>
            );
          })}
        </Accordion>
      ) : (
        (empty ?? null)
      )}
    </View>
  );
}

export default FoldingGroups;
