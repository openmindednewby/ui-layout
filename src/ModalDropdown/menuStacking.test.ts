import {
  ANCHOR_OPEN_Z_INDEX,
  MENU_TOP_GAP,
  MENU_Z_INDEX,
  buildAnchorStackStyle,
  buildPortalPopoverStyle,
  MIN_VISIBLE_PX,
  isAnchorHidden,
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

describe('isAnchorHidden (1.10.1)', () => {
  const VIEWPORT = { top: 0, left: 0, bottom: 800, right: 1440 };
  const onScreen = { top: 200, left: 480, width: 300, bottom: 240 };

  it('is false while the trigger is fully visible (the menu stays open)', () => {
    expect(isAnchorHidden(onScreen, VIEWPORT, MIN_VISIBLE_PX)).toBe(false);
  });

  it('is true once the trigger has scrolled off the TOP of the clip window', () => {
    expect(isAnchorHidden({ ...onScreen, top: -140, bottom: -100 }, VIEWPORT, MIN_VISIBLE_PX)).toBe(true);
  });

  it('is true once the trigger has scrolled off the BOTTOM of the clip window', () => {
    expect(isAnchorHidden({ ...onScreen, top: 900, bottom: 940 }, VIEWPORT, MIN_VISIBLE_PX)).toBe(true);
  });

  it('is true for a horizontally scrolled-away trigger', () => {
    expect(isAnchorHidden({ ...onScreen, left: -298 }, VIEWPORT, MIN_VISIBLE_PX)).toBe(true);
  });

  // THE 1.10.0 MISS #1: an INNER scroll container. The rect is well inside the viewport, so a
  // viewport-only test sees a visible trigger — but the user cannot see it at all.
  it('is true when an inner scroll container has clipped the trigger away, INSIDE the viewport', () => {
    const innerScroller = { top: 300, left: 0, bottom: 700, right: 1440 };
    const aboveTheScroller = { top: 40, left: 480, width: 300, bottom: 80 };
    expect(isAnchorHidden(aboveTheScroller, VIEWPORT, MIN_VISIBLE_PX)).toBe(false);
    expect(isAnchorHidden(aboveTheScroller, innerScroller, MIN_VISIBLE_PX)).toBe(true);
  });

  // THE 1.10.0 MISS #2: "entirely out of view" is UNREACHABLE when a scroll container bottoms out.
  it('is true for a SLIVER: a few pixels left showing is, to a user, gone', () => {
    const sliver = { ...onScreen, top: -36, bottom: 4 };
    expect(sliver.bottom).toBeGreaterThan(0); // never "entirely" out of view
    expect(isAnchorHidden(sliver, VIEWPORT, MIN_VISIBLE_PX)).toBe(true);
  });

  it('is false while more than the minimum is still showing (no premature close)', () => {
    expect(isAnchorHidden({ ...onScreen, top: -20, bottom: 20 }, VIEWPORT, MIN_VISIBLE_PX)).toBe(false);
  });

  // REGRESSION: a zero-AREA rect means "not laid out yet", NOT "off-screen". Conflating the two
  // closed the menu the instant it opened (every element in jsdom, and any element measured before
  // first layout, reports zeros) — caught by the pre-existing ModalDropdown suite.
  it('does NOT report an unmeasured (zero-area) rect as hidden', () => {
    expect(isAnchorHidden({ top: 0, left: 0, width: 0, bottom: 0 }, VIEWPORT, MIN_VISIBLE_PX)).toBe(false);
  });

  // ...and the guard must not SWALLOW a real hidden case: an off-screen trigger keeps its own
  // width and height, so `hasLayout` stays true and the hidden verdict still lands.
  it('still reports a genuinely off-screen trigger as hidden (the zero-area guard is size-only)', () => {
    const offScreen = { top: -500, left: 480, width: 300, bottom: -460 };
    expect(offScreen.width).toBeGreaterThan(0);
    expect(offScreen.bottom).toBeGreaterThan(offScreen.top);
    expect(isAnchorHidden(offScreen, VIEWPORT, MIN_VISIBLE_PX)).toBe(true);
  });

  it('does NOT act on a clip window with no dimensions (no layout information available)', () => {
    expect(isAnchorHidden(onScreen, { top: 0, left: 0, bottom: 0, right: 0 }, MIN_VISIBLE_PX)).toBe(false);
  });
});
