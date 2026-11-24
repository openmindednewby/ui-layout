import React from 'react';

import { Pressable, StyleSheet, Text } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { MIN_TARGET_PX } from '../constants';
import type { UnderlineTab } from './underlineTabTypes';

const UNDERLINE = 3;
const PAD_H = 12;
const CHIP_PAD_H = 16;
const GAP = 6;
const FONT_SIZE = 14;
const COUNT_FONT = 12;
const COUNT_MIN = 22;
const COUNT_PAD = 6;
const PILL = 999;

const styles = StyleSheet.create({
  chip: { alignItems: 'center', borderRadius: PILL, borderWidth: 1, flexDirection: 'row', gap: GAP, justifyContent: 'center', minHeight: MIN_TARGET_PX, minWidth: MIN_TARGET_PX, paddingHorizontal: CHIP_PAD_H },
  chipCount: { fontSize: FONT_SIZE, fontWeight: '700' },
  count: { borderRadius: PILL, fontSize: COUNT_FONT, fontWeight: '700', minWidth: COUNT_MIN, paddingHorizontal: COUNT_PAD, textAlign: 'center' },
  label: { fontSize: FONT_SIZE, fontWeight: '600' },
  tab: { alignItems: 'center', borderBottomWidth: UNDERLINE, flexDirection: 'row', gap: GAP, justifyContent: 'center', minHeight: MIN_TARGET_PX, minWidth: MIN_TARGET_PX, paddingHorizontal: PAD_H },
});

export interface TabItemProps {
  tab: UnderlineTab;
  selected: boolean;
  onChange: (key: string) => void;
  activeText?: string;
}

interface TabPressableProps extends Omit<TabItemProps, 'activeText'> {
  style: React.ComponentProps<typeof Pressable>['style'];
  children: React.ReactNode;
}

const TabPressable = ({ tab, selected, onChange, style, children }: TabPressableProps): React.ReactElement => (
  <Pressable
    accessibilityHint={tab.accessibilityHint}
    accessibilityLabel={tab.label}
    accessibilityRole="tab"
    accessibilityState={{ selected }}
    aria-selected={selected}
    style={style}
    testID={tab.testID}
    onPress={() => onChange(tab.key)}
  >
    {children}
  </Pressable>
);

/** One tab of the underline strip: the selected tab carries the underline colour. */
export const UnderlineTabItem = ({ underline, activeText, ...item }: TabItemProps & { underline: string | undefined }): React.ReactElement => {
  const { theme } = useUi();
  const selectedInk = activeText ?? theme.colors.text;
  return (
    <TabPressable {...item} style={[styles.tab, { borderBottomColor: item.selected ? underline : 'transparent' }]}>
      {item.tab.icon ?? null}
      <Text style={[styles.label, { color: item.selected ? selectedInk : theme.colors.textSecondary }]}>{item.tab.label}</Text>
      {item.tab.count === undefined ? null : <Text style={[styles.count, { backgroundColor: theme.colors.border, color: theme.colors.text }]}>{String(item.tab.count)}</Text>}
    </TabPressable>
  );
};

/** One pill chip of the jump row: selected = filled (`activeFill`, default the text colour), others = 1 px outline. */
export const ChipTabItem = ({ activeFill, activeText, ...item }: TabItemProps & { activeFill?: string }): React.ReactElement => {
  const { theme } = useUi();
  const selectedFill = activeFill ?? theme.colors.text;
  const fill = item.selected ? selectedFill : 'transparent';
  const ink = item.selected ? (activeText ?? theme.colors.background) : theme.colors.text;
  return (
    <TabPressable {...item} style={[styles.chip, { backgroundColor: fill, borderColor: item.selected ? selectedFill : theme.colors.border }]}>
      <Text style={[styles.label, { color: ink }]}>{item.tab.label}</Text>
      {item.tab.count === undefined ? null : <Text style={[styles.chipCount, { color: ink }]}>{String(item.tab.count)}</Text>}
    </TabPressable>
  );
};
