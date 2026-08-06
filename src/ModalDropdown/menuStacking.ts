/**
 * menuStacking — the stacking/positioning geometry for the inline dropdown menu.
 *
 * WHY THIS EXISTS (the bug it fixes): react-native-web renders **every** `View` with
 * `position: relative; z-index: 0`, so every View is its OWN stacking context. An inline
 * popover rendered `position:absolute` under its anchor therefore has its `zIndex` trapped
 * inside the anchor's (and the app's field wrapper's) `z-index: 0` context — it can never
 * rise above later-painting sibling Views (adjacent filter fields, the results table, cards).
 * That is why the open menu painted UNDERNEATH following content on wide/desktop web.
 *
 * THE FIX: on web the menu is rendered in a PORTAL to `document.body` with `position: fixed`
 * at the trigger's measured viewport rect and a high `zIndex`. A portal escapes every ancestor
 * stacking context AND every ancestor `overflow: hidden`, so the menu always paints on top and
 * is never clipped — the same "menu above the table" outcome the `@dloizides/ui-tables`
 * `SizeDropdown` achieves. On native the menu stays in-tree (`position:absolute` + `elevation`),
 * and the anchor gets a raised `zIndex` while open as defence-in-depth for direct siblings.
 *
 * These builders are pure so the stacking behaviour is unit-testable without RN-web's
 * class-name-based styling (which does not surface as inline DOM styles).
 */
import type { ViewStyle } from 'react-native';

/** z-index for the open menu popover — high enough to clear app chrome (tables, cards, fields). */
export const MENU_Z_INDEX = 1000;
/** z-index lifted onto the anchor WRAPPER while the menu is open (native/defence-in-depth). */
export const ANCHOR_OPEN_Z_INDEX = 1000;
/** Native drop shadow depth so the popover reads as floating above the page. */
export const MENU_ELEVATION = 8;
/** Gap between the trigger's bottom edge and the popover's top edge. */
export const MENU_TOP_GAP = 4;
/** The popover scrolls past this height rather than growing unbounded. */
export const MENU_MAX_HEIGHT = 300;

const BORDER_RADIUS = 8;
const BORDER_WIDTH = 1;
const MENU_PADDING = 4;
/** Soft drop shadow so the popover reads as floating above the page (web). */
export const MENU_BOX_SHADOW = '0px 2px 8px rgba(0, 0, 0, 0.15)';
/** Keep the popover at least this far from the viewport's left/right edge when it must be clamped. */
export const MENU_VIEWPORT_MARGIN = 8;

/** The trigger's viewport-space rect (from `getBoundingClientRect`) needed to place a fixed menu. */
export interface AnchorRect {
  top: number;
  left: number;
  width: number;
  bottom: number;
}

/**
 * Web portal popover style: `position: fixed` at the trigger rect with a high `zIndex`. Because
 * it is portalled to `document.body`, `fixed` positions it against the viewport, so it tracks the
 * trigger via the measured rect (recomputed on scroll/resize) and is clipped by nothing.
 *
 * The popover matches the trigger's width — right for a full-width field, but a COMPACT anchor (a
 * locale pill, an avatar chip, an icon button) would then get a menu too narrow to read its own
 * option labels. `minWidth` sets a floor for exactly that case; it never shrinks a menu.
 *
 * A floored menu can be WIDER than its (compact) trigger, so anchoring its left edge to the
 * trigger would push it off the right of the viewport — the widened "More ▾" overflow menu, whose
 * trigger sits near the right of the bar, is exactly that case. When `viewportWidth` is given the
 * left is clamped so the menu's right edge clears the margin (sliding it left, right-aligning it to
 * the trigger in the limit) without ever crossing the left margin. `viewportWidth = 0` (unknown, or
 * the pure/native path) keeps the original trigger-anchored behaviour untouched.
 */
