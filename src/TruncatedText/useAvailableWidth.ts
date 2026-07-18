/**
 * The width `TruncatedText` has to work with.
 *
 * WHY NOT `onLayout`, AND WHY NOT `ResizeObserver`: both were tried and neither delivered a
 * single callback for this element under react-native-web 0.21 — verified in Chrome, not
 * assumed. `onLayout` on a `<Text>` never fires; moving it to a wrapping `<View>` did not fire
 * either; observing the same node with a `ResizeObserver` produced zero notifications. A
 * measurement hook that silently never runs is worse than none, because the component keeps
 * rendering (just untruncated) and every unit test still passes.
 *
 * So on web the width is read straight off the DOM: the **parent's** inner width, in a ref
 * callback during commit, plus a `resize` listener. The parent is measured rather than the
 * element itself for a specific reason — the element shrink-wraps its own text, so measuring it
 * would feed our output back into our input and oscillate: truncate → element narrows →
 * re-measure smaller → truncate harder. The parent's width does not depend on what we put in it.
 *
 * Native keeps `onLayout`, where it works.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { Platform, type LayoutChangeEvent } from 'react-native';

const UNMEASURED = 0;
const IS_WEB = Platform.OS === 'web';

/** The usable inner width of `node`'s parent — its content box, less its padding. */
function measureParentInnerWidth(node: HTMLElement): number {
  const parent = node.parentElement;
  if (parent === null) return UNMEASURED;
  const cs = window.getComputedStyle(parent);
  const padding = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
  return Math.max(UNMEASURED, parent.clientWidth - padding);
}

export interface AvailableWidth {
  /** 0 until measured — callers render the full value for that first frame. */
  width: number;
  /** Attach to the measured element. On web it also captures the DOM node. */
  measureRef: (node: unknown) => void;
  /** Native measurement path; a no-op on web. */
  onLayout: (event: LayoutChangeEvent) => void;
}

export function useAvailableWidth(): AvailableWidth {
  const [width, setWidth] = useState(UNMEASURED);
  const nodeRef = useRef<HTMLElement | null>(null);

  const measureRef = useCallback((node: unknown) => {
    if (!IS_WEB) return;
    nodeRef.current = node as HTMLElement | null;
    if (nodeRef.current !== null) setWidth(measureParentInnerWidth(nodeRef.current));
  }, []);

  useEffect(() => {
    if (!IS_WEB) return undefined;
    const remeasure = (): void => {
      const node = nodeRef.current;
      if (node !== null) setWidth(measureParentInnerWidth(node));
    };
    window.addEventListener('resize', remeasure);
    return () => window.removeEventListener('resize', remeasure);
  }, []);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    if (IS_WEB) return;
    setWidth(event.nativeEvent.layout.width);
  }, []);

  return { width, measureRef, onLayout };
}
