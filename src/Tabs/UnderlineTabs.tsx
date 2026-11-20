import React from 'react';

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { MIN_TARGET_PX } from '../constants';

const UNDERLINE = 3;
const PAD_H = 12;
const GAP = 6;
const FONT_SIZE = 14;
const COUNT_FONT = 12;
const COUNT_MIN = 22;
const COUNT_PAD = 6;
const PILL = 999;
const DEFAULT_UNDERLINE_STEP = '700';

const styles = StyleSheet.create({
  count: { borderRadius: PILL, fontSize: COUNT_FONT, fontWeight: '700', minWidth: COUNT_MIN, paddingHorizontal: COUNT_PAD, textAlign: 'center' },
  label: { fontSize: FONT_SIZE, fontWeight: '600' },
  strip: { borderBottomWidth: 1, width: '100%' },
  tab: { alignItems: 'center', borderBottomWidth: UNDERLINE, flexDirection: 'row', gap: GAP, justifyContent: 'center', minHeight: MIN_TARGET_PX, minWidth: MIN_TARGET_PX, paddingHorizontal: PAD_H },
});

export interface UnderlineTab {
  key: string;
  label: string;
  count?: number;
  testID?: string;
  accessibilityHint?: string;
}

export interface UnderlineTabsProps {
  tabs: ReadonlyArray<UnderlineTab>;
  activeKey: string;
  onChange: (key: string) => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
  underlineColor?: string;
  testID?: string;
}

/** A full-width tab strip with an underline on the selected tab and an optional count per tab. */
export const UnderlineTabs = ({ tabs, activeKey, onChange, accessibilityLabel, accessibilityHint, underlineColor, testID }: UnderlineTabsProps): React.ReactElement => {
  const { theme } = useUi();
  const underline = underlineColor ?? theme.palette.primary[DEFAULT_UNDERLINE_STEP];
  return (
    <View style={[styles.strip, { borderBottomColor: theme.colors.border }]} testID={testID}>
      <ScrollView horizontal accessibilityHint={accessibilityHint} accessibilityRole="tablist" aria-label={accessibilityLabel} showsHorizontalScrollIndicator={false}>
        {tabs.map((tab) => {
          const selected = tab.key === activeKey;
          return (
            <Pressable
              key={tab.key}
              accessibilityHint={tab.accessibilityHint}
              accessibilityLabel={tab.label}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              aria-selected={selected}
              style={[styles.tab, { borderBottomColor: selected ? underline : 'transparent' }]}
              testID={tab.testID}
              onPress={() => onChange(tab.key)}
            >
              <Text style={[styles.label, { color: selected ? theme.colors.text : theme.colors.textSecondary }]}>{tab.label}</Text>
              {tab.count === undefined ? null : <Text style={[styles.count, { backgroundColor: theme.colors.border, color: theme.colors.text }]}>{String(tab.count)}</Text>}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default UnderlineTabs;
