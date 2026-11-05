import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

import type { View } from 'react-native';

/** True when the sentinel has scrolled above the sticky line, not merely out of view below it. */
export function isPastStickyLine(sentinelTop: number, isIntersecting: boolean, topOffset: number): boolean {
  return !isIntersecting && sentinelTop < topOffset;
}

/** Watches a sentinel placed just above a sticky element and reports when that element is stuck. */
export function useStuckSentinel(topOffset: number): { sentinelRef: RefObject<View | null>; isStuck: boolean } {
  const sentinelRef = useRef<View>(null);
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const node = sentinelRef.current as unknown as Element | null;
    if (node === null || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (entry !== undefined) setIsStuck(isPastStickyLine(entry.boundingClientRect.top, entry.isIntersecting, topOffset));
      },
      { rootMargin: `-${topOffset}px 0px 0px 0px` },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [topOffset]);

  return { sentinelRef, isStuck };
}
