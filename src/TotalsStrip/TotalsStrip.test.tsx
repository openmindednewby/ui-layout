import { render, screen } from '@testing-library/react';

import { TotalsStrip } from './TotalsStrip';
import { TotalsTone } from './TotalsTone';

const ITEMS = [
  { key: 'unpaid', label: 'Unpaid', value: '1.291,00', caption: '2 items' },
  { key: 'overdue', label: 'Overdue', value: '0,00', tone: TotalsTone.Alert },
];

describe('TotalsStrip', () => {
  it('with two items, renders one tile per item keyed by its key', () => {
    const items = ITEMS;

    render(<TotalsStrip items={items} testID="totals" />);

    expect([screen.getByTestId('totals-unpaid-value').textContent, screen.getByTestId('totals-overdue-value').textContent]).toEqual(['1.291,00', '0,00']);
  });

  it('with an alert tone, colours the value differently from a neutral one', () => {
    const items = ITEMS;

    render(<TotalsStrip items={items} testID="totals" />);

    const colours = ['totals-unpaid-value', 'totals-overdue-value'].map((id) => getComputedStyle(screen.getByTestId(id)).color);
    expect(colours[0]).not.toBe(colours[1]);
  });
});
