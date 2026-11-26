import { render, screen } from '@testing-library/react';

import { ListRow } from './ListRow';
import { RowSelectedStyle } from './RowSelectedStyle';

const TEST_ID = 'row';

function renderRadio(selected: boolean): void {
  render(
    <ListRow
      accessibilityHint="Chooses this account"
      accessibilityLabel="Current account"
      selected={selected}
      selectedStyle={RowSelectedStyle.Radio}
      testID={TEST_ID}
      title="Current account"
      onPress={jest.fn()}
    />,
  );
}

describe('ListRow radio style', () => {
  it('with a selected radio row, announces a checked radio', () => {
    renderRadio(true);

    const row = screen.getByTestId(TEST_ID);
    expect([row.getAttribute('role'), row.getAttribute('aria-checked')]).toEqual(['radio', 'true']);
  });

  it('with an unselected radio row, announces an unchecked radio without a pressed state', () => {
    renderRadio(false);

    const row = screen.getByTestId(TEST_ID);
    expect([row.getAttribute('aria-checked'), row.getAttribute('aria-pressed')]).toEqual(['false', null]);
  });

  it('with a selected radio row, draws the dot and hides the mark from assistive tech', () => {
    renderRadio(true);

    const mark = screen.getByTestId(`${TEST_ID}-radio`);
    expect([mark.getAttribute('aria-hidden'), screen.queryByTestId(`${TEST_ID}-radio-dot`) !== null]).toEqual(['true', true]);
  });

  it('with an unselected radio row, draws the empty ring only', () => {
    renderRadio(false);

    const dot = screen.queryByTestId(`${TEST_ID}-radio-dot`);
    expect(dot).toBeNull();
  });
});
