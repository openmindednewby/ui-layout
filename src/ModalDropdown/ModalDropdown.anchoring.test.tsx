/**
 * Regression tests for the two defects found by browser visual QA against a live app (1.10.0):
 *
 *  1. The portalled inline menu is `position: fixed` at the trigger's rect measured at OPEN time.
 *     Anything that moves the trigger afterwards detaches the menu — it floats over unrelated
 *     content, and once the trigger scrolls off-screen entirely the menu is orphaned.
 *  2. `accessibilityHint` never reached assistive tech: react-native-web drops the prop, so the
 *     trigger carried `aria-label` + `aria-expanded` and NO hint of any kind.
 */
import { render, screen, fireEvent, act } from '@testing-library/react';

import { ModalDropdown } from './ModalDropdown';
import { DropdownVariant } from './DropdownVariant';

const OPTIONS = [
  { label: 'Alpha', value: 'a' as const },
  { label: 'Beta', value: 'b' as const },
];

type Value = (typeof OPTIONS)[number]['value'];

const TRIGGER_HEIGHT = 40;
const TRIGGER_LEFT = 480;
const TRIGGER_WIDTH = 300;
/** Matches the real measurement: the menu sits MENU_TOP_GAP (4px) below the trigger's bottom. */
const MENU_GAP = 4;

/** jsdom has no layout, so the anchor's rect is stubbed and moved by hand to simulate scrolling. */
function stubAnchorRect(anchor: HTMLElement, getTop: () => number): void {
  anchor.getBoundingClientRect = () => {
    const top = getTop();
    return {
      top,
      left: TRIGGER_LEFT,
      width: TRIGGER_WIDTH,
      height: TRIGGER_HEIGHT,
      bottom: top + TRIGGER_HEIGHT,
      right: TRIGGER_LEFT + TRIGGER_WIDTH,
      x: TRIGGER_LEFT,
      y: top,
      toJSON: () => ({}),
    } as DOMRect;
  };
}

function menuTop(): number {
  const style = screen.getByTestId('d-menu').getAttribute('style') ?? '';
  const match = /(?:^|[; ])top:\s*(-?[\d.]+)px/.exec(style);
  return match === null ? Number.NaN : Number(match[1]);
}

function renderMenu(): void {
  render(
    <ModalDropdown
      testID="d"
      accessibilityLabel="Currency"
      accessibilityHint="Pick the display currency"
      value={'a' as Value}
      variant={DropdownVariant.Menu}
      options={OPTIONS}
      onChange={jest.fn()}
    />,
  );
}

/** Let the rAF-coalesced measurement run — the hook does at most one reposition per frame. */
async function flushFrame(): Promise<void> {
  await act(async () => {
    await new Promise<void>((resolve) => { requestAnimationFrame(() => { resolve(); }); });
  });
}

