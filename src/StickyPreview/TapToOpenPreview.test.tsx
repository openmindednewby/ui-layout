import { act, fireEvent, render, screen } from '@testing-library/react';

import { TapToOpenPreview } from './TapToOpenPreview';

type ObserverCallback = (entries: Array<{ isIntersecting: boolean; boundingClientRect: { top: number } }>) => void;

const TEST_ID = 'tap-preview';
const KEYBOARD_HEIGHT = 300;
const TALL_HEIGHT = 640;
const labels = { openLabel: 'Open', openHint: 'Opens', closeLabel: 'Close', closeHint: 'Closes' };

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

function renderTapPreview(): void {
  render(<TapToOpenPreview accessibilityLabel="Preview" compact={<button type="button">small</button>} full="large" labels={labels} testID={TEST_ID} />);
}

function stick(): void {
  act(() => notifyObserver([{ isIntersecting: false, boundingClientRect: { top: -20 } }]));
}

beforeEach(() => {
  (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver = FakeIntersectionObserver;
  Object.defineProperty(window, 'visualViewport', { configurable: true, value: undefined });
});

describe('TapToOpenPreview', () => {
  it('at rest with a tall viewport, shows the compact slot', () => {
    renderTapPreview();

    const shown = screen.getByTestId(`${TEST_ID}-compact`);

    expect(shown.textContent).toContain('small');
  });

  it('when Open is pressed, shows the full slot', () => {
    renderTapPreview();

    fireEvent.click(screen.getByTestId(`${TEST_ID}-open`));

    expect(screen.getByTestId(`${TEST_ID}-full`).textContent).toContain('large');
  });

  it('when Close is pressed after opening, returns to the compact slot', () => {
    renderTapPreview();
    fireEvent.click(screen.getByTestId(`${TEST_ID}-open`));

    fireEvent.click(screen.getByTestId(`${TEST_ID}-close`));

    expect(screen.getByTestId(`${TEST_ID}-compact`).textContent).toContain('small');
  });

  it('when stuck and Open is pressed, shows the full slot', () => {
    renderTapPreview();
    stick();

    fireEvent.click(screen.getByTestId(`${TEST_ID}-open`));

    expect(screen.getByTestId(`${TEST_ID}-full`).textContent).toContain('large');
  });

  it('when the keyboard is open and Open is pressed, shows the full slot', () => {
    const viewport = Object.assign(new EventTarget(), { height: TALL_HEIGHT, width: 360, scale: 1, offsetTop: 0 });
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport });
    renderTapPreview();
    act(() => {
      viewport.height = KEYBOARD_HEIGHT;
      viewport.dispatchEvent(new Event('resize'));
    });

    fireEvent.click(screen.getByTestId(`${TEST_ID}-open`));

    expect(screen.getByTestId(`${TEST_ID}-full`).textContent).toContain('large');
  });

  it('with a button inside the compact slot, the Open control does not wrap it', () => {
    renderTapPreview();

    const wraps = screen.getByTestId(`${TEST_ID}-open`).contains(screen.getByText('small'));

    expect(wraps).toBe(false);
  });
});
