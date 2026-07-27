import { fireEvent, render, screen } from '@testing-library/react';

import { ConfirmDialog } from './ConfirmDialog';

// Stub the icon so the (unused, showClose=false) close path never pulls react-native-svg into jsdom.
jest.mock('@dloizides/ui-icons', () => ({ SvgIcon: () => null }));

// Stub the button kit so the variant/loading/disabled DECISIONS are asserted directly from the DOM,
// rather than by inspecting themed colours (brittle under jsdom's class-based style injection).
jest.mock('@dloizides/ui-buttons', () => {
  const ReactModule = require('react') as typeof import('react');
  interface StubButtonProps {
    label: string;
    variant?: string;
    loading?: boolean;
    disabled?: boolean;
    testID: string;
    onPress: () => void;
  }
  const Button = ({ label, variant, loading, disabled, testID, onPress }: StubButtonProps) =>
    ReactModule.createElement(
      'button',
      {
        'data-testid': testID,
        'data-variant': variant,
        'data-loading': loading === true ? 'true' : 'false',
        disabled: disabled === true,
        onClick: onPress,
      },
      label,
    );
  interface StubIconButtonProps { testID: string; accessibilityLabel: string; onPress: () => void }
  const IconButton = ({ testID, accessibilityLabel, onPress }: StubIconButtonProps) =>
    ReactModule.createElement('button', { 'data-testid': testID, onClick: onPress }, accessibilityLabel);
  return { Button, IconButton };
});

const baseProps = {
  visible: true,
  title: 'Remove attendee?',
  message: "This can't be undone.",
  onConfirm: jest.fn(),
  onCancel: jest.fn(),
};

describe('ConfirmDialog', () => {
  it('renders the title and message when visible', () => {
    render(<ConfirmDialog {...baseProps} />);

    expect(screen.getByTestId('confirm-dialog')).toBeTruthy();
    expect(screen.getByText('Remove attendee?')).toBeTruthy();
    expect(screen.getByText("This can't be undone.")).toBeTruthy();
  });

  it('calls onConfirm when Confirm is pressed', () => {
    const onConfirm = jest.fn();
    render(<ConfirmDialog {...baseProps} onConfirm={onConfirm} />);

    fireEvent.click(screen.getByTestId('confirm-dialog-confirm'));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when Cancel is pressed', () => {
    const onCancel = jest.fn();
    render(<ConfirmDialog {...baseProps} onCancel={onCancel} />);

    fireEvent.click(screen.getByTestId('confirm-dialog-cancel'));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when the backdrop is pressed', () => {
    const onCancel = jest.fn();
    render(<ConfirmDialog {...baseProps} onCancel={onCancel} />);

    fireEvent.click(screen.getByTestId('confirm-dialog-backdrop'));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when Escape is pressed', () => {
    const onCancel = jest.fn();
    render(<ConfirmDialog {...baseProps} onCancel={onCancel} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onCancel).toHaveBeenCalled();
  });

  it('uses the danger variant for the Confirm button when destructive', () => {
    render(<ConfirmDialog {...baseProps} destructive />);

    expect(screen.getByTestId('confirm-dialog-confirm').getAttribute('data-variant')).toBe('danger');
  });

  it('uses the primary variant for the Confirm button by default', () => {
    render(<ConfirmDialog {...baseProps} />);

    expect(screen.getByTestId('confirm-dialog-confirm').getAttribute('data-variant')).toBe('primary');
  });

  it('shows the Confirm spinner and disables Cancel while busy', () => {
    render(<ConfirmDialog {...baseProps} busy />);

    expect(screen.getByTestId('confirm-dialog-confirm').getAttribute('data-loading')).toBe('true');
    expect(screen.getByTestId('confirm-dialog-cancel').hasAttribute('disabled')).toBe(true);
  });

  it('renders caller-supplied confirm/cancel labels over the defaults', () => {
    render(<ConfirmDialog {...baseProps} cancelLabel="Keep" confirmLabel="Delete" />);

    expect(screen.getByText('Delete')).toBeTruthy();
    expect(screen.getByText('Keep')).toBeTruthy();
  });
});
