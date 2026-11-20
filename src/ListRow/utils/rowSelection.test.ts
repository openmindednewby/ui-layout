import { RowSelectedStyle } from '../RowSelectedStyle';

import { rowSelection } from './rowSelection';

describe('rowSelection', () => {
  it('on a phone with the row tapped, marks it with an outline', () => {
    const isDesktop = false;

    const result = rowSelection(isDesktop, 'r1', { selectedKey: 'r1', shownKey: 'r1' });

    expect(result).toEqual({ selected: true, style: RowSelectedStyle.Outline });
  });

  it('on a phone with nothing tapped, leaves the shown first row unmarked', () => {
    const isDesktop = false;

    const result = rowSelection(isDesktop, 'r1', { selectedKey: null, shownKey: 'r1' });

    expect(result.selected).toBe(false);
  });

  it('on a desktop with nothing tapped, marks the row whose detail is shown with an accent bar', () => {
    const isDesktop = true;

    const result = rowSelection(isDesktop, 'r1', { selectedKey: null, shownKey: 'r1' });

    expect(result).toEqual({ selected: true, style: RowSelectedStyle.AccentBar });
  });

  it('on a desktop for a row other than the shown one, leaves it unmarked', () => {
    const isDesktop = true;

    const result = rowSelection(isDesktop, 'r2', { selectedKey: 'r1', shownKey: 'r1' });

    expect(result.selected).toBe(false);
  });
});
