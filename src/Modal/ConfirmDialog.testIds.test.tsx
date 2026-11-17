import { act, render, screen } from '@testing-library/react';

import { ConfirmDialog } from './ConfirmDialog';
import { ConfirmDialogFocus } from './ConfirmDialogFocus';

jest.mock('@dloizides/ui-icons', () => ({ SvgIcon: () => null }));

jest.mock('@dloizides/ui-buttons', () => {
  const ReactModule = require('react') as typeof import('react');
  interface StubButtonProps { label: string; testID: string; onPress: () => void }
  const Button = ({ label, testID, onPress }: StubButtonProps) =>
    ReactModule.createElement('button', { 'data-testid': testID, onClick: onPress }, label);
  return { Button, IconButton: () => null };
});

const baseProps = {
  testID: 'modc-decision',
  visible: true,
  title: 'Approve case?',
  message: 'The case moves to approved.',
  onConfirm: jest.fn(),
  onCancel: jest.fn(),
};

describe('ConfirmDialog testIDs', () => {
  it('with confirmTestID and cancelTestID set, renders the buttons under those ids', () => {
    const confirmTestID = 'modc-decision-approve';
    const cancelTestID = 'modc-decision-keep';

    render(<ConfirmDialog {...baseProps} cancelTestID={cancelTestID} confirmTestID={confirmTestID} />);

    expect(screen.getByTestId(confirmTestID).textContent).toBe('common.confirm');
    expect(screen.getByTestId(cancelTestID).textContent).toBe('common.cancel');
  });

  it('with no override, keeps the ids derived from the base testID', () => {
    render(<ConfirmDialog {...baseProps} />);

    expect(screen.getByTestId('modc-decision-confirm')).toBeTruthy();
    expect(screen.getByTestId('modc-decision-cancel')).toBeTruthy();
  });

  it('with confirmTestID and Confirm initial focus, focuses the overridden Confirm id', async () => {
    const confirmTestID = 'modc-decision-approve';
    render(<ConfirmDialog {...baseProps} confirmTestID={confirmTestID} initialFocus={ConfirmDialogFocus.Confirm} />);

    await act(async () => Promise.resolve());

    expect(document.activeElement?.getAttribute('data-testid')).toBe(confirmTestID);
  });
});
