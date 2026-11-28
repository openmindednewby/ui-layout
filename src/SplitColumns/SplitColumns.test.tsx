import { render, screen } from '@testing-library/react';

import { isSplitAt, SplitColumns } from './SplitColumns';

describe('isSplitAt', () => {
  it.each([
    [null, false],
    [599, false],
    [600, true],
  ])('with a container width of %s against 600, returns %s', (width, expected) => {
    const minWidth = 600;

    const split = isSplitAt(width, minWidth);

    expect(split).toBe(expected);
  });
});

describe('SplitColumns', () => {
  it('before the container is measured, stacks the columns', () => {
    render(<SplitColumns end={<span />} minWidth={600} start={<span />} testID="split" />);

    const direction = getComputedStyle(screen.getByTestId('split')).flexDirection;

    expect(direction).not.toBe('row');
  });
});
