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

  it('hides the close button when showClose is false', () => {
    render(<ModalShell visible showClose={false} title="No close" onCancel={() => undefined} />);
    expect(screen.queryByTestId('cancel-button')).toBeNull();
  });
});
