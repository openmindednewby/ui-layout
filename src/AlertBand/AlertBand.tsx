import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { BannerTone } from '../InlineBanner/BannerTone';
import { resolveBannerColors } from '../InlineBanner/bannerColors';

import type { UiTheme } from '@dloizides/ui-feedback';

const RADIUS = 8;

const styles = StyleSheet.create({
  action: { gap: 8 },
  actionWide: { alignItems: 'flex-end' },
  head: { alignItems: 'flex-start', flex: 1, flexDirection: 'row', gap: 10, minWidth: 0 },
  reason: { fontSize: 13 },
  row: { borderRadius: RADIUS, borderWidth: 1, gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  rowWide: { alignItems: 'center', flexDirection: 'row' },
  text: { flex: 1, gap: 2, minWidth: 0 },
  title: { fontSize: 15, fontWeight: '700' },
});

export interface AlertBandColors {
  background: string;
  border: string;
  text: string;
  muted: string;
}

export interface AlertBandProps {
  title: string;
  wide: boolean;
  tone?: BannerTone;
  colors?: AlertBandColors;
  icon?: React.ReactNode;
  reason?: string;
  action?: React.ReactNode;
  testID?: string;
}

/** The band colours: the given ones, else the tone's banner wash with the theme's secondary text as the muted line. */
export function alertBandColorsOf(theme: UiTheme, tone: BannerTone, colors?: AlertBandColors): AlertBandColors {
  if (colors !== undefined) return colors;
  const banner = resolveBannerColors(theme, tone);
  return { background: banner.fill, border: banner.border, text: banner.ink, muted: theme.colors.textSecondary };
}

/** A tinted alert band: icon, bold title and one-line reason on the left, the action that settles it on the right (under it when narrow). */
export const AlertBand = ({ title, wide, tone = BannerTone.Info, colors, icon, reason, action, testID }: AlertBandProps): React.ReactElement => {
  const paint = alertBandColorsOf(useUi().theme, tone, colors);
  return (
    <View accessibilityRole="alert" style={[styles.row, wide ? styles.rowWide : null, { backgroundColor: paint.background, borderColor: paint.border }]} testID={testID}>
      <View style={styles.head}>
        {icon}
        <View style={styles.text}>
          <Text accessibilityRole="header" style={[styles.title, { color: paint.text }]}>{title}</Text>
          {reason === undefined ? null : <Text style={[styles.reason, { color: paint.muted }]}>{reason}</Text>}
        </View>
      </View>
      {action === undefined ? null : <View style={[styles.action, wide ? styles.actionWide : null]} testID={testID === undefined ? undefined : `${testID}-action`}>{action}</View>}
    </View>
  );
};
