/**
 * useAnchorTracking — keeps the fixed-positioned web popover glued to its trigger.
 *
 * WHY THIS IS HARDER THAN IT LOOKS: on web the menu is portalled to `document.body` with
 * `position: fixed` at the trigger's rect measured AT OPEN TIME. `fixed` is viewport-relative, so
 * the coordinate is only valid until something moves the trigger — after that the menu floats,
 * detached, over unrelated content.
 *
 * The original implementation listened for `scroll` (capture) + `resize` on `window`. That covers
 * scrolling, but leaves three real gaps this hook closes:
 *
 *  1. **Layout changes that fire no scroll event at all** — an accordion above the trigger
 *     expanding, a sticky header changing height, a banner appearing, an async list rendering,
 *     a font swapping. The trigger moves; nothing scrolls; no listener fires. A `ResizeObserver`
 *     on the anchor and on `document.body` catches these.
 *  2. **The trigger leaving the viewport.** Repositioning alone cannot help here — the menu just
 *     follows its trigger off-screen and hangs over unrelated content. We close instead
 *     (see {@link isAnchorOutOfView}).
 *  3. **Layout thrash.** The old handler ran a synchronous `getBoundingClientRect()` (a forced
 *     reflow) plus a React state update on EVERY scroll event — potentially hundreds per second
 *     during a momentum scroll. Work is now coalesced into one `requestAnimationFrame` per frame.
 *
 * Scroll is observed in the CAPTURE phase on `document` so a scroll inside ANY ancestor scroll
 * container counts — element `scroll` events do not bubble, so a bubble-phase listener would only
 * ever see the document scroller.
 *
 * No-op on native, where the popover is an in-tree absolutely-positioned child that moves with its
 * anchor automatically.
 */
import { useLayoutEffect, useState } from 'react';
import type { RefObject } from 'react';

import { Platform } from 'react-native';
import type { View as RNView } from 'react-native';

import { isAnchorOutOfView, type AnchorRect } from './menuStacking';

const IS_WEB = Platform.OS === 'web';

/** The RN-web `View` ref is an `HTMLElement` at runtime; native refs are not. */
function toDomNode(containerRef: RefObject<RNView | null>): HTMLElement | null {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- RN web ref is an HTMLElement at runtime
  const node = containerRef.current as unknown as HTMLElement | null;
  if (node === null || typeof node.getBoundingClientRect !== 'function') return null;
  return node;
}

/** Read the anchor's viewport rect (web only). Returns null when unavailable (native / no node). */
export function readAnchorRect(containerRef: RefObject<RNView | null>): AnchorRect | null {
  if (!IS_WEB) return null;
  const node = toDomNode(containerRef);
  if (node === null) return null;
  const r = node.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, bottom: r.bottom };
}

/**
 * Watch the anchor (and the page) for size/layout changes that move the trigger WITHOUT scrolling.
 * Returns null where `ResizeObserver` is unavailable (older browsers, jsdom) — the scroll/resize
 * listeners still apply, so tracking degrades rather than breaking.
 */
function observeLayout(node: HTMLElement | null, onChange: () => void): ResizeObserver | null {
  if (typeof ResizeObserver !== 'function') return null;
  const observer = new ResizeObserver(onChange);
  if (node !== null) observer.observe(node);
  observer.observe(document.body);
  return observer;
}

/**
 * Track `containerRef`'s viewport rect while the menu is open.
 *
 * @param containerRef the anchor wrapper holding the trigger.
 * @param onOutOfView called once the anchor has left the viewport — the caller closes the menu.
 *   Must be referentially stable (a `useCallback` with no deps), or the listeners re-subscribe.
 */
export function useAnchorTracking(
  containerRef: RefObject<RNView | null>,
  onOutOfView: () => void,
): AnchorRect | null {
  const [rect, setRect] = useState<AnchorRect | null>(() => readAnchorRect(containerRef));

  useLayoutEffect(() => {
    if (!IS_WEB) return undefined;
    let frame: number | null = null;
    let isDisposed = false;

    const apply = (): void => {
      frame = null;
      if (isDisposed) return;
      const next = readAnchorRect(containerRef);
      setRect(next);
      if (next !== null && isAnchorOutOfView(next, window.innerHeight, window.innerWidth)) onOutOfView();
    };

    // Coalesce a burst of scroll/resize/layout events into a single measurement per frame.
    const schedule = (): void => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(apply);
    };

    apply();
    document.addEventListener('scroll', schedule, true);
    window.addEventListener('resize', schedule);
    const observer = observeLayout(toDomNode(containerRef), schedule);

    return () => {
      isDisposed = true;
      if (frame !== null) window.cancelAnimationFrame(frame);
      document.removeEventListener('scroll', schedule, true);
      window.removeEventListener('resize', schedule);
      if (observer !== null) observer.disconnect();
    };
  }, [containerRef, onOutOfView]);

  return rect;
}
