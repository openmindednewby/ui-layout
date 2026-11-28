import { render, screen } from '@testing-library/react';

import { AlertBand } from './AlertBand';

const COLORS = { background: 'rgb(1, 2, 3)', border: 'rgb(4, 5, 6)', text: 'rgb(7, 8, 9)', muted: 'rgb(10, 11, 12)' };

describe('AlertBand', () => {
  it('when wide, lays the text and the action out in one row', () => {
    render(<AlertBand wide action={<span />} colors={COLORS} testID="band" title="Face match failed" />);

    const style = getComputedStyle(screen.getByTestId('band'));

    expect({ direction: style.flexDirection, fill: style.backgroundColor }).toEqual({ direction: 'row', fill: 'rgb(1, 2, 3)' });
  });

  it('when narrow, stacks the action under the text', () => {
    render(<AlertBand action={<span />} colors={COLORS} testID="band" title="Face match failed" wide={false} />);

    const direction = getComputedStyle(screen.getByTestId('band')).flexDirection;

    expect(direction).not.toBe('row');
  });

  it('without a reason or action, renders only the title', () => {
    render(<AlertBand testID="band" title="Face match failed" wide={false} />);

    const band = screen.getByTestId('band');

    expect({ text: band.textContent, action: screen.queryByTestId('band-action') }).toEqual({ text: 'Face match failed', action: null });
  });
});
