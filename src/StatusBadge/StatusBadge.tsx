/**
 * StatusBadge — unified status pill. Colours are passed in; domain adapters map their
 * enums to label/color/backgroundColor.
 */
import React, { useMemo } from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { LAYOUT_TEST_IDS } from '../constants';

const DEFAULT_PADDING_H = 10;
const DEFAULT_PADDING_V = 4;
const DEFAULT_BORDER_RADIUS = 12;
const DEFAULT_FONT_SIZE = 12;

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: DEFAULT_PADDING_H,
    paddingVertical: DEFAULT_PADDING_V,
    borderRadius: DEFAULT_BORDER_RADIUS,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: DEFAULT_FONT_SIZE,
    fontWeight: '600',
  },
});

export interface StatusBadgeProps {
  label: string;
  color: string;
  backgroundColor: string;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const StatusBadge = ({
  label,
  color,
  backgroundColor,
  testID = LAYOUT_TEST_IDS.statusLabel,
  accessibilityLabel,
  accessibilityHint,
}: StatusBadgeProps): React.ReactElement => {
  const { t } = useUi();

  const dynamicBadge = useMemo(() => ({ backgroundColor }), [backgroundColor]);
  const dynamicText = useMemo(() => ({ color }), [color]);

  return (
    <View
      accessibilityHint={accessibilityHint ?? t('common.statusBadgeHint')}
      accessibilityLabel={accessibilityLabel ?? label}
      style={[styles.badge, dynamicBadge]}
      testID={testID}
    >
      <Text style={[styles.text, dynamicText]}>{label}</Text>
    </View>
  );
};

export default StatusBadge;
