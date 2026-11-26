import { render, screen } from '@testing-library/react';

import { ListRow } from './ListRow';
import { ListRowDensityContext, RowDensity } from './RowDensity';

describe('ListRow density', () => {
  it('inside a compact provider, uses 6 px row padding and keeps a 44 px minimum height', () => {
    render(
      <ListRowDensityContext.Provider value={RowDensity.Compact}>
        <ListRow accessibilityHint="hint" accessibilityLabel="row" selected={false} testID="row" title="Session" trailing="›" onPress={jest.fn()} />
      </ListRowDensityContext.Provider>,
    );

    const row = getComputedStyle(screen.getByTestId('row'));

    expect([row.paddingTop, row.minHeight]).toEqual(['6px', '44px']);
  });

  it('without a provider, keeps the 12 px row padding', () => {
    render(<ListRow accessibilityHint="hint" accessibilityLabel="row" selected={false} testID="row" title="Session" onPress={jest.fn()} />);

    const row = getComputedStyle(screen.getByTestId('row'));

    expect(row.paddingTop).toBe('12px');
  });
});
