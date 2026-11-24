import React from 'react';

import { Pressable, ScrollView, StyleSheet, Text, View, type PressableProps } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { MIN_TARGET_PX } from '../constants';

import { ChipOverflow } from './ChipOverflow';

import type { SectionIndexEntry } from './types';

const styles = StyleSheet.create({
  root: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  scrollRow: { flexDirection: 'row', flexWrap: 'nowrap', gap: 8 },
  chip: { minHeight: MIN_TARGET_PX, justifyContent: 'center', paddingHorizontal: 14, borderRadius: 999, borderWidth: 1 },
  label: { fontSize: 14, fontWeight: '600' },
  denseRow: { gap: 6 },
  denseChip: { paddingHorizontal: 12 },
  denseLabel: { fontSize: 13 },
});

function ariaSelected(selected: boolean): PressableProps & { 'aria-selected': boolean } {
  return { 'aria-selected': selected };
}

function activeInk(active: boolean, dense: boolean, colors: { background: string; surface: string; text: string }): string {
  if (!active) return colors.text;
  return dense ? colors.surface : colors.background;
}

export interface SectionChipsProps {
  sections: ReadonlyArray<SectionIndexEntry>;
  activeKey: string;
  groupLabel: string;
  itemHint: string;
  overflow?: ChipOverflow;
  activeColor?: string;
  /** Dense: 13 px labels, 12 px chip padding, 6 px gutter, active label on the surface colour. */
  dense?: boolean;
  onSelect: (key: string) => void;
  testID: string;
}

export const SectionChips = ({ sections, activeKey, groupLabel, itemHint, overflow = ChipOverflow.Wrap, activeColor, dense = false, onSelect, testID }: SectionChipsProps): React.ReactElement => {
  const { theme } = useUi();
  const { colors } = theme;
  const fill = activeColor ?? colors.text;
  const scroll = overflow === ChipOverflow.Scroll;
  const row = (
    <View accessibilityRole="tablist" accessibilityLabel={groupLabel} style={[scroll ? styles.scrollRow : styles.root, dense && styles.denseRow]} testID={`${testID}-chips`}>
      {sections.map((entry) => {
        const active = entry.key === activeKey;
        return (
          <Pressable
            key={entry.key}
            {...ariaSelected(active)}
            accessibilityRole="tab"
            accessibilityLabel={entry.title}
            accessibilityHint={itemHint}
            style={[styles.chip, dense && styles.denseChip, { borderColor: colors.border, backgroundColor: active ? fill : colors.background }]}
            testID={`${testID}-chip-${entry.key}`}
            onPress={() => onSelect(entry.key)}
          >
            <Text style={[styles.label, dense && styles.denseLabel, { color: activeInk(active, dense, colors) }]}>{entry.title}</Text>
          </Pressable>
        );
      })}
    </View>
  );
  return scroll ? <ScrollView horizontal showsHorizontalScrollIndicator={false}>{row}</ScrollView> : row;
};
