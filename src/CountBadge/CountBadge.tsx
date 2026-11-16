import React, { useMemo } from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { LAYOUT_I18N, LAYOUT_TEST_IDS } from '../constants';
import { BadgeTone } from '../StatusBadge/BadgeTone';
import { resolveToneColors } from '../StatusBadge/toneColors';

import { formatCount } from './formatCount';

const DEFAULT_MAX = 99;
const BADGE_SIZE = 20;
const BADGE_PADDING_H = 6;
const BADGE_FONT_SIZE = 12;

const styles = StyleSheet.create({
  badge: {
    minWidth: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    paddingHorizontal: BADGE_PADDING_H,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  text: { fontSize: BADGE_FONT_SIZE, fontWeight: '700' },
});

export interface CountBadgeProps {
  count: number;
  max?: number;
  tone?: BadgeTone;
  showZero?: boolean;
  testID?: string;
  accessibilityLabel?: string;
}

/** A small count pill (unread, open items); hidden at zero unless `showZero`. */
export const CountBadge = ({
  count,
  max = DEFAULT_MAX,
  tone = BadgeTone.Neutral,
  showZero = false,
  testID = LAYOUT_TEST_IDS.countBadge,
  accessibilityLabel,
}: CountBadgeProps): React.ReactElement | null => {
  const { theme, t } = useUi();
  const toned = useMemo(() => resolveToneColors(theme, tone), [theme, tone]);
  const badgeStyle = useMemo(() => [styles.badge, { backgroundColor: toned.backgroundColor }], [toned.backgroundColor]);
  const textStyle = useMemo(() => [styles.text, { color: toned.color }], [toned.color]);
  const text = formatCount(count, max);
  const isHidden = text === '0' && !showZero;
  if (isHidden) return null;

  return (
    <View
      accessibilityLabel={accessibilityLabel ?? t(LAYOUT_I18N.countBadgeLabel, text)}
      style={badgeStyle}
      testID={testID}
    >
      <Text style={textStyle}>{text}</Text>
    </View>
  );
};
