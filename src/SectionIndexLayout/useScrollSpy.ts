import { useCallback, useEffect, useMemo, useRef } from 'react';

import { pickSpyIndex } from './scrollSpy';
import { scrollViewport } from './scrollViewport';

export interface ScrollSpyOptions {
  anchorIds: ReadonlyArray<string>;
  enabled: boolean;
  activationRatio: number;
  onActive: (index: number) => void;
}

export interface ScrollSpyControl {
  pause: (ms: number) => void;
}

const UNPRIMED = -2;
const STALE = -1;
const ID_SEPARATOR = '\n';
const LISTEN_OPTIONS: AddEventListenerOptions = { capture: true, passive: true };

function canObserve(): boolean {
  return typeof document !== 'undefined' && typeof window !== 'undefined';
}

function findAnchors(ids: ReadonlyArray<string>): Array<{ index: number; element: HTMLElement }> {
  return ids.flatMap((id, index) => {
    const element = document.getElementById(id);
    return element === null ? [] : [{ index, element }];
  });
}

/** Reports the section crossing the activation line on web; a no-op on native, where presses drive the index. */
export function useScrollSpy({ anchorIds, enabled, activationRatio, onActive }: ScrollSpyOptions): ScrollSpyControl {
  const onActiveRef = useRef(onActive);
  onActiveRef.current = onActive;
  const pausedUntil = useRef(0);
  const last = useRef(UNPRIMED);
  const idsKey = anchorIds.join(ID_SEPARATOR);

  useEffect(() => {
    if (!enabled || !canObserve()) return undefined;
    const anchors = findAnchors(idsKey.split(ID_SEPARATOR));
    const first = anchors[0];
    if (first === undefined || anchors.length < 2) return undefined;
    last.current = UNPRIMED;
    const evaluate = (): void => {
      if (Date.now() < pausedUntil.current) return;
      const tops = anchors.map((anchor) => anchor.element.getBoundingClientRect().top);
      const picked = pickSpyIndex(tops, scrollViewport(first.element), activationRatio);
      const index = anchors[picked]?.index ?? 0;
      const primed = last.current !== UNPRIMED;
      if (index === last.current) return;
      last.current = index;
      if (primed || index > 0) onActiveRef.current(index);
    };
    document.addEventListener('scroll', evaluate, LISTEN_OPTIONS);
    window.addEventListener('resize', evaluate, LISTEN_OPTIONS);
    evaluate();
    return () => {
      document.removeEventListener('scroll', evaluate, LISTEN_OPTIONS);
      window.removeEventListener('resize', evaluate, LISTEN_OPTIONS);
    };
  }, [enabled, activationRatio, idsKey]);

  const pause = useCallback((ms: number) => {
    pausedUntil.current = Date.now() + ms;
    last.current = STALE;
  }, []);
  return useMemo(() => ({ pause }), [pause]);
}
