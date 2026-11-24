import { useCallback, useEffect, useMemo, useRef } from 'react';

import { pickActiveIndex, spyRootMargin } from './scrollSpy';

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

function canObserve(): boolean {
  return typeof document !== 'undefined' && typeof window !== 'undefined' && typeof IntersectionObserver !== 'undefined';
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
    if (anchors.length < 2) return undefined;
    last.current = UNPRIMED;
    const evaluate = (): void => {
      if (Date.now() < pausedUntil.current) return;
      const picked = pickActiveIndex(anchors.map((anchor) => anchor.element.getBoundingClientRect().top), window.innerHeight * activationRatio);
      const index = anchors[picked]?.index ?? 0;
      const primed = last.current !== UNPRIMED;
      if (index === last.current) return;
      last.current = index;
      if (primed || index > 0) onActiveRef.current(index);
    };
    const observer = new IntersectionObserver(evaluate, { rootMargin: spyRootMargin(activationRatio), threshold: 0 });
    anchors.forEach((anchor) => observer.observe(anchor.element));
    return () => observer.disconnect();
  }, [enabled, activationRatio, idsKey]);

  const pause = useCallback((ms: number) => {
    pausedUntil.current = Date.now() + ms;
    last.current = STALE;
  }, []);
  return useMemo(() => ({ pause }), [pause]);
}
