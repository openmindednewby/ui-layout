import React from 'react';

import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';

import { useIsWideViewport } from '../hooks/useIsWideViewport';
import { ChipOverflow } from './ChipOverflow';
import { SectionChips } from './SectionChips';
import { SectionDensity } from './SectionDensity';
import { SectionIndex, SECTION_INDEX_WIDTH } from './SectionIndex';
import { resolveSticky, type StickyIndexConfig } from './scrollSpy';
import { sectionAnchorId, SECTION_INDEX_BREAKPOINT } from './sectionKeys';
import { useSectionSelection } from './useSectionSelection';

import type { SectionFold, SectionIndexEntry } from './types';

const COMFORTABLE_GAP = 12;
const DENSE_GAP = 8;
const DENSE_WIDE_GAP = 16;
const WEB_STICKY = { position: 'sticky', top: 0 } as unknown as ViewStyle;

const NO_STACK = Number.POSITIVE_INFINITY;

const styles = StyleSheet.create({
  wide: { flexDirection: 'row', alignItems: 'flex-start', gap: 20 },
  column: { flex: 1, minWidth: 0 },
});

function toFold(breakpoint: number | SectionFold): SectionFold {
  return typeof breakpoint === 'number' ? { wide: breakpoint, stackFrom: NO_STACK } : breakpoint;
}

const SectionColumn = ({ sections, testID, style }: { sections: ReadonlyArray<SectionIndexEntry>; testID: string; style: ViewStyle }): React.ReactElement => (
  <View style={style} testID={`${testID}-column`}>
    {sections.map((entry) => (
      <View key={entry.key} nativeID={sectionAnchorId(testID, entry.key)} testID={sectionAnchorId(testID, entry.key)}>
        {entry.content}
      </View>
    ))}
  </View>
);

export interface SectionIndexLayoutProps {
  sections: ReadonlyArray<SectionIndexEntry>;
  indexHeading: string;
  itemHint: string;
  initialKey?: string;
  collapsedKey?: string;
  breakpoint?: number | SectionFold;
  density?: SectionDensity;
  stickyIndex?: boolean | StickyIndexConfig;
  chipOverflow?: ChipOverflow;
  indexWidth?: number;
  activeColor?: string;
  testID?: string;
}

export const SectionIndexLayout = ({
  sections,
  indexHeading,
  itemHint,
  initialKey,
  collapsedKey,
  breakpoint = SECTION_INDEX_BREAKPOINT,
  density = SectionDensity.Comfortable,
  stickyIndex = false,
  chipOverflow = ChipOverflow.Wrap,
  indexWidth = SECTION_INDEX_WIDTH,
  activeColor,
  testID = 'section-index',
}: SectionIndexLayoutProps): React.ReactElement => {
  const fold = toFold(breakpoint);
  const wide = useIsWideViewport(fold.wide);
  const stacked = useIsWideViewport(fold.stackFrom);
  const sticky = resolveSticky(stickyIndex);
  const preferredKey = wide ? initialKey : collapsedKey;
  const { activeKey, pick, select } = useSectionSelection({ sections, testID, preferredKey, spyEnabled: wide && sections.length > 1, sticky });
  const dense = density === SectionDensity.Dense;
  const gap = { gap: dense ? DENSE_GAP : COMFORTABLE_GAP };
  if (sections.length < 2) return <View testID={testID}>{sections[0]?.content}</View>;
  if (!wide && stacked) return <View testID={testID}><SectionColumn sections={sections} style={gap} testID={testID} /></View>;
  if (!wide) {
    const active = sections.find((entry) => entry.key === activeKey);
    return (
      <View style={gap} testID={testID}>
        <SectionChips
          activeColor={activeColor}
          activeKey={activeKey}
          dense={dense}
          groupLabel={indexHeading}
          itemHint={itemHint}
          overflow={chipOverflow}
          sections={sections}
          testID={testID}
          onSelect={pick}
        />
        <View nativeID={sectionAnchorId(testID, activeKey)} testID={sectionAnchorId(testID, activeKey)}>
          {active?.content}
        </View>
      </View>
    );
  }
  const stickyStyle = sticky.sticky && Platform.OS === 'web' ? WEB_STICKY : null;
  return (
    <View style={[styles.wide, dense && { gap: DENSE_WIDE_GAP }]} testID={testID}>
      <View style={stickyStyle}>
        <SectionIndex activeColor={activeColor} activeKey={activeKey} dense={dense} heading={indexHeading} itemHint={itemHint} sections={sections} testID={testID} width={indexWidth} onSelect={select} />
      </View>
      <SectionColumn sections={sections} style={StyleSheet.flatten([styles.column, gap])} testID={testID} />
    </View>
  );
};
