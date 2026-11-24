import { useCallback, useState } from 'react';

import { resolveActiveKey, scrollToSection, sectionAnchorId } from './sectionKeys';
import { useScrollSpy } from './useScrollSpy';

import type { ResolvedSticky } from './scrollSpy';
import type { SectionIndexEntry } from './types';

export interface SectionSelectionOptions {
  sections: ReadonlyArray<SectionIndexEntry>;
  testID: string;
  preferredKey: string | undefined;
  spyEnabled: boolean;
  sticky: ResolvedSticky;
}

export interface SectionSelection {
  activeKey: string;
  pick: (key: string) => void;
  select: (key: string) => void;
}

/** Active section from a press, the scroll spy, or the preferred key; `select` also scrolls to the section. */
export function useSectionSelection({ sections, testID, preferredKey, spyEnabled, sticky }: SectionSelectionOptions): SectionSelection {
  const [current, setCurrent] = useState<string | undefined>(undefined);
  const spy = useScrollSpy({
    anchorIds: sections.map((entry) => sectionAnchorId(testID, entry.key)),
    enabled: spyEnabled && sticky.spy,
    activationRatio: sticky.activationRatio,
    onActive: (index) => setCurrent(sections[index]?.key),
  });
  const { pause } = spy;
  const { clickLockMs } = sticky;
  const select = useCallback(
    (key: string) => {
      setCurrent(key);
      pause(clickLockMs);
      scrollToSection(sectionAnchorId(testID, key));
    },
    [pause, clickLockMs, testID],
  );
  return { activeKey: resolveActiveKey(sections, current ?? preferredKey), pick: setCurrent, select };
}
