import { figureCell } from './FigureStrip';

describe('figureCell', () => {
  it('when wide with span 2, grows twice as much from a zero basis', () => {
    const span = 2;

    const style = figureCell(true, span);

    expect(style).toEqual({ flexBasis: 0, flexGrow: 2, minWidth: 0 });
  });

  it('when narrow with span 2, takes the full row', () => {
    const span = 2;

    const style = figureCell(false, span);

    expect(style).toMatchObject({ flexBasis: '100%' });
  });

  it('when narrow with span 1, takes half a row', () => {
    const wide = false;

    const style = figureCell(wide);

    expect(style).toMatchObject({ flexBasis: '45%', flexGrow: 1 });
  });
});
