/**
 * Responsive resolution of the effective {@link DropdownVariant}.
 *
 * `resolveDropdownVariant` is a pure function (easy to unit-test with a mocked
 * width); `useResolvedDropdownVariant` is the thin hook that feeds it the live
 * viewport width + platform.
 */
import { Platform, useWindowDimensions } from 'react-native';

import { LAYOUT_COLLAPSE_BREAKPOINT } from '../constants';
import { isWideWebViewport } from '../responsive';

import { DropdownVariant } from './DropdownVariant';

/**
 * At or above this viewport width (web only) the dropdown defaults to the inline
 * anchored menu; below it — or on any native platform — it defaults to the modal.
 *
 * Kept as an alias of the kit-wide {@link LAYOUT_COLLAPSE_BREAKPOINT} so existing
 * importers keep compiling; new code should import the shared name.
 */
export const MENU_BREAKPOINT = LAYOUT_COLLAPSE_BREAKPOINT;

/**
 * Pure resolver. An explicit `variant` always wins; otherwise the inline
 * {@link DropdownVariant.Menu} is chosen on wide web viewports and
 * {@link DropdownVariant.Modal} on narrow web or any native platform.
 */
export function resolveDropdownVariant(
  explicit: DropdownVariant | undefined,
  width: number,
  platformOS: string,
): DropdownVariant {
  if (explicit !== undefined) return explicit;

  return isWideWebViewport(width, platformOS, MENU_BREAKPOINT)
    ? DropdownVariant.Menu
    : DropdownVariant.Modal;
}

/** Hook wrapper that reads the live viewport width + platform and resolves the variant. */
export function useResolvedDropdownVariant(
  explicit: DropdownVariant | undefined,
): DropdownVariant {
  const { width } = useWindowDimensions();
  return resolveDropdownVariant(explicit, width, Platform.OS);
}
