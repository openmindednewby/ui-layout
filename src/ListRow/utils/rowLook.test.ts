import { RowSelectedStyle } from '../RowSelectedStyle';

import { resolveRowLook, type RowPalette } from './rowLook';

const PALETTE: RowPalette = {
  accent: 'navy',
  accentTint: 'mist',
  background: 'white',
  surface: 'grey',
  border: 'line',
  text: 'ink',
  hover: 'haze',
  pressed: 'fog',
  focus: 'blue',
};

const REST = { selected: false, hovered: false, pressed: false, focused: false };

describe('resolveRowLook', () => {
  it('with the default style and a selected row, fills the row with the surface colour', () => {
    const look = resolveRowLook(RowSelectedStyle.Surface, { ...REST, selected: true }, PALETTE);

    expect(look.container.backgroundColor).toBe('grey');
  });

  it('with accent-bar and a selected row, draws a 4px accent bar on a tint and accents the title', () => {
    const look = resolveRowLook(RowSelectedStyle.AccentBar, { ...REST, selected: true }, PALETTE);

    expect([look.container.borderLeftColor, look.container.borderLeftWidth, look.container.backgroundColor, look.titleColor]).toEqual(['navy', 4, 'mist', 'navy']);
  });

  it('with accent-bar and a row at rest, keeps the bar width so content never shifts', () => {
    const look = resolveRowLook(RowSelectedStyle.AccentBar, REST, PALETTE);

    expect([look.container.borderLeftColor, look.container.borderLeftWidth]).toEqual(['transparent', 4]);
  });

  it('with filled and a selected row, fills with the accent and inverts the text', () => {
    const look = resolveRowLook(RowSelectedStyle.Filled, { ...REST, selected: true }, PALETTE);

    expect([look.container.backgroundColor, look.textColor, look.inverse]).toEqual(['navy', 'white', true]);
  });

  it('with raised and a selected row, lifts the row into a bordered card', () => {
    const look = resolveRowLook(RowSelectedStyle.Raised, { ...REST, selected: true }, PALETTE);

    expect([look.container.borderColor, look.container.borderRadius, look.container.boxShadow !== undefined]).toEqual(['navy', 8, true]);
  });

  it('with outline and a selected row, draws a 2px inset accent line and keeps the fill white', () => {
    const look = resolveRowLook(RowSelectedStyle.Outline, { ...REST, selected: true }, PALETTE);

    expect([look.container.boxShadow, look.container.backgroundColor]).toEqual(['inset 0px 0px 0px 2px navy', 'white']);
  });

  it('with check, shows the check mark on every row and fills it only when selected', () => {
    const rest = resolveRowLook(RowSelectedStyle.Check, REST, PALETTE);
    const selected = resolveRowLook(RowSelectedStyle.Check, { ...REST, selected: true }, PALETTE);

    expect([rest.showCheck, rest.checkFilled, selected.showCheck, selected.checkFilled]).toEqual([true, false, true, true]);
  });

  it('with a non-check style, hides the check mark', () => {
    const look = resolveRowLook(RowSelectedStyle.Outline, { ...REST, selected: true }, PALETTE);

    expect(look.showCheck).toBe(false);
  });

  it('with a hovered unselected row, uses the hover colour', () => {
    const look = resolveRowLook(RowSelectedStyle.AccentBar, { ...REST, hovered: true }, PALETTE);

    expect(look.container.backgroundColor).toBe('haze');
  });

  it('with a pressed row, pressed wins over hover', () => {
    const look = resolveRowLook(RowSelectedStyle.Outline, { ...REST, hovered: true, pressed: true }, PALETTE);

    expect(look.container.backgroundColor).toBe('fog');
  });

  it('with a focused row, draws a two-ring focus indicator', () => {
    const look = resolveRowLook(RowSelectedStyle.Surface, { ...REST, focused: true }, PALETTE);

    expect(look.container.boxShadow).toBe('inset 0px 0px 0px 2px white, inset 0px 0px 0px 4px blue');
  });

  it('with a focused selected outline row, keeps both the focus ring and the outline', () => {
    const look = resolveRowLook(RowSelectedStyle.Outline, { ...REST, selected: true, focused: true }, PALETTE);

    expect(look.container.boxShadow).toBe('inset 0px 0px 0px 2px white, inset 0px 0px 0px 4px blue, inset 0px 0px 0px 2px navy');
  });
  it('with accent-bar, a selected row and no keyboard focus, draws no outline', () => {
    const look = resolveRowLook(RowSelectedStyle.AccentBar, { ...REST, selected: true }, PALETTE);

    expect([look.container.boxShadow, look.container.borderWidth, look.container.borderTopWidth]).toEqual([undefined, undefined, undefined]);
  });
});
