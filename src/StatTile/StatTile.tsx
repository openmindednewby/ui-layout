import React from 'react';

import { StyleSheet, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { AppText } from '../AppText/AppText';
import { TextKind } from '../AppText/TextKind';

const RADIUS = 12;
const PAD = 14;
const GAP = 2;
const BASIS = 150;
const FIGURE_FONT = 24;
const FIGURE_LINE = 32;

const styles = StyleSheet.create({
  tile: { flexGrow: 1, flexBasis: BASIS, minWidth: 0, gap: GAP, padding: PAD, borderWidth: 1, borderRadius: RADIUS },
  figure: { fontSize: FIGURE_FONT, lineHeight: FIGURE_LINE, fontWeight: '700', fontVariant: ['tabular-nums'] },
});

export interface StatTileProps {
  label: string;
  value: string;
  note?: string;
  testID?: string;
}

/** A bordered tile with a muted label, one large tabular figure and an optional muted note below it. */
export const StatTile = ({ label, value, note, testID }: StatTileProps): React.ReactElement => {
  const { theme } = useUi();
  return (
    <View style={[styles.tile, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]} testID={testID}>
      <AppText kind={TextKind.Muted}>{label}</AppText>
      <AppText style={styles.figure} testID={testID === undefined ? undefined : `${testID}-value`}>{value}</AppText>
      {note === undefined ? null : <AppText kind={TextKind.Muted}>{note}</AppText>}
    </View>
  );
};

export default StatTile;