describe('ModalDropdown inline menu stays anchored to its trigger (1.10.0)', () => {
  let scrollTop = 200;

  beforeEach(() => {
    scrollTop = 200;
    window.innerHeight = 800;
    window.innerWidth = 1440;
  });

  it('follows the trigger when layout moves it with NO scroll event at all', async () => {
    // THE GAP the old scroll/resize listeners could not cover: an accordion above the trigger
    // expanding, a sticky header resizing, a banner appearing, an async list rendering. The
    // trigger moves, nothing scrolls, no event fires — and the menu detached. A ResizeObserver
    // catches it. jsdom has no ResizeObserver, so a minimal stub stands in for the browser's.
    // react-native-web's own `useElementLayout` also constructs a ResizeObserver, so the stub must
    // implement the FULL interface (observe/unobserve/disconnect) or RN-web's View throws on mount.
    // Fired with an EMPTY entry list: our hook ignores the argument, and RN-web's own observer
    // callback iterates entries, so an empty list is a harmless no-op for it.
    const observers: Array<() => void> = [];
    class StubResizeObserver {
      private readonly fire: (entries: ResizeObserverEntry[]) => void;
      constructor(callback: (entries: ResizeObserverEntry[]) => void) {
        this.fire = callback;
        observers.push(() => { this.fire([]); });
      }
      observe(): void { /* the stub fires on demand, not on real layout */ }
      unobserve(): void { /* nothing retained */ }
      disconnect(): void { /* nothing retained */ }
    }
    const original = (globalThis as { ResizeObserver?: unknown }).ResizeObserver;
    (globalThis as { ResizeObserver?: unknown }).ResizeObserver = StubResizeObserver;

    try {
      renderMenu();
      const trigger = screen.getByTestId('d');
      stubAnchorRect(trigger.parentElement as HTMLElement, () => scrollTop);
      fireEvent.click(trigger);
      expect(menuTop()).toBe(scrollTop + TRIGGER_HEIGHT + MENU_GAP);
      expect(observers.length).toBeGreaterThan(0);

      // Content above the trigger grows by 120px. No scroll, no resize — layout only.
      scrollTop = 320;
      await act(async () => { observers.forEach((fire) => { fire(); }); });
      await flushFrame();

      expect(menuTop()).toBe(320 + TRIGGER_HEIGHT + MENU_GAP);
    } finally {
      (globalThis as { ResizeObserver?: unknown }).ResizeObserver = original;
    }
  });

  it('follows the trigger when an ANCESTOR scroll container scrolls (not just the window)', async () => {
    renderMenu();
    const trigger = screen.getByTestId('d');
    stubAnchorRect(trigger.parentElement as HTMLElement, () => scrollTop);
    fireEvent.click(trigger);
    expect(menuTop()).toBe(scrollTop + TRIGGER_HEIGHT + MENU_GAP);

    // An inner scroller's `scroll` event does NOT bubble — only a CAPTURE-phase listener on
    // `document` sees it. A bubble-phase listener (or one only on `window`) would miss this.
    const scroller = document.createElement('div');
    document.body.appendChild(scroller);
    scrollTop = 60;
    await act(async () => {
      scroller.dispatchEvent(new Event('scroll', { bubbles: false }));
    });
    await flushFrame();

    expect(menuTop()).toBe(60 + TRIGGER_HEIGHT + MENU_GAP);
  });

  it('closes rather than orphaning the menu once the trigger scrolls out of the viewport', async () => {
    renderMenu();
    const trigger = screen.getByTestId('d');
    stubAnchorRect(trigger.parentElement as HTMLElement, () => scrollTop);
    fireEvent.click(trigger);
    expect(screen.getByTestId('d-menu')).toBeTruthy();

    // The exact reported symptom: the trigger scrolls off the top, and before this fix the menu
    // stayed put — floating over unrelated content with nothing on screen explaining it.
    scrollTop = -TRIGGER_HEIGHT - 100;
    await act(async () => { document.dispatchEvent(new Event('scroll')); });
    await flushFrame();

    expect(screen.queryByTestId('d-menu')).toBeNull();
  });

  it('repositions on a window resize as well as a scroll', async () => {
    renderMenu();
    const trigger = screen.getByTestId('d');
    stubAnchorRect(trigger.parentElement as HTMLElement, () => scrollTop);
    fireEvent.click(trigger);

    scrollTop = 310;
    await act(async () => { window.dispatchEvent(new Event('resize')); });
    await flushFrame();

    expect(menuTop()).toBe(310 + TRIGGER_HEIGHT + MENU_GAP);
  });

  it('coalesces a burst of scroll events into ONE measurement (no layout thrash per event)', async () => {
    renderMenu();
    const trigger = screen.getByTestId('d');
    const anchor = trigger.parentElement as HTMLElement;
    stubAnchorRect(anchor, () => scrollTop);
    fireEvent.click(trigger);

    const measure = jest.spyOn(anchor, 'getBoundingClientRect');
    await act(async () => {
      for (let i = 0; i < 20; i += 1) document.dispatchEvent(new Event('scroll'));
    });
    await flushFrame();

    // 20 scroll events, at most one forced reflow. The pre-fix handler measured on every event.
    expect(measure.mock.calls.length).toBeLessThanOrEqual(1);
  });
});

describe('ModalDropdown accessibilityHint reaches assistive tech (1.10.0)', () => {
  it('exposes the hint via aria-describedby instead of silently dropping it', () => {
    renderMenu();
    const trigger = screen.getByTestId('d');

    const describedBy = trigger.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();

    const hintNode = document.getElementById(describedBy ?? '');
    expect(hintNode).not.toBeNull();
    expect(hintNode?.textContent).toBe('Pick the display currency');
  });

  it('does not leak the RN-only accessibilityHint prop onto the DOM element', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      renderMenu();
      const trigger = screen.getByTestId('d');
      expect(trigger.getAttribute('accessibilityHint')).toBeNull();
      expect(trigger.hasAttribute('accessibilityhint')).toBe(false);

      const unknownPropWarnings = consoleError.mock.calls.filter((call) =>
        String(call[0]).includes('does not recognize'),
      );
      expect(unknownPropWarnings).toHaveLength(0);
    } finally {
      consoleError.mockRestore();
    }
  });

  it('keeps the hint wired when the caller supplies a custom trigger (renderTrigger)', () => {
    render(
      <ModalDropdown
        testID="lang"
        accessibilityLabel="Language"
        accessibilityHint="Change the interface language"
        value={'a' as Value}
        variant={DropdownVariant.Menu}
        options={OPTIONS}
        onChange={jest.fn()}
        renderTrigger={({ label }) => <span>{label}</span>}
      />,
    );
    const trigger = screen.getByTestId('lang');
    const hintNode = document.getElementById(trigger.getAttribute('aria-describedby') ?? '');
    expect(hintNode?.textContent).toBe('Change the interface language');
  });

  it('does not paint the hint text into the visible trigger label', () => {
    renderMenu();
    expect(screen.getByTestId('d').textContent).toBe('Alpha');
  });
});
