import type React from 'react';

import { render, screen } from '@testing-library/react';

import { ListRow } from './ListRow';

const LONG_TITLE = 'Monthly transfer to the shared savings account for the family holiday fund';

function renderRow(trailing: React.ReactNode): void {
  render(
    <ListRow
      accessibilityHint="Opens the line"
      accessibilityLabel="Line"
      selected={false}
      testID="row"
      title={LONG_TITLE}
      trailing={trailing}
      onPress={jest.fn()}
    />,
  );
}

describe('ListRow trailing', () => {
  it('with a long title and a text amount, keeps the amount on one line and never shrinks it', () => {
    renderRow('-€2,500.00');

    const amount = getComputedStyle(screen.getByTestId('row-trailing'));

    expect({ wrap: amount.whiteSpace, shrink: amount.flexShrink }).toEqual({ wrap: 'nowrap', shrink: '0' });
  });

  it('with a long title and a text amount, lets the title shrink instead, down to its longest word', () => {
    renderRow('-€2,500.00');

    const title = getComputedStyle(screen.getByText(LONG_TITLE));

    expect({ shrink: title.flexShrink, min: title.minWidth }).toEqual({ shrink: '1', min: 'auto' });
  });

  it('with a node amount, wraps it in a box that never shrinks', () => {
    renderRow(<span data-testid="amount">-€2,500.00</span>);

    const box = getComputedStyle(screen.getByTestId('amount').parentElement as HTMLElement);

    expect(box.flexShrink).toBe('0');
  });

  it('without a trailing slot, renders no trailing box', () => {
    renderRow(undefined);

    const box = screen.queryByTestId('row-trailing');

    expect(box).toBeNull();
  });
});
