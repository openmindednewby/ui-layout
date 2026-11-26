import { render, screen } from '@testing-library/react';

import { FactCard } from './FactCard';
import { FactRow } from './FactRow';

describe('FactCard', () => {
  it('with rows, puts the title above a bordered card that holds the rows', () => {
    render(<FactCard testID="card" title="Summary"><FactRow first label="Total" testID="row" value="10" /></FactCard>);

    const card = screen.getByTestId('row').parentElement as HTMLElement;

    expect({ title: screen.getByTestId('card').firstChild?.textContent, border: getComputedStyle(card).borderTopWidth }).toEqual({ title: 'Summary', border: '1px' });
  });
});

describe('FactRow', () => {
  it('as the first row, drops the top divider', () => {
    render(<FactRow first label="Total" testID="row" value="10" />);

    const border = getComputedStyle(screen.getByTestId('row')).borderTopWidth;

    expect(border).toBe('0px');
  });

  it('as a later row, keeps a 1px top divider', () => {
    render(<FactRow label="Total" testID="row" value="10" />);

    const border = getComputedStyle(screen.getByTestId('row')).borderTopWidth;

    expect(border).toBe('1px');
  });

  it('with notes, renders them under the label and keeps the value right-aligned and unshrunk', () => {
    render(<FactRow label="Total" testID="row" value="10"><span data-testid="note" /></FactRow>);

    const value = getComputedStyle(screen.getByTestId('row-value'));

    expect({ besideLabel: screen.getByTestId('note').parentElement?.firstChild?.textContent, align: value.textAlign, shrink: value.flexShrink }).toEqual({ besideLabel: 'Total', align: 'right', shrink: '0' });
  });
});
