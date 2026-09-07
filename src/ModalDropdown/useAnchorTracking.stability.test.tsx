/**
 * ANCHOR STABILITY — a measurement that finds the anchor UNMOVED must not re-render the menu.
 *
 * `useAnchorTracking` coalesces scroll/resize/ResizeObserver bursts into one `requestAnimationFrame`
 * measurement, but it then called `setRect(readAnchorRect(...))` unconditionally. `readAnchorRect`
 * builds a FRESH object literal every time, so `Object.is` never matched and React re-rendered on
 * EVERY frame in which anything scrolled — even when the trigger had not moved by a pixel.
 *
 * That re-render is not cosmetic. The new `rect` identity invalidates `InlineMenu`'s `popoverStyle`
 * memo, react-native-web rewrites the portalled menu's DOM, and the option rows are re-created.
 * Playwright, which scrolls an element into view immediately BEFORE clicking it, therefore hit
 * "element is not stable" and then "element was detached from the DOM" on every attempt — the
 * `navbar-overflow-menu` failure in `v2-journey.spec.ts`. It is deterministic, not flaky: the
 * scroll that precedes the click is what triggers the churn.
 *
 * This pins the invariant at the source: equal rect in, zero extra renders out.
 */
import { createRef } from 'react';

import { render, screen, act } from '@testing-library/react';
import { View } from 'react-native';
import type { View as RNView } from 'react-native';

import { useAnchorTracking } from './useAnchorTracking';

const ANCHOR_RECT = { top: 10, left: 20, width: 120, bottom: 40, right: 140, height: 30, x: 20, y: 10 };

let seenRects: Array<unknown> = [];

function Probe({ anchorRef }: { anchorRef: React.RefObject<RNView | null> }): React.ReactElement {
  seenRects.push(useAnchorTracking(anchorRef, () => undefined));
  return <View testID="probe" />;
}

describe('useAnchorTracking does not re-render while the anchor is unmoved', () => {
  let frames: FrameRequestCallback[] = [];

  beforeEach(() => {
    frames = [];
    seenRects = [];
    jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb: FrameRequestCallback) => { frames.push(cb); return frames.length; });
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);
    jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- test double
      .mockImplementation(() => ANCHOR_RECT as unknown as DOMRect);
  });

  afterEach(() => jest.restoreAllMocks());

  const flush = (): void => {
    act(() => { const pending = frames; frames = []; pending.forEach((cb) => cb(0)); });
  };

  it('a scroll that leaves the anchor rect identical produces no additional render', () => {
    const anchorRef = createRef<RNView>();
    render(
      <View ref={anchorRef}>
        <Probe anchorRef={anchorRef} />
      </View>,
    );
    expect(screen.getByTestId('probe')).toBeTruthy();

    act(() => { document.dispatchEvent(new Event('scroll', { bubbles: false })); });
    flush();
    act(() => { document.dispatchEvent(new Event('scroll', { bubbles: false })); });
    flush();

    // Every measurement found the anchor unmoved, so the hook must keep handing back the SAME
    // object. A fresh identity here is what invalidates `popoverStyle` and rewrites the portalled
    // menu's DOM mid-click. (An unbounded loop fails this test earlier, via max-update-depth.)
    const measured = seenRects.filter((r) => r !== null);
    expect(measured.length).toBeGreaterThan(1);
    expect(new Set(measured).size).toBe(1);
  });
});
