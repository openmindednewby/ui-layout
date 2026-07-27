import { fireEvent, render, screen } from '@testing-library/react';

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
