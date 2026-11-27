const mockViewProps = jest.fn();

jest.mock('react-native', () => {
  const actual = jest.requireActual('react-native');
  const { createElement, forwardRef } = jest.requireActual('react');
  const View = forwardRef((props: Record<string, unknown>, ref: unknown) => {
    mockViewProps(props);
    return createElement(actual.View, { ...props, ref });
  });
  return { ...actual, View, useWindowDimensions: () => ({ width: 1280, height: 800, scale: 1, fontScale: 1 }) };
});

import { fireEvent, render, screen } from '@testing-library/react';

import { FullPageSheet } from './FullPageSheet';
import type { FullPageSheetProps } from './FullPageSheet';
import { FULL_PAGE_MAX_WIDTH, fullPageContentWidth } from './fullPageContentWidth';

jest.mock('@dloizides/ui-icons', () => ({ SvgIcon: () => null }));

const DIALOG_ID = 'full-page-sheet-dialog';
const CLOSE_ID = 'full-page-sheet-close';
const PHONE_WIDTH = 360;
const PHONE_CONTENT_WIDTH = 328;
const WIDE_WIDTH = 1920;
const CUSTOM_MAX = 600;

const renderSheet = (overrides: Partial<FullPageSheetProps> = {}): ReturnType<typeof render> =>
  render(
    <FullPageSheet visible onClose={jest.fn()} {...overrides}>
      <span data-testid="sheet-content" />
    </FullPageSheet>,
  );

afterEach(() => {
  document.body.style.overflow = '';
  mockViewProps.mockClear();
  jest.restoreAllMocks();
});

describe('fullPageContentWidth', () => {
  it('with a phone window, keeps the side space free', () => {
    const width = fullPageContentWidth(PHONE_WIDTH);

    expect(width).toBe(PHONE_CONTENT_WIDTH);
  });

  it('with a window wider than the cap, returns the cap', () => {
    const width = fullPageContentWidth(WIDE_WIDTH);

    expect(width).toBe(FULL_PAGE_MAX_WIDTH);
  });

  it('with a custom max narrower than the window, returns the custom max', () => {
    const width = fullPageContentWidth(WIDE_WIDTH, CUSTOM_MAX);

    expect(width).toBe(CUSTOM_MAX);
  });

  it('with a window narrower than the side space, returns zero', () => {
    const width = fullPageContentWidth(10);

    expect(width).toBe(0);
  });
});

describe('FullPageSheet open state', () => {
  it('with visible true, mounts a modal dialog with the content', () => {
    renderSheet({ accessibilityLabel: 'Invoice preview' });

    const dialog = screen.getByTestId(DIALOG_ID);

    expect(dialog.getAttribute('role')).toBe('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-label')).toBe('Invoice preview');
    expect(screen.getByTestId('sheet-content')).toBeTruthy();
  });

  it('with an accessibility hint, puts it on the dialog element', () => {
    renderSheet({ accessibilityHint: 'Swipe or press Escape to close' });

    const dialogProps = mockViewProps.mock.calls.map(([props]) => props).find((props) => props.testID === DIALOG_ID);

    expect(dialogProps?.accessibilityHint).toBe('Swipe or press Escape to close');
  });

  it('with visible false, does not mount the content', () => {
    renderSheet({ visible: false });

    const content = screen.queryByTestId('sheet-content');

    expect(content).toBeNull();
  });

  it('with visible true, focuses the close control', () => {
    renderSheet();

    const close = screen.getByTestId(CLOSE_ID);

    expect(document.activeElement).toBe(close);
  });

  it('with visible true, locks the page scroll', () => {
    renderSheet();

    const overflow = document.body.style.overflow;

    expect(overflow).toBe('hidden');
  });
});

describe('FullPageSheet dismissal', () => {
  it('with the close control pressed, calls onClose once', () => {
    const onClose = jest.fn();
    renderSheet({ onClose });

    fireEvent.click(screen.getByTestId(CLOSE_ID));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('with Escape pressed on web, calls onClose once', () => {
    const onClose = jest.fn();
    renderSheet({ onClose });

    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.keyUp(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('with a custom close label, names the close control by it', () => {
    renderSheet({ closeLabel: 'Back to gallery' });

    const close = screen.getByTestId(CLOSE_ID);

    expect(close.getAttribute('aria-label')).toBe('Back to gallery');
  });
});

describe('FullPageSheet content width', () => {
  it('with render-prop children, passes the bounded content width', () => {
    const renderBody = jest.fn(() => null);

    render(
      <FullPageSheet maxContentWidth={CUSTOM_MAX} visible onClose={jest.fn()}>
        {renderBody}
      </FullPageSheet>,
    );

    expect(renderBody).toHaveBeenCalledWith(CUSTOM_MAX);
  });
});
