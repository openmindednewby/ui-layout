import { Platform, type ViewStyle } from 'react-native';

import { TAB_INDICATOR_MS } from './useTabIndicator';

export const TAB_INDICATOR_EASE = 'cubic-bezier(0.33, 1, 0.68, 1)';

export type IndicatorTransition = ViewStyle & {
  transitionDuration?: string;
  transitionProperty?: string;
  transitionTimingFunction?: string;
};

/** The web CSS transition that slides the underline; none under reduced motion or off web. */
export function indicatorTransition(reduced: boolean, platform: string = Platform.OS): IndicatorTransition {
  if (platform !== 'web' || reduced) return {};
  return { transitionDuration: `${String(TAB_INDICATOR_MS)}ms`, transitionProperty: 'left, width', transitionTimingFunction: TAB_INDICATOR_EASE };
}
