import { fireEvent, render, screen } from '@testing-library/react';

import { ListRow } from './ListRow';
import { RowSelectedStyle } from './RowSelectedStyle';

const TEST_ID = 'row';

function renderRow(selected: boolean, onPress = jest.fn(), selectedStyle?: RowSelectedStyle): jest.Mock {
  render(
    <ListRow
      accessibilityHint="Shows the invoice"
      accessibilityLabel="2026-002, Acme, 10.00"
      selected={selected}
      selectedStyle={selectedStyle}
      testID={TEST_ID}
      title="2026-002"
      trailing="10.00"
      onPress={onPress}
    />,
  );
  return onPress;
}

describe('ListRow', () => {
  it('with a selected row, exposes selected as pressed state', () => {
    renderRow(true);

    expect(screen.getByTestId(TEST_ID).getAttribute('aria-pressed')).toBe('true');
  });

  it('with an unselected row, exposes not pressed', () => {
    renderRow(false);

    expect(screen.getByTestId(TEST_ID).getAttribute('aria-pressed')).toBe('false');
  });

  it('when pressed, calls onPress once', () => {
    const onPress = renderRow(false);

    fireEvent.click(screen.getByTestId(TEST_ID));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('with the check style, hides the check mark from assistive tech', () => {
    renderRow(true, jest.fn(), RowSelectedStyle.Check);

    expect(screen.getByTestId(`${TEST_ID}-check`).getAttribute('aria-hidden')).toBe('true');
  });

  it('with the default style, renders no check mark', () => {
    renderRow(true);

    expect(screen.queryByTestId(`${TEST_ID}-check`)).toBeNull();
  });
});
