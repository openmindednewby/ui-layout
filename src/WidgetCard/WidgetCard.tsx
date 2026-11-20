import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

const RADIUS = 12;
const PAD = 16;
const GAP = 8;
const TITLE_FONT = 15;

const styles = StyleSheet.create({
  card: { borderRadius: RADIUS, borderWidth: 1, gap: GAP, minWidth: 0, padding: PAD },
  footer: { borderRadius: GAP, borderWidth: 1, gap: GAP, padding: PAD / 2 + GAP / 2 },
  head: { alignItems: 'center', flexDirection: 'row', gap: GAP },
  title: { flex: 1, fontSize: TITLE_FONT, fontWeight: '700' },
});

export interface WidgetCardProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  headerRight?: React.ReactNode;
  footer?: React.ReactNode;
  testID?: string;
}

/** A titled card for one record or summary block, with an optional header slot and a record action footer. */
export const WidgetCard = ({ title, children, icon, headerRight, footer, testID }: WidgetCardProps): React.ReactElement => {
  const { theme } = useUi();
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]} testID={testID}>
      <View style={styles.head}>
        {icon === undefined ? null : <View aria-hidden>{icon}</View>}
        <Text accessibilityRole="header" style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        {headerRight}
      </View>
      {children}
      {footer === undefined ? null : <View style={[styles.footer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>{footer}</View>}
    </View>
  );
};

export default WidgetCard;
