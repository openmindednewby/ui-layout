import { act, fireEvent, render, screen } from '@testing-library/react';

import { IdChip } from './IdChip';

const FULL = 'modc-applicant-202611200143';
const SHORT = 'modc…0143';

describe('IdChip', () => {
  it('when pressed, copies the full value, not the display text', async () => {
    const writer = jest.fn();
    render(<IdChip accessibilityHint="hint" accessibilityLabel="copy" display={SHORT} label="External ID" testID="chip" value={FULL} writer={writer} />);

    await act(async () => { fireEvent.click(screen.getByTestId('chip')); });

    expect(writer).toHaveBeenCalledWith(FULL);
  });

  it('with a valueTestID, puts that id on the value text only', () => {
    render(<IdChip accessibilityHint="hint" accessibilityLabel="copy" label="External ID" testID="chip" value={FULL} valueTestID="chip-value" />);

    const value = screen.getByTestId('chip-value');

    expect(value.textContent).toBe(FULL);
  });

  it('after a copy, shows the copied glyph', async () => {
    render(<IdChip accessibilityHint="hint" accessibilityLabel="copy" label="ID" testID="chip" value={FULL} writer={jest.fn()} />);

    await act(async () => { fireEvent.click(screen.getByTestId('chip')); });

    expect(screen.getByTestId('chip-glyph').textContent).toBe('✓');
  });
});
