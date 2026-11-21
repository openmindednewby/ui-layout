import React from 'react';

import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { TotalsTone } from './TotalsTone';
import { LAYOUT_COLLAPSE_BREAKPOINT } from '../constants';
import { FigureStrip, figureCell } from '../FigureStrip/FigureStrip';

const LABEL_SIZE = 13;
const VALUE_SIZE = 20;
const CAPTION_SIZE = 13;
const TILE_PAD = 12;
const TILE_RADIUS = 10;
const TILE_GAP = 2;
const ALERT_STEP = '500';

const styles = StyleSheet.create({
  tile: { padding: TILE_PAD, borderRadius: TILE_RADIUS, borderWidth: StyleSheet.hairlineWidth, gap: TILE_GAP },
  label: { fontSize: LABEL_SIZE, fontWeight: '600' },
  value: { fontSize: VALUE_SIZE, fontWeight: '700' },
  caption: { fontSize: CAPTION_SIZE },
});

/** One total: pre-localized label, formatted value and an optional caption. */
export interface TotalsItem {
  key: string;
  label: string;
  value: string;
  caption?: string;
  tone?: TotalsTone;
}

export interface TotalsStripProps {
  items: readonly TotalsItem[];
  breakpoint?: number;
  testID: string;
}

/** A row of total tiles: one row when wide, two per row when narrow. */
export const TotalsStrip = ({ items, breakpoint = LAYOUT_COLLAPSE_BREAKPOINT, testID }: TotalsStripProps): React.ReactElement => {
  const { theme } = useUi();
  const { colors } = theme;
  const { width } = useWindowDimensions();
  const wide = width >= breakpoint;

  return (
    <FigureStrip testID={testID}>
      {items.map((item) => (
        <View
          key={item.key}
          style={[styles.tile, figureCell(wide), { borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}
          testID={`${testID}-${item.key}`}
        >
          <Text style={[styles.label, { color: colors.textSecondary }]}>{item.label}</Text>
          <Text
            style={[styles.value, { color: item.tone === TotalsTone.Alert ? theme.semantic.error[ALERT_STEP] : colors.text }]}
            testID={`${testID}-${item.key}-value`}
          >
            {item.value}
          </Text>
          {item.caption !== undefined && <Text style={[styles.caption, { color: colors.textSecondary }]}>{item.caption}</Text>}
        </View>
      ))}
    </FigureStrip>
  );
};

export default TotalsStrip;
