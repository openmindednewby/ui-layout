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

  it('with no value, copies nothing and disables the chip', async () => {
    const writer = jest.fn();
    render(<IdChip accessibilityHint="hint" accessibilityLabel="copy" display="-" label="External ID" testID="chip" value={null} writer={writer} />);

    await act(async () => { fireEvent.click(screen.getByTestId('chip')); });

    expect({ copied: writer.mock.calls.length, disabled: screen.getByTestId('chip').getAttribute('aria-disabled') }).toEqual({ copied: 0, disabled: 'true' });
  });

  it('with an empty value, copies nothing', async () => {
    const writer = jest.fn();
    render(<IdChip accessibilityHint="hint" accessibilityLabel="copy" display="-" label="External ID" testID="chip" value="" writer={writer} />);

    await act(async () => { fireEvent.click(screen.getByTestId('chip')); });

    expect(writer).not.toHaveBeenCalled();
  });

  it('with a width, sets that width on the chip', () => {
    const width = 200;

    render(<IdChip accessibilityHint="hint" accessibilityLabel="copy" label="ID" testID="chip" value={FULL} width={width} />);

    expect(getComputedStyle(screen.getByTestId('chip')).width).toBe('200px');
  });
});
