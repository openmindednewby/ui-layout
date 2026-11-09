import { fireEvent, render, screen } from '@testing-library/react';

import { BottomSheet } from './BottomSheet';
import type { BottomSheetProps } from './BottomSheet';

jest.mock('@dloizides/ui-icons', () => ({ SvgIcon: () => null }));

const SHEET_ID = 'bottom-sheet';
const CLOSE_ID = 'bottom-sheet-close';
const BACKDROP_ID = 'bottom-sheet-backdrop';
const FOOTER_ID = 'bottom-sheet-footer';
const MIN_HIT_BOX_PX = 44;

const renderSheet = (overrides: Partial<BottomSheetProps> = {}): ReturnType<typeof render> =>
  render(
    <BottomSheet title="Filters" visible onClose={jest.fn()} {...overrides}>
      <input data-testid="sheet-field" />
    </BottomSheet>,
  );

afterEach(() => {
  document.body.style.overflow = '';
});

describe('BottomSheet open state', () => {
  it('with visible true, mounts a modal dialog named by the title', () => {
    renderSheet();

    const dialog = screen.getByTestId(SHEET_ID);

    expect(dialog.getAttribute('role')).toBe('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-label')).toBe('Filters');
  });

  it('with visible false, does not mount the dialog', () => {
    renderSheet({ visible: false });

    const dialog = screen.queryByTestId(SHEET_ID);

    expect(dialog).toBeNull();
  });

  it('with an accessibilityLabel, names the dialog by it instead of the title', () => {
    renderSheet({ accessibilityLabel: 'Pattern filters' });

    const dialog = screen.getByTestId(SHEET_ID);

    expect(dialog.getAttribute('aria-label')).toBe('Pattern filters');
  });
});

describe('BottomSheet closing', () => {
  it('with a press on Close, calls onClose once', () => {
    const onClose = jest.fn();
    renderSheet({ onClose });

    fireEvent.click(screen.getByTestId(CLOSE_ID));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('with a tap on the backdrop, calls onClose once', () => {
    const onClose = jest.fn();
    renderSheet({ onClose });

    fireEvent.click(screen.getByTestId(BACKDROP_ID));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('with a tap inside the body, does not call onClose', () => {
    const onClose = jest.fn();
    renderSheet({ onClose });

    fireEvent.click(screen.getByTestId('sheet-field'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('with the default size, gives Close a hit box of at least 44px on both axes', () => {
    renderSheet();

    const close = window.getComputedStyle(screen.getByTestId(CLOSE_ID));

    expect(parseFloat(close.minWidth)).toBeGreaterThanOrEqual(MIN_HIT_BOX_PX);
    expect(parseFloat(close.minHeight)).toBeGreaterThanOrEqual(MIN_HIT_BOX_PX);
  });
});

describe('BottomSheet footer', () => {
  it('with a footer, renders it in the pinned region outside the scrolling body', () => {
    renderSheet({ footer: <button data-testid="sheet-apply">Show patterns</button> });

    const footer = screen.getByTestId(FOOTER_ID);
    const field = screen.getByTestId('sheet-field');

    expect(footer.contains(screen.getByTestId('sheet-apply'))).toBe(true);
    expect(footer.contains(field)).toBe(false);
  });

  it('with no footer, renders no footer region', () => {
    renderSheet();

    const footer = screen.queryByTestId(FOOTER_ID);

    expect(footer).toBeNull();
  });

  it('with a null footer, renders no footer region', () => {
    renderSheet({ footer: null });

    const footer = screen.queryByTestId(FOOTER_ID);

    expect(footer).toBeNull();
  });
});

describe('BottomSheet height', () => {
  it('with maxHeightFraction 0.6, caps the panel at 60% of the screen', () => {
    renderSheet({ maxHeightFraction: 0.6 });

    const panel = window.getComputedStyle(screen.getByTestId(SHEET_ID));

    expect(panel.maxHeight).toBe('60%');
  });

  it('with no maxHeightFraction, caps the panel at 92% of the screen', () => {
    renderSheet();

    const panel = window.getComputedStyle(screen.getByTestId(SHEET_ID));

    expect(panel.maxHeight).toBe('92%');
  });
});

describe('BottomSheet test ids', () => {
  it('with a custom testID, derives the close, backdrop and footer ids from it', () => {
    renderSheet({ testID: 'filters', footer: <span>Apply</span> });

    const ids = ['filters-close', 'filters-backdrop', 'filters-footer'].map((id) => screen.queryByTestId(id));

    expect(ids.every((node) => node !== null)).toBe(true);
  });
});
