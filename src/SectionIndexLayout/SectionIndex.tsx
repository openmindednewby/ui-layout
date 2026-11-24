import React from 'react';

import { Pressable, StyleSheet, Text, View, type PressableProps } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { MIN_TARGET_PX } from '../constants';

import type { SectionIndexEntry } from './types';

export const SECTION_INDEX_WIDTH = 200;
const ACTIVE_BAR = 3;
const TRANSPARENT = 'transparent';
const DENSE_TARGET_PX = 24;

const styles = StyleSheet.create({
  root: { flexShrink: 0, gap: 2, alignSelf: 'flex-start' },
  heading: { fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', paddingHorizontal: 10, paddingBottom: 6 },
  item: { minHeight: MIN_TARGET_PX, justifyContent: 'center', paddingHorizontal: 10, borderLeftWidth: ACTIVE_BAR, borderRadius: 6 },
  label: { fontSize: 14 },
  labelActive: { fontWeight: '700' },
  denseRoot: { gap: 0 },
  denseHeading: { fontSize: 11, fontWeight: '600', paddingBottom: 10 },
  denseItem: { minHeight: DENSE_TARGET_PX, paddingVertical: 7, paddingHorizontal: 7 },
  denseLabel: { fontSize: 13, lineHeight: 19 },
  denseLabelActive: { fontWeight: '600' },
});

function ariaCurrent(active: boolean): PressableProps & { 'aria-current'?: 'location' } {
  return active ? { 'aria-current': 'location' } : {};
}

export interface SectionIndexProps {
  sections: ReadonlyArray<SectionIndexEntry>;
  activeKey: string;
  heading: string;
  itemHint: string;
  onSelect: (key: string) => void;
  testID: string;
  width?: number;
  activeColor?: string;
  /** Dense: 11/600 heading, 13 px items at a 24 px desktop target. */
  dense?: boolean;
}

export const SectionIndex = ({ sections, activeKey, heading, itemHint, onSelect, testID, width = SECTION_INDEX_WIDTH, activeColor, dense = false }: SectionIndexProps): React.ReactElement => {
  const { theme } = useUi();
  const { colors } = theme;
  const bar = activeColor ?? colors.text;
  return (
    <View role="navigation" accessibilityLabel={heading} style={[styles.root, dense && styles.denseRoot, { width }]} testID={`${testID}-index`}>
      <Text style={[styles.heading, dense && styles.denseHeading, { color: colors.textSecondary }]}>{heading}</Text>
      {sections.map((entry) => {
        const active = entry.key === activeKey;
        return (
          <Pressable
            key={entry.key}
            {...ariaCurrent(active)}
            accessibilityRole="link"
            accessibilityLabel={entry.title}
            accessibilityHint={itemHint}
            style={[styles.item, dense && styles.denseItem, { borderLeftColor: active ? bar : TRANSPARENT, backgroundColor: active ? colors.surface : TRANSPARENT }]}
            testID={`${testID}-index-${entry.key}`}
            onPress={() => onSelect(entry.key)}
          >
            <Text style={[styles.label, active && styles.labelActive, dense && styles.denseLabel, dense && active && styles.denseLabelActive, { color: active ? colors.text : colors.textSecondary }]}>{entry.title}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};
