import { render, screen, fireEvent } from '@testing-library/react';

import { ModalShell } from './ModalShell';

// Stub the icon so the test doesn't pull react-native-svg into jsdom.
jest.mock('@dloizides/ui-icons', () => ({ SvgIcon: () => null }));

describe('ModalShell', () => {
  it('renders the modal with title + close button when visible', () => {
    const onCancel = jest.fn();
    render(<ModalShell visible title="Edit item" onCancel={onCancel} />);
    expect(screen.getByTestId('template-modal')).toBeTruthy();
    expect(screen.getByText('Edit item')).toBeTruthy();
    fireEvent.click(screen.getByTestId('cancel-button'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('gives the close button a hit box of at least 44px', () => {
    render(<ModalShell visible title="Edit item" onCancel={() => undefined} />);
    const close = window.getComputedStyle(screen.getByTestId('cancel-button'));
    expect(parseFloat(close.minWidth)).toBeGreaterThanOrEqual(44);
    expect(parseFloat(close.minHeight)).toBeGreaterThanOrEqual(44);
  });

  it('hides the close button when showClose is false', () => {
    render(<ModalShell visible showClose={false} title="No close" onCancel={() => undefined} />);
    expect(screen.queryByTestId('cancel-button')).toBeNull();
  });
});
