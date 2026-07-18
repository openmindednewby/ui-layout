import {
  ANCHOR_OPEN_Z_INDEX,
  MENU_TOP_GAP,
  MENU_Z_INDEX,
  buildAnchorStackStyle,
  buildPortalPopoverStyle,
  isAnchorOutOfView,
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

describe('buildPortalPopoverStyle — compact-anchor width floor (1.9.0)', () => {
  const compact = { top: 10, left: 900, width: 52, bottom: 54 };

  it('floors the menu width for a COMPACT trigger (a 52px locale pill cannot show its labels)', () => {
    expect(buildPortalPopoverStyle(compact, 160).width).toBe(160);
  });

  it('never shrinks a menu: a trigger wider than the floor still wins', () => {
    expect(buildPortalPopoverStyle({ top: 0, left: 0, width: 220, bottom: 30 }, 160).width).toBe(220);
  });

  it('defaults to the trigger width when no floor is given (unchanged for existing callers)', () => {
    expect(buildPortalPopoverStyle(compact).width).toBe(compact.width);
  });
});

describe('isAnchorOutOfView (1.10.0)', () => {
  const VIEWPORT_H = 800;
  const VIEWPORT_W = 1440;
  const onScreen = { top: 200, left: 480, width: 300, bottom: 240 };

  it('is false while the trigger is on screen (the menu stays open)', () => {
    expect(isAnchorOutOfView(onScreen, VIEWPORT_H, VIEWPORT_W)).toBe(false);
  });

  it('is true once the trigger has scrolled off the TOP', () => {
    expect(isAnchorOutOfView({ ...onScreen, top: -140, bottom: -100 }, VIEWPORT_H, VIEWPORT_W)).toBe(true);
  });

  it('is true once the trigger has scrolled off the BOTTOM', () => {
    expect(isAnchorOutOfView({ ...onScreen, top: 900, bottom: 940 }, VIEWPORT_H, VIEWPORT_W)).toBe(true);
  });

  it('is true for a horizontally scrolled-away trigger', () => {
    expect(isAnchorOutOfView({ ...onScreen, left: -400 }, VIEWPORT_H, VIEWPORT_W)).toBe(true);
  });

  it('treats the boundary (bottom exactly at the top edge) as out of view', () => {
    expect(isAnchorOutOfView({ ...onScreen, top: -40, bottom: 0 }, VIEWPORT_H, VIEWPORT_W)).toBe(true);
  });

  // REGRESSION: a zero-area rect means "not laid out yet", NOT "off-screen". Conflating the two
  // closed the menu the instant it opened (every element in jsdom, and any element measured before
  // first layout, reports zeros) — caught by the pre-existing ModalDropdown suite.
  it('does NOT report an unmeasured (zero-area) rect as out of view', () => {
    expect(isAnchorOutOfView({ top: 0, left: 0, width: 0, bottom: 0 }, VIEWPORT_H, VIEWPORT_W)).toBe(false);
  });

  it('does NOT act on a viewport with no dimensions (no layout information available)', () => {
    expect(isAnchorOutOfView(onScreen, 0, 0)).toBe(false);
  });
});
