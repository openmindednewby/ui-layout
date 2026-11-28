import type { TabDescriptor } from './Tabs';

export const DEFAULT_SECTION_BAR_COUNT = 4;

export interface SectionBarSplit {
  barTabs: ReadonlyArray<TabDescriptor>;
  moreTabs: ReadonlyArray<TabDescriptor>;
  moreActive: boolean;
}

/** Splits sections into the phone bar slots and the More list; no More when one extra would fit. */
export function splitSectionTabs(
  tabs: ReadonlyArray<TabDescriptor>,
  activeKey: string,
  barCount: number = DEFAULT_SECTION_BAR_COUNT,
): SectionBarSplit {
  if (tabs.length <= barCount + 1) return { barTabs: tabs, moreTabs: [], moreActive: false };
  const moreTabs = tabs.slice(barCount);
  return {
    barTabs: tabs.slice(0, barCount),
    moreTabs,
    moreActive: moreTabs.some((tab) => tab.key === activeKey),
  };
}
