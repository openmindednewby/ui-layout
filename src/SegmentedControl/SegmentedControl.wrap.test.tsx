import { render, screen } from '@testing-library/react';

import { SegmentedControl } from './SegmentedControl';

const OPTIONS = [
  { value: 'top', label: 'Top bar' },
  { value: 'side', label: 'Side rail' },
  { value: 'both', label: 'Both' },
];

function segmentLabel(label: string): HTMLElement {
  render(<SegmentedControl accessibilityLabel="Navigation orientation" options={OPTIONS} value="top" onChange={jest.fn()} />);
  return screen.getByText(label);
}

describe('SegmentedControl label wrapping', () => {
  it('with a narrow track, never breaks a label inside a word', () => {
    const label = segmentLabel('Both');

    expect({ wordBreak: label.style.wordBreak, overflowWrap: label.style.overflowWrap }).toEqual({ wordBreak: 'normal', overflowWrap: 'normal' });
  });

  it('with a narrow track, keeps each segment at least its longest word wide', () => {
    const label = segmentLabel('Both');

    expect(label.parentElement?.style.minWidth).toBe('auto');
  });
});
