import { fireEvent, render, screen } from '@testing-library/react';

import { ShowAllList } from './ShowAllList';
import { visibleRows } from './visibleRows';

const renderList = (rows: number[]): void => {
  render(
    <ShowAllList limit={2} rows={rows} showAllLabel="Show all" showFewerLabel="Show fewer" testID="list" toggleHint="Toggles the list">
      {(shown) => <span data-testid="shown">{shown.join(',')}</span>}
    </ShowAllList>,
  );
};

describe('visibleRows', () => {
  it('with more rows than the limit and collapsed, returns the first limit rows as collapsible', () => {
    const rows = [1, 2, 3];

    const slice = visibleRows(rows, 2, false);

    expect(slice).toEqual({ rows: [1, 2], collapsible: true });
  });

  it('with rows within the limit, returns them all and not collapsible', () => {
    const rows = [1, 2];

    const slice = visibleRows(rows, 2, false);

    expect(slice).toEqual({ rows: [1, 2], collapsible: false });
  });
});

describe('ShowAllList', () => {
  it('when the toggle is pressed, shows every row and the fewer label', () => {
    renderList([1, 2, 3]);

    fireEvent.click(screen.getByTestId('list-toggle'));

    expect({ shown: screen.getByTestId('shown').textContent, toggle: screen.getByTestId('list-toggle').textContent }).toEqual({ shown: '1,2,3', toggle: 'Show fewer' });
  });

  it('with rows within the limit, renders no toggle', () => {
    renderList([1]);

    const toggle = screen.queryByTestId('list-toggle');

    expect(toggle).toBeNull();
  });
});
