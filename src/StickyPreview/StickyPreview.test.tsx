import { act, render, screen } from '@testing-library/react';

import { StickyPreview } from './StickyPreview';
import { isPastStickyLine } from './hooks/useStuckSentinel';
import { isKeyboardOpen } from './hooks/useVisibleViewport';

type ObserverCallback = (entries: Array<{ isIntersecting: boolean; boundingClientRect: { top: number } }>) => void;

const TEST_ID = 'sticky-preview';
const TALL_HEIGHT = 640;
const KEYBOARD_HEIGHT = 300;

let notifyObserver: ObserverCallback;

class FakeIntersectionObserver {
  constructor(callback: ObserverCallback) {
    notifyObserver = callback;
  }

  observe(): void {
    return undefined;
  }

  disconnect(): void {
    return undefined;
  }
}

function fakeViewport(height: number): EventTarget & Record<string, number> {
  const target = new EventTarget() as EventTarget & Record<string, number>;
  Object.assign(target, { height, width: 360, scale: 1, offsetTop: 0 });
  return target;
}

function setViewport(value: unknown): void {
  Object.defineProperty(window, 'visualViewport', { configurable: true, value });
}

function renderPreview(forceCompact = false): void {
  render(
    <StickyPreview accessibilityLabel="Preview" compact="small" forceCompact={forceCompact} full="large" testID={TEST_ID} />,
  );
}

beforeEach(() => {
  (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver = FakeIntersectionObserver;
  setViewport(undefined);
});

describe('StickyPreview', () => {
  it('at the top of the page with a tall viewport, shows the full slot', () => {
    renderPreview();

    const shown = screen.getByTestId(`${TEST_ID}-full`);

    expect(shown.textContent).toBe('large');
  });

  it('with forceCompact, shows the compact slot', () => {
    renderPreview(true);

    const shown = screen.getByTestId(`${TEST_ID}-compact`);

    expect(shown.textContent).toBe('small');
  });

  it('once the sentinel scrolls above the sticky line, shows the compact slot', () => {
    renderPreview();

    act(() => notifyObserver([{ isIntersecting: false, boundingClientRect: { top: -20 } }]));

    expect(screen.getByTestId(`${TEST_ID}-compact`).textContent).toBe('small');
  });

  it('when scrolled back to the top, returns to the full slot', () => {
    renderPreview();
    act(() => notifyObserver([{ isIntersecting: false, boundingClientRect: { top: -20 } }]));

    act(() => notifyObserver([{ isIntersecting: true, boundingClientRect: { top: 0 } }]));

    expect(screen.getByTestId(`${TEST_ID}-full`).textContent).toBe('large');
  });

  it('when the visible viewport shrinks for the keyboard, shows the compact slot', () => {
    const viewport = fakeViewport(TALL_HEIGHT);
    setViewport(viewport);
    renderPreview();

    act(() => {
      viewport.height = KEYBOARD_HEIGHT;
      viewport.dispatchEvent(new Event('resize'));
    });

    expect(screen.getByTestId(`${TEST_ID}-compact`).textContent).toBe('small');
  });

  it('when pinch zoom halves the visible height, keeps the full slot', () => {
    const viewport = fakeViewport(TALL_HEIGHT);
    setViewport(viewport);
    renderPreview();

    act(() => {
      viewport.height = TALL_HEIGHT / 2;
      viewport.width = 180;
      viewport.scale = 2;
      viewport.dispatchEvent(new Event('resize'));
    });

    expect(screen.getByTestId(`${TEST_ID}-full`).textContent).toBe('large');
  });

  it('when the visual viewport moves, follows its offset', () => {
    const viewport = fakeViewport(TALL_HEIGHT);
    setViewport(viewport);
    renderPreview();

    act(() => {
      viewport.offsetTop = 120;
      viewport.dispatchEvent(new Event('scroll'));
    });

    expect(getComputedStyle(screen.getByTestId(TEST_ID)).top).toBe('120px');
  });
});

describe('isKeyboardOpen', () => {
  it('with a small drop such as a collapsing address bar, returns false', () => {
    const result = isKeyboardOpen(600, TALL_HEIGHT);

    expect(result).toBe(false);
  });

  it('with a drop past a quarter of the height, returns true', () => {
    const result = isKeyboardOpen(KEYBOARD_HEIGHT, TALL_HEIGHT);

    expect(result).toBe(true);
  });
});

describe('isPastStickyLine', () => {
  it('with the sentinel out of view above the line, returns true', () => {
    const result = isPastStickyLine(-5, false, 0);

    expect(result).toBe(true);
  });

  it('with the sentinel out of view below the fold, returns false', () => {
    const result = isPastStickyLine(900, false, 0);

    expect(result).toBe(false);
  });

  it('with the sentinel in view, returns false', () => {
    const result = isPastStickyLine(10, true, 0);

    expect(result).toBe(false);
  });
});