export function buildPortalPopoverStyle(rect: AnchorRect, minWidth = 0, viewportWidth = 0): ViewStyle {
  const width = Math.max(rect.width, minWidth);
  let left = rect.left;
  if (viewportWidth > 0) {
    const maxLeft = viewportWidth - width - MENU_VIEWPORT_MARGIN;
    left = Math.max(MENU_VIEWPORT_MARGIN, Math.min(rect.left, maxLeft));
  }
  return {
    // RN's ViewStyle union omits 'fixed', but react-native-web honours it at runtime.
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- web-only position value
    position: 'fixed' as unknown as ViewStyle['position'],
    top: rect.bottom + MENU_TOP_GAP,
    left,
    width,
    zIndex: MENU_Z_INDEX,
    borderWidth: BORDER_WIDTH,
    borderRadius: BORDER_RADIUS,
    padding: MENU_PADDING,
    maxHeight: MENU_MAX_HEIGHT,
    boxShadow: MENU_BOX_SHADOW,
    elevation: MENU_ELEVATION,
  };
}

/**
 * Anchor-wrapper stacking style: while the inline menu is open the wrapper is lifted to a raised
 * `zIndex` so it wins over immediate sibling views (defence-in-depth on top of the web portal;
 * the primary stacking behaviour on native). Returns `null` when closed so nothing changes.
 */
export function buildAnchorStackStyle(isMenuOpen: boolean): ViewStyle | null {
  return isMenuOpen ? { zIndex: ANCHOR_OPEN_Z_INDEX, elevation: MENU_ELEVATION } : null;
}

/**
 * The window the trigger is actually visible through: the viewport intersected with every
 * ancestor that clips (a scroll container, an `overflow: hidden` panel).
 */
export interface ClipBounds {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

/**
 * Below this many pixels visible in either axis the trigger is, to a user, gone — so the menu
 * must not keep hanging off it. A few pixels rather than zero, because a trigger pinned at the
 * very edge of a scroll container that has bottomed out never reaches zero (see below).
 */
export const MIN_VISIBLE_PX = 8;

/**
 * True when the trigger is no longer meaningfully visible, so an anchored menu would be pointing
 * at nothing and must close. Repositioning cannot solve this case — the menu simply follows its
 * trigger out of sight and hangs over unrelated content.
 *
 * TWO THINGS THIS DELIBERATELY IS NOT (both were shipped as bugs in 1.10.0):
 *
 *  1. **Not "outside the viewport".** RN-web apps scroll an inner `ScrollView`, not the document.
 *     A trigger scrolled out of that inner scroller is invisible to the user while its rect is
 *     still comfortably inside the viewport — a viewport-only test can never fire. Visibility is
 *     therefore measured against `clip`, the intersection of the viewport with every clipping
 *     ancestor. (The RECT stays viewport-relative, which is why repositioning worked throughout.)
 *  2. **Not "entirely hidden".** When a scroll container reaches the end of its range the trigger
 *     stops with a sliver still inside the clip window — the real-world case was 4px — so "fully
 *     out" is unreachable and the menu never closed. A small visible-pixel floor fixes that.
 */
export function isAnchorHidden(rect: AnchorRect, clip: ClipBounds, minVisiblePx: number): boolean {
  // A zero-AREA rect means "not laid out yet" — NOT "off-screen". Note this asks only about the
  // element's OWN box, never about where it sits: a trigger scrolled far out of view still has
  // its full width and height, so this can never swallow a genuine hidden case.
  const hasLayout = rect.width > 0 && rect.bottom > rect.top;
  const hasClip = clip.bottom > clip.top && clip.right > clip.left;
  if (!hasLayout || !hasClip) return false;

  const visibleHeight = Math.min(rect.bottom, clip.bottom) - Math.max(rect.top, clip.top);
  const visibleWidth = Math.min(rect.left + rect.width, clip.right) - Math.max(rect.left, clip.left);
  return visibleHeight < minVisiblePx || visibleWidth < minVisiblePx;
}
