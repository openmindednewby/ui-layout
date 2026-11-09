import { act, fireEvent, render, screen } from '@testing-library/react';

import { SideSheet } from './SideSheet';

const flushFocus = async (): Promise<void> => {
  await act(async () => Promise.resolve());
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

describe('SideSheet focus', () => {
  it('with initialFocusTestID, focuses that control on open', async () => {
    render(sheet(true, jest.fn(), 'sheet-second'));

    await flushFocus();

    expect(document.activeElement).toBe(screen.getByTestId('sheet-second'));
  });

  it('after closing, returns focus to the opener', async () => {
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();
    const { rerender } = render(sheet(true, jest.fn(), 'sheet-second'));
    await flushFocus();
    expect(document.activeElement).toBe(screen.getByTestId('sheet-second'));

    rerender(sheet(false, jest.fn(), 'sheet-second'));
    await flushFocus();

    expect(document.activeElement).toBe(opener);
    opener.remove();
  });
});
