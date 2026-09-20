/**
 * The wide-web viewport rule, in one place.
 *
 * `ModalDropdown` and `Tabs` each computed `platformOS === 'web' && width >= n`
 * inline. The predicate is the same rule in both: on ANY native platform the
 * surface is a phone or tablet, never a desktop, so the wide form is refused at
 * every width; on web it turns on at the breakpoint.
 */
import { LAYOUT_COLLAPSE_BREAKPOINT } from './constants';

/** The web platform key that `Platform.OS` reports under react-native-web. */
export const WEB_PLATFORM = 'web';

/**
 * `true` only on a web viewport at/above `breakpoint`. Native always returns
 * `false`, whatever the width.
 */
export function isWideWebViewport(
  width: number,
  platformOS: string,
  breakpoint: number = LAYOUT_COLLAPSE_BREAKPOINT,
): boolean {
  return platformOS === WEB_PLATFORM && width >= breakpoint;
}
