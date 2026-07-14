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
 */
export function buildPortalPopoverStyle(rect: AnchorRect, minWidth = 0): ViewStyle {
  return {
    // RN's ViewStyle union omits 'fixed', but react-native-web honours it at runtime.
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- web-only position value
    position: 'fixed' as unknown as ViewStyle['position'],
    top: rect.bottom + MENU_TOP_GAP,
    left: rect.left,
    width: Math.max(rect.width, minWidth),
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
