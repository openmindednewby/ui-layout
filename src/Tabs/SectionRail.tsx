import React from 'react';

import { StyleSheet, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { SECTION_BAR_HEIGHT, SectionRailBar, tablistHintProps, type SectionMoreLabels } from './SectionRailBar';
import { SectionItemShape, SectionRailItem } from './SectionRailItem';
import type { TabDescriptor } from './Tabs';
import { TABS_COLLAPSE_BREAKPOINT, useTabsCollapsed } from './tabsResponsive';

const RAIL_WIDTH = 224;
const RAIL_GAP = 8;
const COLUMN_GAP = 24;
const PANEL_PAD_TOP = 16;

const styles = StyleSheet.create({
  wideRoot: { width: '100%', flexDirection: 'row', alignItems: 'flex-start', gap: COLUMN_GAP },
  rail: { width: RAIL_WIDTH, flexShrink: 0, gap: RAIL_GAP, paddingRight: RAIL_GAP, borderRightWidth: StyleSheet.hairlineWidth },
  railList: { gap: 2 },
  widePanel: { flex: 1, minWidth: 0 },
  phoneRoot: { width: '100%' },
  phonePanel: { paddingTop: PANEL_PAD_TOP, paddingBottom: SECTION_BAR_HEIGHT + PANEL_PAD_TOP },
});

const DEFAULT_TEST_ID = 'section-rail';

export interface SectionRailProps {
  tabs: ReadonlyArray<TabDescriptor>;
  activeKey: string;
  onChange: (key: string) => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
  more: SectionMoreLabels;
  railHeader?: React.ReactNode;
  children?: React.ReactNode;
  barCount?: number;
  collapseBelow?: number;
  testID?: string;
}

/** Sections in a left rail beside the panel; on a phone a bottom bar with More. */
export const SectionRail = ({
  tabs,
  activeKey,
  onChange,
  accessibilityLabel,
  accessibilityHint,
  more,
  railHeader,
  children,
  barCount,
  collapseBelow = TABS_COLLAPSE_BREAKPOINT,
  testID = DEFAULT_TEST_ID,
}: SectionRailProps): React.ReactElement => {
  const { theme } = useUi();
  const collapsed = useTabsCollapsed(collapseBelow);
  if (collapsed) {
    return (
      <View style={styles.phoneRoot} testID={testID}>
        {railHeader}
        <View role="tabpanel" style={styles.phonePanel} testID={`${testID}-panel`}>{children}</View>
        <SectionRailBar accessibilityHint={accessibilityHint} accessibilityLabel={accessibilityLabel} activeKey={activeKey} barCount={barCount} more={more} onChange={onChange} tabs={tabs} testID={testID} />
      </View>
    );
  }
  return (
    <View style={styles.wideRoot} testID={testID}>
      <View style={[styles.rail, { borderRightColor: theme.colors.border }]} testID={`${testID}-rail`}>
        {railHeader}
        <View {...tablistHintProps(accessibilityHint)} aria-label={accessibilityLabel} aria-orientation="vertical" role="tablist" style={styles.railList}>
          {tabs.map((tab) => (
            <SectionRailItem
              key={tab.key}
              accessibilityHint={tab.accessibilityHint}
              label={tab.label}
              onPress={(): void => onChange(tab.key)}
              selected={tab.key === activeKey}
              shape={SectionItemShape.Rail}
              testID={tab.testID}
            />
          ))}
        </View>
      </View>
      <View role="tabpanel" style={styles.widePanel} testID={`${testID}-panel`}>{children}</View>
    </View>
  );
};
