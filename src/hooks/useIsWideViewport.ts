import { Platform, useWindowDimensions } from 'react-native';

import { LAYOUT_COLLAPSE_BREAKPOINT } from '../constants';
import { isWideWebViewport } from '../responsive';

export function useIsWideViewport(breakpoint: number = LAYOUT_COLLAPSE_BREAKPOINT): boolean {
  const { width } = useWindowDimensions();
  return isWideWebViewport(width, Platform.OS, breakpoint);
}
