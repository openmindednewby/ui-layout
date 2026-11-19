import type { SectionIndexEntry } from './types';

export const SECTION_INDEX_BREAKPOINT = 1024;

export function resolveActiveKey(sections: ReadonlyArray<SectionIndexEntry>, wanted: string | undefined): string {
  const match = sections.find((entry) => entry.key === wanted);
  if (match !== undefined) return match.key;
  return sections[0]?.key ?? '';
}

export function sectionAnchorId(testID: string, key: string): string {
  return `${testID}-section-${key}`;
}

export function scrollToSection(anchorId: string): void {
  if (typeof document === 'undefined') return;
  const target = document.getElementById(anchorId);
  target?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
}
