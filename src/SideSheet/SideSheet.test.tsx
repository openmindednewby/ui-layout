import React, { useState } from 'react';

import { Platform } from 'react-native';

import { act, fireEvent, render, screen } from '@testing-library/react';

import { SideSheet } from './SideSheet';

const OPENER_TEST_ID = 'sheet-opener';
const MENU_TRIGGER_TEST_ID = 'sheet-menu-trigger';

const flushFocus = async (): Promise<void> => {
  await act(async () => Promise.resolve());
};

const addFocusedOpener = (): HTMLButtonElement => {
  const opener = document.createElement('button');
  opener.setAttribute('data-testid', OPENER_TEST_ID);
  document.body.appendChild(opener);
  opener.focus();
  return opener;
};

const sheet = (visible: boolean, onClose: () => void, initialFocusTestID?: string): React.ReactElement => (
  <SideSheet
    footer={<button data-testid="sheet-done">Done</button>}
    initialFocusTestID={initialFocusTestID}
    title="Details"
    visible={visible}
    onClose={onClose}
  >
    <input data-testid="sheet-first" />
    <input data-testid="sheet-second" />
  </SideSheet>
);

afterEach(() => {
  screen.queryByTestId(OPENER_TEST_ID)?.remove();
  document.body.style.overflow = '';
  jest.restoreAllMocks();
});

describe('SideSheet open state', () => {
  it('with visible true, mounts the dialog', () => {
    render(sheet(true, jest.fn()));

    const dialog = screen.queryByTestId('side-sheet');

    expect(dialog).not.toBeNull();
  });

  it('with visible false, does not mount the dialog', () => {
    render(sheet(false, jest.fn()));

    const dialog = screen.queryByTestId('side-sheet');

    expect(dialog).toBeNull();
  });

  it('after visible turns false, unmounts the dialog', () => {
    const { rerender } = render(sheet(true, jest.fn()));

    rerender(sheet(false, jest.fn()));

    expect(screen.queryByTestId('side-sheet')).toBeNull();
  });

  it('with visible true, marks the dialog aria-modal', () => {
    render(sheet(true, jest.fn()));

    const dialog = screen.getByTestId('side-sheet');

    expect(dialog.getAttribute('aria-modal')).toBe('true');
  });
});

describe('SideSheet dismissal', () => {
  it('with the scrim pressed, calls onClose once', () => {
    const onClose = jest.fn();
    render(sheet(true, onClose));

    fireEvent.click(screen.getByTestId('side-sheet-scrim'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('with Escape pressed while open, calls onClose once', () => {
    const onClose = jest.fn();
    render(sheet(true, onClose));

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('with Escape pressed while closed, does not call onClose', () => {
    const onClose = jest.fn();
    render(sheet(false, onClose));

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).not.toHaveBeenCalled();
  });
});

const SheetWithMenu = ({ onClose }: { onClose: () => void }): React.ReactElement => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  return (
    <SideSheet footer={null} title="Details" visible onClose={() => onClose()}>
      <button
        aria-expanded={isMenuOpen}
        aria-haspopup="listbox"
        data-testid={MENU_TRIGGER_TEST_ID}
        onKeyDown={() => setIsMenuOpen(false)}
      />
    </SideSheet>
  );
};

const pressAndReleaseEscape = (target: Element): void => {
  fireEvent.keyDown(target, { key: 'Escape' });
  fireEvent.keyUp(target, { key: 'Escape' });
};

describe('SideSheet Escape with a menu inside', () => {
  it('with a menu open, Escape closes the menu and leaves the sheet open', () => {
    const onClose = jest.fn();
    render(<SheetWithMenu onClose={onClose} />);

    pressAndReleaseEscape(screen.getByTestId(MENU_TRIGGER_TEST_ID));

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByTestId(MENU_TRIGGER_TEST_ID).getAttribute('aria-expanded')).toBe('false');
  });

  it('after the menu closed, a second Escape calls onClose once', () => {
    const onClose = jest.fn();
    render(<SheetWithMenu onClose={onClose} />);
    pressAndReleaseEscape(screen.getByTestId(MENU_TRIGGER_TEST_ID));

    pressAndReleaseEscape(screen.getByTestId(MENU_TRIGGER_TEST_ID));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('with no menu open, one Escape press and release calls onClose once', () => {
    const onClose = jest.fn();
    render(sheet(true, onClose));

    pressAndReleaseEscape(screen.getByTestId('sheet-first'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('SideSheet off web', () => {
  it('with a close request from the modal, calls onClose once', () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    const onClose = jest.fn();
    render(sheet(true, onClose));

    fireEvent.keyUp(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('SideSheet focus', () => {
  it('with initialFocusTestID, focuses that control on open', async () => {
    render(sheet(true, jest.fn(), 'sheet-second'));

    await flushFocus();

    expect(document.activeElement).toBe(screen.getByTestId('sheet-second'));
  });

  it('when opened from closed, focuses the control named by initialFocusTestID', async () => {
    const { rerender } = render(sheet(false, jest.fn(), 'sheet-second'));

    rerender(sheet(true, jest.fn(), 'sheet-second'));
    await flushFocus();

    expect(document.activeElement).toBe(screen.getByTestId('sheet-second'));
  });

  it('after closing, returns focus to the opener', async () => {
    const opener = addFocusedOpener();
    const { rerender } = render(sheet(false, jest.fn(), 'sheet-second'));
    rerender(sheet(true, jest.fn(), 'sheet-second'));
    await flushFocus();
    screen.getByTestId('sheet-first').focus();

    rerender(sheet(false, jest.fn(), 'sheet-second'));
    await flushFocus();

    expect(document.activeElement).toBe(opener);
  });

  it('with Tab on the last control, wraps focus to the first', async () => {
    render(sheet(true, jest.fn()));
    await flushFocus();
    const last = screen.getByTestId('sheet-done');
    last.focus();

    fireEvent.keyDown(last, { key: 'Tab' });

    expect(document.activeElement).toBe(screen.getByTestId('sheet-first'));
  });
});

describe('SideSheet scroll lock', () => {
  it('while open, locks page scroll', () => {
    document.body.style.overflow = 'scroll';

    render(sheet(true, jest.fn()));

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('after closing, restores page scroll', () => {
    document.body.style.overflow = 'scroll';
    const { rerender } = render(sheet(true, jest.fn()));

    rerender(sheet(false, jest.fn()));

    expect(document.body.style.overflow).toBe('scroll');
  });
});
