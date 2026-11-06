import React, { useMemo, useState } from 'react';

import { Pressable, StyleSheet, Text, View, type PressableProps } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { MIN_TARGET_PX } from '../constants';

import { CheckMark } from './components/CheckMark';
import { ListRowToneContext } from './hooks/useListRowTone';
import { useRowPalette } from './hooks/useRowPalette';
import { RowSelectedStyle } from './RowSelectedStyle';
import { resolveRowLook } from './utils/rowLook';

const FONT = 15;
const PAD_H = 16;
const PAD_V = 12;
const GAP = 4;
const MARK_GAP = 12;
const LINE_GAP = 8;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MARK_GAP,
    paddingHorizontal: PAD_H,
    paddingVertical: PAD_V,
    borderTopWidth: 1,
    minHeight: MIN_TARGET_PX,
  },
  body: { flex: 1, minWidth: 0, gap: GAP },
  line: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: LINE_GAP },
  shrink: { flexShrink: 1, minWidth: 0 },
  strong: { fontSize: FONT, fontWeight: '600' },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP, justifyContent: 'flex-end' },
});

export interface ListRowProps {
  title: React.ReactNode;
  trailing?: React.ReactNode;
  meta?: React.ReactNode;
  badges?: React.ReactNode;
  after?: React.ReactNode;
  selected: boolean;
  selectedStyle?: RowSelectedStyle;
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint: string;
  testID?: string;
}

interface WebPressState {
  pressed: boolean;
  hovered?: boolean;
}

function pressedProps(selected: boolean): PressableProps & { 'aria-pressed': boolean } {
  return { 'aria-pressed': selected };
}

function slot(node: React.ReactNode, color: string, strong: boolean): React.ReactNode {
  if (typeof node !== 'string') return node;
  return <Text style={[styles.shrink, strong ? styles.strong : null, { color }]}>{node}</Text>;
}

/** A selectable list row with title, trailing, meta and badge slots and one selected-style setting. */
export const ListRow = ({
  title,
  trailing,
  meta,
  badges,
  after,
  selected,
  selectedStyle = RowSelectedStyle.Surface,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: ListRowProps): React.ReactElement => {
  const palette = useRowPalette();
  const { colors } = useUi().theme;
  const [focused, setFocused] = useState(false);
  const rest = resolveRowLook(selectedStyle, { selected, hovered: false, pressed: false, focused }, palette);
  const tone = useMemo(() => ({ textColor: rest.textColor, inverse: rest.inverse }), [rest.textColor, rest.inverse]);
  const checkTestId = testID === undefined ? undefined : `${testID}-check`;
  return (
    <ListRowToneContext.Provider value={tone}>
      <Pressable
        accessibilityHint={accessibilityHint}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        style={(state) => {
          const { pressed, hovered } = state as WebPressState;
          const look = resolveRowLook(selectedStyle, { selected, pressed, focused, hovered: hovered === true }, palette);
          return [styles.row, { borderTopColor: colors.border }, look.container];
        }}
        testID={testID}
        onBlur={() => {
          setFocused(false);
        }}
        onFocus={() => {
          setFocused(true);
        }}
        onPress={onPress}
        {...pressedProps(selected)}
      >
        {rest.showCheck ? (
          <CheckMark accent={palette.accent} filled={rest.checkFilled} glyphColor={palette.background} ring={palette.border} testID={checkTestId} />
        ) : null}
        <View style={styles.body}>
          <View style={styles.line}>
            {slot(title, rest.titleColor, true)}
            {slot(trailing, rest.textColor, true)}
          </View>
          <View style={styles.line}>
            <View style={styles.shrink}>{slot(meta, rest.textColor, false)}</View>
            {badges === undefined ? null : <View style={styles.badges}>{badges}</View>}
          </View>
        </View>
      </Pressable>
      {after ?? null}
    </ListRowToneContext.Provider>
  );
};
