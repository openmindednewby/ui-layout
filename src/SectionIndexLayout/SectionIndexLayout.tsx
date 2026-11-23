import React, { useState } from 'react';

import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';

import { useIsWideViewport } from '../hooks/useIsWideViewport';
import { ChipOverflow } from './ChipOverflow';
import { SectionChips } from './SectionChips';
import { SectionDensity } from './SectionDensity';
import { SectionIndex, SECTION_INDEX_WIDTH } from './SectionIndex';
import { resolveActiveKey, scrollToSection, sectionAnchorId, SECTION_INDEX_BREAKPOINT } from './sectionKeys';

import type { SectionIndexEntry } from './types';

const COMFORTABLE_GAP = 12;
const DENSE_GAP = 8;
const WEB_STICKY = { position: 'sticky', top: 0 } as unknown as ViewStyle;

const styles = StyleSheet.create({
  wide: { flexDirection: 'row', alignItems: 'flex-start', gap: 20 },
  column: { flex: 1, minWidth: 0 },
});

export interface SectionIndexLayoutProps {
  sections: ReadonlyArray<SectionIndexEntry>;
  indexHeading: string;
  itemHint: string;
  initialKey?: string;
  breakpoint?: number;
  density?: SectionDensity;
  stickyIndex?: boolean;
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
  breakpoint = SECTION_INDEX_BREAKPOINT,
  density = SectionDensity.Comfortable,
  stickyIndex = false,
  chipOverflow = ChipOverflow.Wrap,
  indexWidth = SECTION_INDEX_WIDTH,
  activeColor,
  testID = 'section-index',
}: SectionIndexLayoutProps): React.ReactElement => {
  const wide = useIsWideViewport(breakpoint);
  const [picked, setPicked] = useState<string | undefined>(initialKey);
  const activeKey = resolveActiveKey(sections, picked);
  const gap = { gap: density === SectionDensity.Dense ? DENSE_GAP : COMFORTABLE_GAP };
  if (sections.length < 2) return <View testID={testID}>{sections[0]?.content}</View>;
  if (!wide) {
    const active = sections.find((entry) => entry.key === activeKey);
    return (
      <View style={gap} testID={testID}>
        <SectionChips
          activeColor={activeColor}
          activeKey={activeKey}
          groupLabel={indexHeading}
          itemHint={itemHint}
          overflow={chipOverflow}
          sections={sections}
          testID={testID}
          onSelect={setPicked}
        />
        <View nativeID={sectionAnchorId(testID, activeKey)} testID={sectionAnchorId(testID, activeKey)}>
          {active?.content}
        </View>
      </View>
    );
  }
  const select = (key: string): void => {
    setPicked(key);
    scrollToSection(sectionAnchorId(testID, key));
  };
  const sticky = stickyIndex && Platform.OS === 'web' ? WEB_STICKY : null;
  return (
    <View style={styles.wide} testID={testID}>
      <View style={sticky}>
        <SectionIndex activeColor={activeColor} activeKey={activeKey} heading={indexHeading} itemHint={itemHint} sections={sections} testID={testID} width={indexWidth} onSelect={select} />
      </View>
      <View style={[styles.column, gap]}>
        {sections.map((entry) => (
          <View key={entry.key} nativeID={sectionAnchorId(testID, entry.key)} testID={sectionAnchorId(testID, entry.key)}>
            {entry.content}
          </View>
        ))}
      </View>
    </View>
  );
};
