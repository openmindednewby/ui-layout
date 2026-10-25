import { act, fireEvent, render, screen } from '@testing-library/react';

import { Modal } from './Modal';

// Stub the icon so the test doesn't pull react-native-svg into jsdom.
jest.mock('@dloizides/ui-icons', () => ({ SvgIcon: () => null }));

// Reads theme/translate from @dloizides/ui-feedback's default context (no provider needed).

describe('Modal', () => {
  it('renders the dialog, title, body and footer when visible', () => {
    render(
      <Modal visible title="Edit details" footer={<span>Footer</span>} onClose={jest.fn()}>
        <span>Body content</span>
      </Modal>,
    );

    expect(screen.getByTestId('modal')).toBeTruthy();
    expect(screen.getByText('Edit details')).toBeTruthy();
    expect(screen.getByText('Body content')).toBeTruthy();
    expect(screen.getByText('Footer')).toBeTruthy();
  });

  it('does not render the dialog when not visible', () => {
    render(
      <Modal visible={false} title="Hidden" onClose={jest.fn()}>
        <span>Body</span>
      </Modal>,
    );

    expect(screen.queryByTestId('modal')).toBeNull();
  });

  it('calls onClose when the ✕ close button is pressed', () => {
    const onClose = jest.fn();
    render(
      <Modal visible title="Edit" onClose={onClose}>
        <span>Body</span>
      </Modal>,
    );

    fireEvent.click(screen.getByTestId('modal-close'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the backdrop is pressed', () => {
    const onClose = jest.fn();
    render(
      <Modal visible title="Edit" onClose={onClose}>
        <span>Body</span>
      </Modal>,
    );

    fireEvent.click(screen.getByTestId('modal-backdrop'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape is pressed', () => {
    const onClose = jest.fn();
    render(
      <Modal visible title="Edit" onClose={onClose}>
        <span>Body</span>
      </Modal>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalled();
  });

  it('hides the ✕ close button when showClose is false', () => {
    render(
      <Modal visible showClose={false} title="No close" onClose={jest.fn()}>
        <span>Body</span>
      </Modal>,
    );

    expect(screen.queryByTestId('modal-close')).toBeNull();
  });

  it('honours a custom testID for its derived close/backdrop ids', () => {
    render(
      <Modal visible testID="edit-attendee" title="Edit" onClose={jest.fn()}>
        <span>Body</span>
      </Modal>,
    );

    expect(screen.getByTestId('edit-attendee')).toBeTruthy();
    expect(screen.getByTestId('edit-attendee-close')).toBeTruthy();
    expect(screen.getByTestId('edit-attendee-backdrop')).toBeTruthy();
  });
});

describe('Modal initial focus', () => {
  it('with an autoFocus child, keeps focus on that child', async () => {
    render(
      <Modal visible title="Add attendee" onClose={jest.fn()}>
        <input autoFocus data-testid="attendee-name" />
      </Modal>,
    );

    await act(async () => Promise.resolve());

    expect(document.activeElement).toBe(screen.getByTestId('attendee-name'));
  });

  it('with initialFocusTestID, focuses the element carrying that testID', async () => {
    render(
      <Modal visible initialFocusTestID="attendee-email" title="Add attendee" onClose={jest.fn()}>
        <input data-testid="attendee-name" />
        <input data-testid="attendee-email" />
      </Modal>,
    );

    await act(async () => Promise.resolve());

    expect(document.activeElement).toBe(screen.getByTestId('attendee-email'));
  });

  it('with no autoFocus child and no initialFocusTestID, focuses the first focusable element', async () => {
    render(
      <Modal visible title="Add attendee" onClose={jest.fn()}>
        <input data-testid="attendee-name" />
      </Modal>,
    );

    await act(async () => Promise.resolve());

    expect(document.activeElement).toBe(screen.getByTestId('modal-close'));
  });
});
