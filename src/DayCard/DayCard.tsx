import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';
import { SvgIcon, type IconName } from '@dloizides/ui-icons';

import { BadgeTone } from '../StatusBadge/BadgeTone';
import { StatusBadge } from '../StatusBadge/StatusBadge';
import { resolveTintColors } from '../StatusBadge/toneColors';
import { DayBadgeFill } from './DayBadgeFill';
import { DayCardLayout } from './DayCardLayout';

const PILL_RADIUS = 999;
const BADGE_ICON_SIZE = 12;
const ITEM_RADIUS = 12;
const ITEM_GAP = 8;

const styles = StyleSheet.create({
  body: { borderRadius: 8, borderWidth: 1, overflow: 'hidden' },
  count: { borderRadius: PILL_RADIUS, borderWidth: 1, fontSize: 12, fontWeight: '700', paddingHorizontal: 8 },
  head: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  item: { borderRadius: ITEM_RADIUS, borderWidth: 1, overflow: 'hidden' },
  items: { gap: ITEM_GAP },
  label: { fontSize: 13, fontWeight: '600' },
  stack: { gap: 6 },
});

/** Explicit badge fill and ink, e.g. a brand colour from the app's theme config. */
export interface DayBadgeColors {
  backgroundColor: string;
  color: string;
}

export interface DayCardProps {
  label: string;
  badge: string;
  count: number;
  accessibilityLabel: string;
  accessibilityHint: string;
  badgeTone?: BadgeTone;
  badgeFill?: DayBadgeFill;
  badgeColors?: DayBadgeColors;
  badgeIcon?: IconName;
  layout?: DayCardLayout;
  testID?: string;
  children: React.ReactNode;
}

/** One day of a list: its label, an age badge and the item count over the day's rows, in one card or one card per row (`layout`). */
export const DayCard = ({
  label,
  badge,
  count,
  accessibilityLabel,
  accessibilityHint,
  badgeTone = BadgeTone.Warning,
  badgeFill = DayBadgeFill.Solid,
  badgeColors,
  badgeIcon,
  layout = DayCardLayout.Grouped,
  testID,
  children,
}: DayCardProps): React.ReactElement => {
  const { theme } = useUi();
  const { colors } = theme;
  const tint = badgeColors ?? (badgeFill === DayBadgeFill.Tint ? resolveTintColors(theme, badgeTone) : undefined);
  const surface = { backgroundColor: colors.surface, borderColor: colors.border };
  const iconInk = tint?.color ?? colors.textSecondary;
  const icon = badgeIcon === undefined ? undefined : <SvgIcon color={iconInk} name={badgeIcon} size={BADGE_ICON_SIZE} />;
  return (
    <View style={styles.stack} testID={testID}>
      <View accessibilityHint={accessibilityHint} accessibilityLabel={accessibilityLabel} accessibilityRole="header" style={styles.head}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        <StatusBadge backgroundColor={tint?.backgroundColor} color={tint?.color} icon={icon} label={badge} testID={testID === undefined ? undefined : `${testID}-badge`} tone={badgeTone} />
        <Text style={[styles.count, { borderColor: colors.border, color: colors.textSecondary }]}>{String(count)}</Text>
      </View>
      {layout === DayCardLayout.Separate ? (
        <View style={styles.items}>
          {React.Children.toArray(children).map((child, index) => (
            <View key={index} style={[styles.item, surface]} testID={testID === undefined ? undefined : `${testID}-item-${String(index)}`}>{child}</View>
          ))}
        </View>
      ) : (
        <View style={[styles.body, surface]}>{children}</View>
      )}
    </View>
  );
};

export default DayCard;
