import {
  MENU_MAX_HEIGHT,
  MENU_SCROLL_MAX_HEIGHT,
  MENU_TOP_GAP,
  MENU_VIEWPORT_MARGIN,
  buildPortalPopoverStyle,
  menuScrollMaxHeight,
  resolveMenuPlacement,
} from './menuStacking';

describe('resolveMenuPlacement', () => {
  const VIEWPORT_HEIGHT = 800;
  const anchor = (top: number): { top: number; left: number; width: number; bottom: number } => ({
    top,
    left: 40,
    width: 220,
    bottom: top + 40,
  });

  it('with room below, opens below the trigger at the full height', () => {
    const rect = anchor(100);

    const placement = resolveMenuPlacement(rect, VIEWPORT_HEIGHT, MENU_MAX_HEIGHT);

    expect(placement).toEqual({ top: rect.bottom + MENU_TOP_GAP, maxHeight: MENU_MAX_HEIGHT });
  });

  it('with no room below and more above, anchors the menu bottom just above the trigger', () => {
    const rect = anchor(720);

    const placement = resolveMenuPlacement(rect, VIEWPORT_HEIGHT, MENU_MAX_HEIGHT);

    expect(placement).toEqual({ bottom: VIEWPORT_HEIGHT - rect.top + MENU_TOP_GAP, maxHeight: MENU_MAX_HEIGHT });
  });

  it('with a short menu that fits in the small room below, stays below', () => {
    const rect = anchor(600);

    const placement = resolveMenuPlacement(rect, VIEWPORT_HEIGHT, 120);

    expect(placement.top).toBe(rect.bottom + MENU_TOP_GAP);
  });

  it('with less room above than below, stays below and caps to the room below', () => {
    const rect = anchor(200);
    const viewportHeight = 500;

    const placement = resolveMenuPlacement(rect, viewportHeight, MENU_MAX_HEIGHT);

    expect(placement.top).toBe(rect.bottom + MENU_TOP_GAP);
    expect(placement.maxHeight).toBe(viewportHeight - rect.bottom - MENU_TOP_GAP - MENU_VIEWPORT_MARGIN);
  });

  it('with less than a full menu of room above, caps to the room above', () => {
    const rect = anchor(200);
    const viewportHeight = 260;

    const placement = resolveMenuPlacement(rect, viewportHeight, MENU_MAX_HEIGHT);

    expect(placement.bottom).toBe(viewportHeight - rect.top + MENU_TOP_GAP);
    expect(placement.maxHeight).toBe(rect.top - MENU_TOP_GAP - MENU_VIEWPORT_MARGIN);
  });

  it('with the trigger cut off by the viewport bottom, keeps the menu inside the viewport', () => {
    const rect = anchor(790);

    const placement = resolveMenuPlacement(rect, VIEWPORT_HEIGHT, MENU_MAX_HEIGHT);

    expect(placement.bottom).toBeGreaterThanOrEqual(MENU_VIEWPORT_MARGIN);
  });

  it('with the trigger cut off by the viewport top, starts the menu inside the viewport', () => {
    const rect = anchor(-60);

    const placement = resolveMenuPlacement(rect, VIEWPORT_HEIGHT, MENU_MAX_HEIGHT);

    expect(placement.top).toBe(MENU_VIEWPORT_MARGIN);
  });

  it('with an unknown viewport height, keeps the original below-the-trigger placement', () => {
    const rect = anchor(5000);

    const placement = resolveMenuPlacement(rect, 0, MENU_MAX_HEIGHT);

    expect(placement).toEqual({ top: rect.bottom + MENU_TOP_GAP, maxHeight: MENU_MAX_HEIGHT });
  });

  it('with a menu taller than the maximum, plans for the maximum height', () => {
    const rect = anchor(400);

    const placement = resolveMenuPlacement(rect, VIEWPORT_HEIGHT, MENU_MAX_HEIGHT * 2);

    expect(placement.top).toBe(rect.bottom + MENU_TOP_GAP);
  });
});

describe('buildPortalPopoverStyle with a placement', () => {
  const rect = { top: 720, left: 40, width: 220, bottom: 760 };

  it('with a placement above, sets bottom and the capped height and no top', () => {
    const placement = { bottom: 84, maxHeight: 200 };

    const style = buildPortalPopoverStyle(rect, 0, 1440, placement);

    expect(style.bottom).toBe(84);
    expect(style.maxHeight).toBe(200);
    expect(style.top).toBeUndefined();
  });

  it('with a placement above, keeps the horizontal clamp', () => {
    const placement = { bottom: 84, maxHeight: 200 };
    const nearRightEdge = { ...rect, left: 1360, width: 60 };

    const style = buildPortalPopoverStyle(nearRightEdge, 200, 1440, placement);

    expect(style.left).toBe(1440 - 200 - MENU_VIEWPORT_MARGIN);
  });
});

describe('menuScrollMaxHeight', () => {
  it('with a capped popover, keeps the list inside the frame border and padding', () => {
    const popoverMaxHeight = 200;

    const scrollMaxHeight = menuScrollMaxHeight(popoverMaxHeight);

    expect(scrollMaxHeight).toBe(popoverMaxHeight - (MENU_MAX_HEIGHT - MENU_SCROLL_MAX_HEIGHT));
  });

  it('with a popover smaller than its chrome, never goes negative', () => {
    const scrollMaxHeight = menuScrollMaxHeight(2);

    expect(scrollMaxHeight).toBe(0);
  });
});
