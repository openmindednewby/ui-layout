import { DropdownVariant } from './DropdownVariant';
import { MENU_BREAKPOINT, resolveDropdownVariant } from './resolveDropdownVariant';

const NARROW_WIDTH = MENU_BREAKPOINT - 1;
const WIDE_WIDTH = MENU_BREAKPOINT + 200;

describe('resolveDropdownVariant', () => {
  it('picks the inline menu on wide web viewports (responsive default)', () => {
    expect(resolveDropdownVariant(undefined, WIDE_WIDTH, 'web')).toBe(DropdownVariant.Menu);
  });

  it('picks the modal on narrow web viewports (responsive default)', () => {
    expect(resolveDropdownVariant(undefined, NARROW_WIDTH, 'web')).toBe(DropdownVariant.Modal);
  });

  it('treats exactly the breakpoint width as wide (>=)', () => {
    expect(resolveDropdownVariant(undefined, MENU_BREAKPOINT, 'web')).toBe(DropdownVariant.Menu);
  });

  it('always picks the modal on native platforms regardless of width', () => {
    expect(resolveDropdownVariant(undefined, WIDE_WIDTH, 'ios')).toBe(DropdownVariant.Modal);
    expect(resolveDropdownVariant(undefined, WIDE_WIDTH, 'android')).toBe(DropdownVariant.Modal);
  });

  it('lets an explicit variant override the responsive choice', () => {
    // Force modal even on a wide web viewport...
    expect(resolveDropdownVariant(DropdownVariant.Modal, WIDE_WIDTH, 'web')).toBe(DropdownVariant.Modal);
    // ...and force the menu even on a narrow / native context.
    expect(resolveDropdownVariant(DropdownVariant.Menu, NARROW_WIDTH, 'ios')).toBe(DropdownVariant.Menu);
  });
});
