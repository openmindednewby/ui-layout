import React, { useMemo } from 'react';

import { Platform, StyleSheet, Text, View, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { isWideWebViewport } from '../responsive';

const STRIP_GAP = 12;
const CELL_PADDING = 12;
const CELL_RADIUS = 8;
const CELL_GAP = 4;
const NARROW_BASIS = '45%';
const WIDE_MIN_WIDTH = 160;
const LABEL_FONT_SIZE = 12;
const VALUE_FONT_SIZE = 15;
const STRONG_WEIGHT = '600' as const;
const DEFAULT_TEST_ID = 'facts-strip';

const styles = StyleSheet.create({
  strip: { flexDirection: 'row', flexWrap: 'wrap', gap: STRIP_GAP },
  cell: { borderWidth: 1, borderRadius: CELL_RADIUS, padding: CELL_PADDING, gap: CELL_GAP, flexGrow: 1 },
  narrowCell: { flexBasis: NARROW_BASIS },
  wideCell: { minWidth: WIDE_MIN_WIDTH },
  label: { fontSize: LABEL_FONT_SIZE, fontWeight: STRONG_WEIGHT },
  value: { fontSize: VALUE_FONT_SIZE, fontWeight: STRONG_WEIGHT, fontVariant: ['tabular-nums'] },
});

export interface Fact {
  id: string;
  label: string;
  value: React.ReactNode;
}

export interface FactsStripProps {
  facts: readonly Fact[];
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** A wrapping list of label-over-value fact cells: two per row on a phone, at least 160 px each when wide. */
export const FactsStrip = ({ facts, style, testID = DEFAULT_TEST_ID }: FactsStripProps): React.ReactElement => {
  const { theme } = useUi();
  const { colors } = theme;
  const { width } = useWindowDimensions();
  const wide = isWideWebViewport(width, Platform.OS);
  const cellStyle = useMemo(
    () => [
      styles.cell,
      wide ? styles.wideCell : styles.narrowCell,
      { borderColor: colors.border, backgroundColor: colors.surface },
    ],
    [wide, colors.border, colors.surface],
  );

  return (
    <View role="list" style={[styles.strip, style]} testID={testID}>
      {facts.map((fact) => (
        <View key={fact.id} role="listitem" style={cellStyle} testID={`${testID}-${fact.id}`}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{fact.label}</Text>
          {typeof fact.value === 'string' || typeof fact.value === 'number' ? (
            <Text style={[styles.value, { color: colors.text }]}>{fact.value}</Text>
          ) : (
            fact.value
          )}
        </View>
      ))}
    </View>
  );
};

export default FactsStrip;
