import { render, screen } from '@testing-library/react';

import { SegmentedControl } from './SegmentedControl';
import { SegmentedVariant } from './SegmentedVariant';

const OPTIONS = [
  { label: 'Send a link', value: 'link', testID: 'seg-link' },
  { label: 'Upload evidence', value: 'upload', testID: 'seg-upload' },
] as const;
const noop = (): void => undefined;

describe('SegmentedControl filled stretch', () => {
  it('with variant Filled, stretch and a selected colour, fills the selected segment and shares the width', () => {
    const selectedColor = 'rgb(10, 20, 30)';

    render(<SegmentedControl stretch accessibilityLabel="Mode" options={OPTIONS} selectedColor={selectedColor} testID="seg" value="link" variant={SegmentedVariant.Filled} onChange={noop} />);

    const selected = window.getComputedStyle(screen.getByTestId('seg-link'));
    expect(selected.backgroundColor).toBe('rgb(10, 20, 30)');
    expect(selected.flexGrow).toBe('1');
    expect(window.getComputedStyle(screen.getByTestId('seg-upload')).backgroundColor).not.toBe('rgb(10, 20, 30)');
  });

  it('without the new props, keeps the content-width track', () => {
    render(<SegmentedControl accessibilityLabel="Mode" options={OPTIONS} testID="seg" value="link" onChange={noop} />);

    const track = window.getComputedStyle(screen.getByTestId('seg'));

    expect(track.alignSelf).toBe('flex-start');
  });
});
