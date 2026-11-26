import React, { useMemo, useState } from 'react';

import { Pressable, StyleSheet, Text, View, type PressableProps } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { MIN_TARGET_PX } from '../constants';

import { CheckMark } from './components/CheckMark';
import { RadioMark } from './components/RadioMark';
import { ListRowToneContext } from './hooks/useListRowTone';
import { useRowPalette } from './hooks/useRowPalette';
import { RowSelectedStyle } from './RowSelectedStyle';
import { isFocusVisible } from './utils/focusVisible';
import { resolveRowLook, type RowLook, type RowPalette } from './utils/rowLook';
import { TITLE_LINE, TITLE_WRAP, TRAILING_END } from './utils/titleWrap';

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
  trailing: { flexShrink: 0, ...TRAILING_END },
  strong: { fontSize: FONT, fontWeight: '600' },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP, justifyContent: 'flex-end' },
});

export interface ListRowProps {
  title: React.ReactNode;
  trailing?: React.ReactNode;
  meta?: React.ReactNode;
  badges?: React.ReactNode;
  after?: React.ReactNode;
  divider?: boolean;
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

function pressedProps(selected: boolean, radio: boolean): PressableProps & { 'aria-pressed'?: boolean; 'aria-checked'?: boolean } {
  if (radio) return { accessibilityRole: 'radio', accessibilityState: { checked: selected }, 'aria-checked': selected };
  return { accessibilityRole: 'button', accessibilityState: { selected }, 'aria-pressed': selected };
}

function selectionMark(look: RowLook, palette: RowPalette, testID: string | undefined): React.ReactNode {
  if (look.showCheck) {
    const id = testID === undefined ? undefined : `${testID}-check`;
    return <CheckMark accent={palette.accent} filled={look.checkFilled} glyphColor={palette.background} ring={palette.border} testID={id} />;
  }
  if (!look.showRadio) return null;
  const id = testID === undefined ? undefined : `${testID}-radio`;
  return <RadioMark accent={palette.accent} filled={look.radioFilled} ring={palette.border} testID={id} />;
}

function focusTarget(event: unknown): unknown {
  return (event as { nativeEvent?: { target?: unknown } } | undefined)?.nativeEvent?.target;
}

function metaSlot(node: React.ReactNode, color: string): React.ReactNode {
  if (typeof node !== 'string') return node;
  return <Text style={[styles.shrink, { color }]}>{node}</Text>;
}

function titleSlot(node: React.ReactNode, color: string): React.ReactNode {
  if (typeof node !== 'string') return node;
  return <Text style={[styles.strong, { color }, TITLE_WRAP]}>{node}</Text>;
}

function trailingSlot(node: React.ReactNode, color: string, testID: string | undefined): React.ReactNode {
  if (node === undefined) return null;
  const id = testID === undefined ? undefined : `${testID}-trailing`;
  if (typeof node !== 'string') return <View style={styles.trailing} testID={id}>{node}</View>;
  return <Text numberOfLines={1} style={[styles.trailing, styles.strong, { color }]} testID={id}>{node}</Text>;
}

/** A selectable list row with title, trailing, meta and badge slots, one selected-style setting (radio announces as a radio) and an optional top divider. */
export const ListRow = ({
  title,
  trailing,
  meta,
  badges,
  after,
  divider = true,
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
  return (
    <ListRowToneContext.Provider value={tone}>
      <Pressable
        accessibilityHint={accessibilityHint}
        accessibilityLabel={accessibilityLabel}
        style={(state) => {
          const { pressed, hovered } = state as WebPressState;
          const look = resolveRowLook(selectedStyle, { selected, pressed, focused, hovered: hovered === true }, palette);
          return [styles.row, { borderTopColor: colors.border, borderTopWidth: divider ? 1 : 0 }, look.container];
        }}
        testID={testID}
        onBlur={() => {
          setFocused(false);
        }}
        onFocus={(event) => {
          setFocused(isFocusVisible(focusTarget(event)));
        }}
        onPress={onPress}
        {...pressedProps(selected, selectedStyle === RowSelectedStyle.Radio)}
      >
        {selectionMark(rest, palette, testID)}
        <View style={styles.body}>
          <View style={[styles.line, TITLE_LINE]}>
            {titleSlot(title, rest.titleColor)}
            {trailingSlot(trailing, rest.textColor, testID)}
          </View>
          <View style={styles.line}>
            <View style={styles.shrink}>{metaSlot(meta, rest.textColor)}</View>
            {badges === undefined ? null : <View style={styles.badges}>{badges}</View>}
          </View>
        </View>
      </Pressable>
      {after ?? null}
    </ListRowToneContext.Provider>
  );
};
