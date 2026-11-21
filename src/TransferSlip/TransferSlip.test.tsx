import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { CopyRowEmphasis } from './CopyRowEmphasis';
import { CopyValueRow } from './CopyValueRow';
import { TransferSlip } from './TransferSlip';
import { COPY_FEEDBACK_MS } from '../CopyableId/useCopyToClipboard';

const LABELS = { copy: 'Copy', copied: 'Copied', failed: 'Copy failed', hint: 'Copies the value' };

describe('CopyValueRow', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('when pressed, copies the copy value rather than the display value', async () => {
    const writer = jest.fn();
    render(<CopyValueRow copyValue="CY590020" label="IBAN" labels={LABELS} testID="iban" value="CY59 0020" writer={writer} />);

    fireEvent.click(screen.getByTestId('iban-copy'));

    await waitFor(() => expect(writer).toHaveBeenCalledWith('CY590020'));
  });

  it('after a copy, shows the copied label then returns to copy after the feedback time', async () => {
    jest.useFakeTimers();
    render(<CopyValueRow emphasis={CopyRowEmphasis.Prominent} label="IBAN" labels={LABELS} testID="iban" value="CY59" writer={jest.fn()} />);
    fireEvent.click(screen.getByTestId('iban-copy'));
    await waitFor(() => expect(screen.getByTestId('iban-copy').getAttribute('aria-label')).toBe('Copied: IBAN'));

    act(() => {
      jest.advanceTimersByTime(COPY_FEEDBACK_MS);
    });

    expect(screen.getByTestId('iban-copy').getAttribute('aria-label')).toBe('Copy: IBAN');
  });

  it('when the clipboard refuses, shows the failed label', async () => {
    const writer = jest.fn(() => Promise.reject(new Error('denied')));
    render(<CopyValueRow label="SWIFT" labels={LABELS} testID="swift" value="BCYPCY2N" writer={writer} />);

    fireEvent.click(screen.getByTestId('swift-copy'));

    await waitFor(() => expect(screen.getByTestId('swift-copy').getAttribute('aria-label')).toBe('Copy failed: SWIFT'));
  });
});

describe('TransferSlip', () => {
  it('with an amount, shows it in the lead', () => {
    const amount = '844,00';

    render(<TransferSlip amount={amount} leadLabel="You pay" testID="slip"><span /></TransferSlip>);

    expect(screen.getByTestId('slip-amount').textContent).toBe(amount);
  });
});
