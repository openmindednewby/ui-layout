import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { resolveBannerColors } from './bannerColors';
import { BannerTone } from './BannerTone';

const GAP = 8;
const PAD_V = 10;
const PAD_H = 12;
const RADIUS = 8;
const FONT = 14;
const LINE = 20;

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'flex-start', gap: GAP, paddingVertical: PAD_V, paddingHorizontal: PAD_H, borderRadius: RADIUS, borderWidth: 1 },
  text: { flex: 1, minWidth: 0, fontSize: FONT, lineHeight: LINE },
  strong: { fontWeight: '600' },
});

export interface InlineBannerProps {
  tone?: BannerTone;
  title?: React.ReactNode;
  children?: React.ReactNode;
  renderIcon?: (color: string) => React.ReactNode;
  testID?: string;
}

/** A bordered, tinted note inside a card: optional icon slot, strong lead and body, coloured by a semantic tone. */
export const InlineBanner = ({ tone = BannerTone.Info, title, children, renderIcon, testID }: InlineBannerProps): React.ReactElement => {
  const colors = resolveBannerColors(useUi().theme, tone);
  const bodyIsText = children === undefined || typeof children === 'string';
  return (
    <View style={[styles.banner, { borderColor: colors.border, backgroundColor: colors.fill }]} testID={testID}>
      {renderIcon === undefined ? null : renderIcon(colors.ink)}
      {bodyIsText ? (
        <Text style={[styles.text, { color: colors.ink }]} testID={testID === undefined ? undefined : `${testID}-text`}>
          {title === undefined ? null : <Text style={styles.strong}>{title}</Text>}
          {title !== undefined && children !== undefined ? ' ' : null}
          {children}
        </Text>
      ) : (
        <View style={styles.text}>{children}</View>
      )}
    </View>
  );
};
