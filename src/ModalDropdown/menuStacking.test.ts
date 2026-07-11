import {
  ANCHOR_OPEN_Z_INDEX,
  MENU_TOP_GAP,
  MENU_Z_INDEX,
  buildAnchorStackStyle,
  buildPortalPopoverStyle,
} from './menuStacking';

describe('buildPortalPopoverStyle', () => {
  const rect = { top: 100, left: 40, width: 220, bottom: 130 };

  it('renders the open menu fixed with a high zIndex so it escapes ancestor stacking contexts', () => {
    const style = buildPortalPopoverStyle(rect);
    expect(style.position).toBe('fixed');
    expect(style.zIndex).toBe(MENU_Z_INDEX);
    expect(MENU_Z_INDEX).toBeGreaterThanOrEqual(1000);
  });

  it('positions the popover at the trigger rect (below it, trigger width)', () => {
    const style = buildPortalPopoverStyle(rect);
    expect(style.top).toBe(rect.bottom + MENU_TOP_GAP);
    expect(style.left).toBe(rect.left);
    expect(style.width).toBe(rect.width);
  });

  it('carries a bounded max height + shadow so a long menu scrolls and reads as floating', () => {
    const style = buildPortalPopoverStyle(rect);
    expect(typeof style.maxHeight).toBe('number');
    expect(style.boxShadow).toBeTruthy();
    expect(style.elevation).toBeGreaterThan(0);
  });
});

describe('buildAnchorStackStyle', () => {
  it('lifts the anchor wrapper to a raised zIndex while the menu is open', () => {
    const style = buildAnchorStackStyle(true);
    expect(style).not.toBeNull();
    expect(style?.zIndex).toBe(ANCHOR_OPEN_Z_INDEX);
    expect(style?.elevation).toBeGreaterThan(0);
  });

  it('returns null while closed so the anchor keeps its default stacking (no regression)', () => {
    expect(buildAnchorStackStyle(false)).toBeNull();
  });
});
