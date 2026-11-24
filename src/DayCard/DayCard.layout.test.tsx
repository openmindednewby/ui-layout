import { render, screen } from '@testing-library/react';

import { DayCard } from './DayCard';
import { DayCardLayout } from './DayCardLayout';

jest.mock('@dloizides/ui-icons', () => ({ SvgIcon: () => null }));

const renderDay = (layout?: DayCardLayout): void => {
  render(
    <DayCard accessibilityHint="Items opened that day" accessibilityLabel="Opened Nov 11" badge="waiting 7 days" count={2} label="Opened Nov 11" layout={layout} testID="day">
      <span>Tomas Rehn</span>
      <span>Aino Virta</span>
    </DayCard>,
  );
};

describe('DayCard layout', () => {
  it('with the separate layout, puts each row in its own card', () => {
    const layout = DayCardLayout.Separate;

    renderDay(layout);

    expect(screen.getByTestId('day-item-0').textContent).toBe('Tomas Rehn');
    expect(screen.getByTestId('day-item-1').textContent).toBe('Aino Virta');
  });

  it('with no layout, keeps every row in one shared card', () => {
    const layout = undefined;

    renderDay(layout);

    expect(screen.queryByTestId('day-item-0')).toBeNull();
    expect(screen.getByText('Tomas Rehn').parentElement).toBe(screen.getByText('Aino Virta').parentElement);
  });
});
