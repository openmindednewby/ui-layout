import React from 'react';

import { Animated, Pressable, StyleSheet, Text, View, type PressableProps } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { MIN_TARGET_PX } from '../constants';

import { useSlidingIndicator } from './useSlidingIndicator';

import type { SectionIndexEntry } from './types';

export const SECTION_INDEX_WIDTH = 200;
const ACTIVE_BAR = 3;
const TRANSPARENT = 'transparent';
const DENSE_TARGET_PX = 24;
const DENSE_LINE = 19;

const styles = StyleSheet.create({
  root: { flexShrink: 0, gap: 2, alignSelf: 'flex-start' },
  heading: { fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', paddingHorizontal: 10, paddingBottom: 6 },
  item: { minHeight: MIN_TARGET_PX, justifyContent: 'center', paddingHorizontal: 10, borderLeftWidth: ACTIVE_BAR, borderRadius: 6 },
  label: { fontSize: 14 },
  labelActive: { fontWeight: '700' },
  denseRoot: { gap: 2 },
  denseHeading: { fontSize: 11, fontWeight: '600', letterSpacing: 0.66, lineHeight: 16, paddingBottom: 6 },
  denseItem: { minHeight: DENSE_TARGET_PX, paddingVertical: 6, paddingLeft: 7, paddingRight: 10, borderRadius: 7 },
  denseLabel: { fontSize: 13, lineHeight: DENSE_LINE },
  denseLabelActive: { fontWeight: '600' },
  indicator: { position: 'absolute', left: 0, width: ACTIVE_BAR, borderRadius: ACTIVE_BAR },
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
  /** Dense: 11/600 heading, 13/19 px items with 6x10 px padding, 2 px apart. */
  dense?: boolean;
}

export const SectionIndex = ({ sections, activeKey, heading, itemHint, onSelect, testID, width = SECTION_INDEX_WIDTH, activeColor, dense = false }: SectionIndexProps): React.ReactElement => {
  const { theme } = useUi();
  const { colors } = theme;
  const bar = activeColor ?? colors.text;
  const indicator = useSlidingIndicator(sections.findIndex((entry) => entry.key === activeKey));
  const staticBar = indicator.measured ? TRANSPARENT : bar;
  return (
    <View role="navigation" accessibilityLabel={heading} style={[styles.root, dense && styles.denseRoot, { width }]} testID={`${testID}-index`}>
      {indicator.measured ? <Animated.View pointerEvents="none" style={[styles.indicator, { backgroundColor: bar, top: indicator.top, height: indicator.height }]} testID={`${testID}-index-indicator`} /> : null}
      <Text style={[styles.heading, dense && styles.denseHeading, { color: colors.textSecondary }]}>{heading}</Text>
      {sections.map((entry, index) => {
        const active = entry.key === activeKey;
        return (
          <Pressable
            key={entry.key}
            {...ariaCurrent(active)}
            accessibilityRole="link"
            accessibilityLabel={entry.title}
            accessibilityHint={itemHint}
            style={[styles.item, dense && styles.denseItem, { borderLeftColor: active ? staticBar : TRANSPARENT, backgroundColor: active ? colors.surface : TRANSPARENT }]}
            testID={`${testID}-index-${entry.key}`}
            onLayout={indicator.onRowLayout(index)}
            onPress={() => onSelect(entry.key)}
          >
            <Text style={[styles.label, active && styles.labelActive, dense && styles.denseLabel, dense && active && styles.denseLabelActive, { color: active ? colors.text : colors.textSecondary }]}>{entry.title}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};
