import React from 'react';

import { ScrollView, StyleSheet, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { ChipOverflow } from '../SectionIndexLayout/ChipOverflow';
import { EdgeFadeStrip } from './EdgeFadeStrip';
import { useEdgeFade } from './edgeFade';
import { ChipTabItem, UnderlineTabItem } from './TabItems';
import { TabsVariant } from './TabsVariant';
import type { UnderlineTab } from './underlineTabTypes';

export type { UnderlineTab } from './underlineTabTypes';

const DEFAULT_UNDERLINE_STEP = '700';
const SCROLL_THROTTLE_MS = 16;
const CHIP_GAP = 8;
const CHIP_PAD_V = 4;

const styles = StyleSheet.create({
  chipRow: { alignItems: 'center', flexDirection: 'row', gap: CHIP_GAP, paddingVertical: CHIP_PAD_V },
  chipWrap: { flexWrap: 'wrap' },
  strip: { position: 'relative', width: '100%' },
});

export interface UnderlineTabsProps {
  tabs: ReadonlyArray<UnderlineTab>;
  activeKey: string;
  onChange: (key: string) => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
  underlineColor?: string;
  fadeColor?: string;
  testID?: string;
  variant?: TabsVariant;
  chipOverflow?: ChipOverflow;
}

/** A full-width tab strip: underline tabs (default) or a pill-chip jump row (`variant` Chips), with an optional count per tab. */
export const UnderlineTabs = ({ tabs, activeKey, onChange, accessibilityLabel, accessibilityHint, underlineColor, fadeColor, testID, variant = TabsVariant.Underline, chipOverflow = ChipOverflow.Scroll }: UnderlineTabsProps): React.ReactElement => {
  const { theme } = useUi();
  const underline = underlineColor ?? theme.palette.primary[DEFAULT_UNDERLINE_STEP];
  const fade = useEdgeFade();
  const chips = variant === TabsVariant.Chips;
  const items = tabs.map((tab) => {
    const item = { tab, selected: tab.key === activeKey, onChange };
    return chips ? <ChipTabItem key={tab.key} {...item} /> : <UnderlineTabItem key={tab.key} {...item} underline={underline} />;
  });
  const stripStyle = chips ? styles.strip : [styles.strip, { borderBottomColor: theme.colors.border, borderBottomWidth: 1 }];
  if (chips && chipOverflow === ChipOverflow.Wrap) {
    return (
      <View accessibilityHint={accessibilityHint} accessibilityRole="tablist" aria-label={accessibilityLabel} style={[styles.chipRow, styles.chipWrap]} testID={testID}>
        {items}
      </View>
    );
  }
  return (
    <View style={stripStyle} testID={testID}>
      <ScrollView horizontal accessibilityHint={accessibilityHint} accessibilityRole="tablist" aria-label={accessibilityLabel} contentContainerStyle={chips ? styles.chipRow : undefined} scrollEventThrottle={SCROLL_THROTTLE_MS} showsHorizontalScrollIndicator={false} onContentSizeChange={fade.onContentSizeChange} onLayout={fade.onLayout} onScroll={fade.onScroll}>
        {items}
      </ScrollView>
      {fade.visible ? <EdgeFadeStrip color={fadeColor ?? theme.colors.background} /> : null}
    </View>
  );
};

export default UnderlineTabs;
