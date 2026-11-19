import { render, screen } from '@testing-library/react';

import { DayCard } from './DayCard';

describe('DayCard', () => {
  it('with three items, shows the count beside the day label and badge', () => {
    render(<DayCard accessibilityHint="Items opened that day" accessibilityLabel="Opened Nov 8" badge="waiting 10 days" count={3} label="Opened Nov 8" testID="day"><span>row</span></DayCard>);

    const text = screen.getByTestId('day').textContent ?? '';

    expect(text).toContain('Opened Nov 8');
    expect(text).toContain('waiting 10 days');
    expect(text).toContain('3');
  });
});
