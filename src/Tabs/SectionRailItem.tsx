import React from 'react';

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { MIN_TARGET_PX } from '../constants';

const BAR_ITEM_HEIGHT = 56;
const DOT_SIZE = 5;
const RAIL_FONT = 15;
const BAR_FONT = 12;
const RAIL_RADIUS = 10;
const RAIL_PAD_H = 12;
const ACCENT_WIDTH = 3;

const styles = StyleSheet.create({
  railItem: { minHeight: MIN_TARGET_PX, justifyContent: 'center', paddingHorizontal: RAIL_PAD_H, borderRadius: RAIL_RADIUS, borderLeftWidth: ACCENT_WIDTH },
  railText: { fontSize: RAIL_FONT, fontWeight: '600' },
  barItem: { flex: 1, minHeight: BAR_ITEM_HEIGHT, minWidth: MIN_TARGET_PX, alignItems: 'center', justifyContent: 'center', gap: 4 },
  dot: { width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE },
  barText: { fontSize: BAR_FONT, fontWeight: '600', textAlign: 'center' },
});

export const enum SectionItemShape {
  Rail = 'rail',
  Bar = 'bar',
}

export interface SectionRailItemProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  shape: SectionItemShape;
  accessibilityHint?: string;
  testID?: string;
}

/** One section entry: a full-width rail row on wide screens, a stacked dot + label slot in the phone bar. */
export const SectionRailItem = ({ label, selected, onPress, shape, accessibilityHint, testID }: SectionRailItemProps): React.ReactElement => {
  const { theme } = useUi();
  const primary = theme.palette.primary['500'];
  const ink = selected ? primary : theme.colors.textSecondary;
  const rail = shape === SectionItemShape.Rail;
  const railLook = { backgroundColor: selected ? theme.colors.surfaceElevated : 'transparent', borderLeftColor: selected ? primary : 'transparent' };
  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={label}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={rail ? [styles.railItem, railLook] : styles.barItem}
      testID={testID}
    >
      {rail ? null : <View style={[styles.dot, { backgroundColor: ink }]} />}
      <Text numberOfLines={1} style={[rail ? styles.railText : styles.barText, { color: ink }]}>{label}</Text>
    </Pressable>
  );
};
