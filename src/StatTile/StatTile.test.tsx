import { render, screen } from '@testing-library/react';

import { StatTile } from './StatTile';

describe('StatTile', () => {
  it('with a value, sets the figure at 24px on a 32px line height in tabular digits', () => {
    render(<StatTile label="Balance" note="After costs" testID="tile" value="1,250.00" />);

    const figure = getComputedStyle(screen.getByTestId('tile-value'));

    expect({ line: figure.lineHeight, size: figure.fontSize, digits: figure.fontVariant }).toEqual({ line: '32px', size: '24px', digits: 'tabular-nums' });
  });

  it('with a note, renders label, figure and note in that order', () => {
    render(<StatTile label="Balance" note="After costs" testID="tile" value="42" />);

    const text = screen.getByTestId('tile').textContent;

    expect(text).toBe('Balance42After costs');
  });

  it('without a note, renders only the label and the figure', () => {
    render(<StatTile label="Open items" testID="tile" value="3" />);

    const lines = screen.getByTestId('tile').children.length;

    expect(lines).toBe(2);
  });

  it('in a row of tiles, grows from a 150px basis and may shrink to zero width', () => {
    render(<StatTile label="Open items" testID="tile" value="3" />);

    const tile = getComputedStyle(screen.getByTestId('tile'));

    expect({ grow: tile.flexGrow, basis: tile.flexBasis, min: tile.minWidth }).toEqual({ grow: '1', basis: '150px', min: '0px' });
  });
});
