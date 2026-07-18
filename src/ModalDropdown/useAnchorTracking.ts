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

import { MIN_VISIBLE_PX, isAnchorHidden, type AnchorRect, type ClipBounds } from './menuStacking';

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

/** Does this element clip its children on the given axis (a scroll container, an overflow panel)? */
function clipsAxis(overflow: string): boolean {
  return overflow !== '' && overflow !== 'visible';
}

/** Narrow `bounds` to `el`'s box on whichever axes `el` clips. */
function clipToAncestor(bounds: ClipBounds, el: HTMLElement): void {
  const style = window.getComputedStyle(el);
  // The per-axis longhands are authoritative, but fall back to the `overflow` shorthand: not every
  // environment expands it (jsdom does not), and a missed clipping ancestor silently disables the
  // out-of-view close — the exact class of failure this whole hook exists to prevent.
  const clipsY = clipsAxis(style.overflowY) || clipsAxis(style.overflow);
  const clipsX = clipsAxis(style.overflowX) || clipsAxis(style.overflow);
  if (!clipsY && !clipsX) return;
  const r = el.getBoundingClientRect();
  if (clipsY) {
    bounds.top = Math.max(bounds.top, r.top);
    bounds.bottom = Math.min(bounds.bottom, r.bottom);
  }
  if (clipsX) {
    bounds.left = Math.max(bounds.left, r.left);
    bounds.right = Math.min(bounds.right, r.right);
  }
}

/**
 * The window the anchor is actually visible through: the viewport narrowed by every clipping
 * ancestor. THIS is what makes the out-of-view check work in an RN-web app, where the document
 * never scrolls and every screen lives inside an inner `ScrollView` — a trigger scrolled out of
 * that scroller is invisible while its rect is still inside the viewport.
 */
export function readClipBounds(node: HTMLElement | null): ClipBounds {
  const bounds: ClipBounds = { top: 0, left: 0, bottom: window.innerHeight, right: window.innerWidth };
  let el = node?.parentElement ?? null;
  while (el !== null && el !== document.body && el !== document.documentElement) {
    clipToAncestor(bounds, el);
    el = el.parentElement;
  }
  return bounds;
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
    let hasMeasured = false;

    const apply = (): void => {
      frame = null;
      if (isDisposed) return;
      const next = readAnchorRect(containerRef);
      setRect(next);
      // Never close on the FIRST measurement. Opening a dropdown whose trigger is already partly
      // clipped must still work; only movement AFTER the menu is open may close it.
      const isHidden =
        next !== null && isAnchorHidden(next, readClipBounds(toDomNode(containerRef)), MIN_VISIBLE_PX);
      if (hasMeasured && isHidden) onOutOfView();
      hasMeasured = true;
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
