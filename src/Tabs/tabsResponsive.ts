/**
 * Responsive collapse decision for {@link Tabs}.
 *
 * The tab row is a full desktop affordance; on a phone a horizontally-scrolling
 * chip strip is hard to use ("not a real menu, not mobile friendly"). BELOW a
 * breakpoint the strip collapses to a genuine menu (a button showing the active
 * tab that opens a vertical list). The threshold reuses the SAME viewport rule
 * the kit already uses to decide `ModalDropdown`'s menu-vs-modal split, so the
 * whole layout kit changes shape at one consistent breakpoint.
 *
 * `shouldCollapseTabs` is a pure function (trivially unit-testable with a mocked
 * width); `useTabsCollapsed` is the thin hook that feeds it the live viewport
 * width + platform.
 */
import { Platform, useWindowDimensions } from 'react-native';

import { MENU_BREAKPOINT } from '../ModalDropdown/resolveDropdownVariant';

/**
 * Default collapse threshold — the shared kit breakpoint. At or above this
 * viewport width (web only) `Tabs` stays a row; below it — or on any native
 * platform — it collapses to the menu.
 */
export const TABS_COLLAPSE_BREAKPOINT = MENU_BREAKPOINT;

/** The web platform key that {@link Platform.OS} reports under react-native-web. */
const WEB_PLATFORM = 'web';

/**
 * Pure resolver: collapse to the menu unless we are on a WIDE WEB viewport. On
 * native (any width) the tabs always collapse — a native app is a phone/tablet
 * surface, never a desktop tab bar.
 */
export function shouldCollapseTabs(
  width: number,
  platformOS: string,
  breakpoint: number,
): boolean {
  const isWideWeb = platformOS === WEB_PLATFORM && width >= breakpoint;
  return !isWideWeb;
}

/** Hook wrapper that reads the live viewport width + platform and resolves collapse. */
export function useTabsCollapsed(breakpoint: number): boolean {
  const { width } = useWindowDimensions();
  return shouldCollapseTabs(width, Platform.OS, breakpoint);
}
