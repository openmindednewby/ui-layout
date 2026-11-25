import type { ScrollViewport } from './scrollViewport';

export interface StickyIndexConfig {
  scrollSpy?: boolean;
  activationRatio?: number;
  clickLockMs?: number;
}

export interface ResolvedSticky {
  sticky: boolean;
  spy: boolean;
  activationRatio: number;
  clickLockMs: number;
}

export const SPY_ACTIVATION_RATIO = 0.3;
export const SPY_CLICK_LOCK_MS = 900;

export function resolveSticky(value: boolean | StickyIndexConfig | undefined): ResolvedSticky {
  if (value === undefined || value === false) return { sticky: false, spy: false, activationRatio: SPY_ACTIVATION_RATIO, clickLockMs: SPY_CLICK_LOCK_MS };
  const config: StickyIndexConfig = value === true ? {} : value;
  return {
    sticky: true,
    spy: config.scrollSpy ?? true,
    activationRatio: config.activationRatio ?? SPY_ACTIVATION_RATIO,
    clickLockMs: config.clickLockMs ?? SPY_CLICK_LOCK_MS,
  };
}

/** Index of the last section whose top is at or above the activation line, else the first. */
export function pickActiveIndex(tops: ReadonlyArray<number>, line: number): number {
  return tops.reduce((picked, top, index) => (top <= line ? index : picked), 0);
}

/** The current section: the first at the scroller's top, the last at its end, else the one crossing the line `activationRatio` down. */
export function pickSpyIndex(tops: ReadonlyArray<number>, viewport: ScrollViewport, activationRatio: number): number {
  if (viewport.atStart) return 0;
  if (viewport.atEnd) return Math.max(tops.length - 1, 0);
  return pickActiveIndex(tops, viewport.top + viewport.height * activationRatio);
}
