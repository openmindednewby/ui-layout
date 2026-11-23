import type { ViewStyle } from 'react-native';

export const BAR_PADDING = 12;

/** Bottom-edge style of the narrow bar: sticky above the safe area on web, padded by the inset on native. */
export function stickyEdgeStyle(os: string, bottomInset: number): ViewStyle {
  const padding = BAR_PADDING + bottomInset;
  if (os !== 'web') return { paddingBottom: padding };
  return { position: 'sticky', bottom: 0, zIndex: 1, paddingBottom: `calc(${String(padding)}px + env(safe-area-inset-bottom))` } as unknown as ViewStyle;
}
