import React, { useState } from 'react';

import { Platform, StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { SectionItemShape, SectionRailItem } from './SectionRailItem';
import { splitSectionTabs } from './sectionRailModel';
import type { TabDescriptor } from './Tabs';

export const SECTION_BAR_HEIGHT = 56;
const SHEET_PAD = 8;

/** Hint props for a tablist View: the native hint plus its web aria-description. */
export const tablistHintProps = (hint: string | undefined): ViewProps =>
  (hint === undefined ? {} : { accessibilityHint: hint, 'aria-description': hint }) as ViewProps;

const pinnedToViewport = (Platform.OS === 'web' ? { position: 'fixed' } : { position: 'absolute' }) as unknown as ViewStyle;

const styles = StyleSheet.create({
  bar: { left: 0, right: 0, bottom: 0, flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, zIndex: 10 },
  sheet: { left: 0, right: 0, bottom: SECTION_BAR_HEIGHT, padding: SHEET_PAD, borderTopWidth: StyleSheet.hairlineWidth, zIndex: 10 },
});

export interface SectionMoreLabels {
  label: string;
  hint: string;
}

export interface SectionRailBarProps {
  tabs: ReadonlyArray<TabDescriptor>;
  activeKey: string;
  onChange: (key: string) => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
  more: SectionMoreLabels;
  barCount?: number;
  testID: string;
}

/** Phone form of the section rail: a bottom bar of the first sections plus More, which opens the rest above the bar. */
export const SectionRailBar = ({ tabs, activeKey, onChange, accessibilityLabel, accessibilityHint, more, barCount, testID }: SectionRailBarProps): React.ReactElement => {
  const { theme } = useUi();
  const [moreOpen, setMoreOpen] = useState(false);
  const split = splitSectionTabs(tabs, activeKey, barCount);
  const paper = { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border };
  const choose = (key: string): void => {
    setMoreOpen(false);
    onChange(key);
  };
  return (
    <>
      {moreOpen ? (
        <View role="menu" style={[styles.sheet, pinnedToViewport, paper]} testID={`${testID}-more-sheet`}>
          {split.moreTabs.map((tab) => (
            <SectionRailItem
              key={tab.key}
              accessibilityHint={tab.accessibilityHint}
              label={tab.label}
              onPress={(): void => choose(tab.key)}
              selected={tab.key === activeKey}
              shape={SectionItemShape.Rail}
              testID={tab.testID}
            />
          ))}
        </View>
      ) : null}
      <View {...tablistHintProps(accessibilityHint)} aria-label={accessibilityLabel} role="tablist" style={[styles.bar, pinnedToViewport, paper]} testID={`${testID}-bar`}>
        {split.barTabs.map((tab) => (
          <SectionRailItem
            key={tab.key}
            accessibilityHint={tab.accessibilityHint}
            label={tab.label}
            onPress={(): void => choose(tab.key)}
            selected={tab.key === activeKey}
            shape={SectionItemShape.Bar}
            testID={tab.testID}
          />
        ))}
        {split.moreTabs.length === 0 ? null : (
          <SectionRailItem
            accessibilityHint={more.hint}
            label={more.label}
            onPress={(): void => setMoreOpen((open) => !open)}
            selected={split.moreActive || moreOpen}
            shape={SectionItemShape.Bar}
            testID={`${testID}-more`}
          />
        )}
      </View>
    </>
  );
};
