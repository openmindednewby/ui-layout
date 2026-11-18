import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { FoldingGroups } from './FoldingGroups';
import { groupItems } from './groupItems';

jest.mock('@dloizides/ui-icons', () => ({ SvgIcon: () => null }));

interface Row {
  id: string;
  group: string;
}

const ROWS: Row[] = [
  { id: 'r1', group: '1' },
  { id: 'r2', group: '2' },
  { id: 'r3', group: '1' },
];

const groupOf = (row: Row): { id: string; title: string } => ({ id: row.group, title: `Group ${row.group}` });
const rowKey = (row: Row): string => row.id;
const renderRow = (row: Row): React.ReactNode => <span>{row.id}</span>;
const expanded = (id: string): string | null =>
  screen.getByTestId(`folding-groups-group-${id}`).getAttribute('aria-expanded');

describe('groupItems', () => {
  it('with interleaved items, keeps first-seen group order and item order', () => {
    const items = ROWS;

    const groups = groupItems(items, groupOf);

    expect(groups.map((group) => [group.id, group.items.map((row) => row.id)])).toEqual([
      ['1', ['r1', 'r3']],
      ['2', ['r2']],
    ]);
  });

  it('with no items, returns no groups', () => {
    const items: Row[] = [];

    const groups = groupItems(items, groupOf);

    expect(groups).toEqual([]);
  });
});

describe('FoldingGroups', () => {
  it('with no defaultOpenIds, opens every group', () => {
    render(<FoldingGroups groupOf={groupOf} items={ROWS} renderRow={renderRow} rowKey={rowKey} />);

    const states = [expanded('1'), expanded('2')];

    expect(states).toEqual(['true', 'true']);
  });

  it('with defaultOpenIds, opens only those groups', () => {
    render(<FoldingGroups defaultOpenIds={['2']} groupOf={groupOf} items={ROWS} renderRow={renderRow} rowKey={rowKey} />);

    const states = [expanded('1'), expanded('2')];

    expect(states).toEqual(['false', 'true']);
  });

  it('when a group header is pressed, folds it and reports the remaining open ids', () => {
    const onOpenChange = jest.fn();
    render(
      <FoldingGroups groupOf={groupOf} items={ROWS} renderRow={renderRow} rowKey={rowKey} onOpenChange={onOpenChange} />,
    );

    fireEvent.click(screen.getByTestId('folding-groups-group-2'));

    expect(onOpenChange).toHaveBeenCalledWith(['1']);
    expect(expanded('2')).toBe('false');
  });

  it('with a count label, names the header with the count and title', () => {
    const labels = { count: (count: number, title: string): string => `${title}, ${String(count)} rows` };
    render(<FoldingGroups groupOf={groupOf} items={ROWS} labels={labels} renderRow={renderRow} rowKey={rowKey} />);

    const label = screen.getByTestId('folding-groups-group-1').getAttribute('aria-label');

    expect(label).toBe('Group 1, 2 rows');
  });

  it('with no items, renders the empty slot instead of the list', () => {
    render(
      <FoldingGroups empty={<span>none</span>} groupOf={groupOf} items={[]} renderRow={renderRow} rowKey={rowKey} />,
    );

    const list = screen.queryByTestId('folding-groups-list');

    expect(list).toBeNull();
    expect(screen.getByText('none')).toBeTruthy();
  });

  it('with figures, renders them in the figures slot', () => {
    render(
      <FoldingGroups
        figures={<span>figure</span>}
        groupOf={groupOf}
        items={ROWS}
        renderRow={renderRow}
        rowKey={rowKey}
      />,
    );

    const figures = screen.getByTestId('folding-groups-figures');

    expect(figures.textContent).toBe('figure');
  });
});
