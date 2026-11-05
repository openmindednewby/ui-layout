/**
 * StatusBadge — unified status pill. Colours are passed in; domain adapters map their
 * enums to label/color/backgroundColor.
 */
import React, { useMemo } from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { LAYOUT_I18N, LAYOUT_TEST_IDS } from '../constants';

const DEFAULT_PADDING_H = 10;
const DEFAULT_PADDING_V = 4;
const DEFAULT_BORDER_RADIUS = 12;
const DEFAULT_FONT_SIZE = 12;
const ICON_GAP = 4;

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: DEFAULT_PADDING_H,
    paddingVertical: DEFAULT_PADDING_V,
    borderRadius: DEFAULT_BORDER_RADIUS,
    alignSelf: 'flex-start',
    // Never wider than the container: a long label wraps inside the pill instead of being clipped.
    maxWidth: '100%',
  },
  badgeWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ICON_GAP,
  },
  badgeDashed: {
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  text: {
    fontSize: DEFAULT_FONT_SIZE,
    fontWeight: '600',
    flexShrink: 1,
  },
});

export interface StatusBadgeProps {
  label: string;
  color: string;
  backgroundColor: string;
  icon?: React.ReactNode;
  dashed?: boolean;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const StatusBadge = ({
  label,
  color,
  backgroundColor,
  icon,
  dashed = false,
  testID = LAYOUT_TEST_IDS.statusLabel,
  accessibilityLabel,
  accessibilityHint,
}: StatusBadgeProps): React.ReactElement => {
  const { t } = useUi();

  const dynamicBadge = useMemo(() => ({ backgroundColor }), [backgroundColor]);
  const dashedColor = useMemo(() => ({ borderColor: color }), [color]);
  const dynamicText = useMemo(() => ({ color }), [color]);
  const hasIcon = icon !== undefined && icon !== null;

  return (
    <View
      accessibilityHint={accessibilityHint ?? t(LAYOUT_I18N.statusBadgeHint)}
      accessibilityLabel={accessibilityLabel ?? label}
      style={[styles.badge, hasIcon && styles.badgeWithIcon, dynamicBadge, dashed && styles.badgeDashed, dashed && dashedColor]}
      testID={testID}
    >
      {hasIcon ? <View aria-hidden>{icon}</View> : null}
      <Text style={[styles.text, dynamicText]}>{label}</Text>
    </View>
  );
};

export default StatusBadge;
