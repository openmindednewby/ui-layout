import { StyleSheet, type ViewStyle } from 'react-native';

import { SegmentedVariant } from './SegmentedVariant';

const FILLED_RADIUS = 10;
const FILLED_PAD_V = 12;
const TRANSPARENT = 'transparent';

const styles = StyleSheet.create({
  filledTrack: { borderRadius: FILLED_RADIUS, padding: 0, gap: 0, overflow: 'hidden' },
  filledSegment: { borderRadius: 0, paddingVertical: FILLED_PAD_V },
  stretchTrack: { alignSelf: 'stretch' },
  stretchSegment: { flex: 1 },
});

export interface SegmentColors {
  text: string;
  textSecondary: string;
  surface: string;
}

export interface SegmentLook {
  fill: string;
  ink: string;
}

/** Fill and label colour of one segment: Raised lifts the selected one onto the surface, Filled paints it with the ink colour. */
export function segmentLook(variant: SegmentedVariant, selected: boolean, colors: SegmentColors, selectedColor?: string): SegmentLook {
  if (!selected) return { fill: TRANSPARENT, ink: colors.textSecondary };
  if (variant === SegmentedVariant.Filled) return { fill: selectedColor ?? colors.text, ink: colors.surface };
  return { fill: colors.surface, ink: colors.text };
}

/** Extra track style for the variant and stretch options. */
export function trackShape(variant: SegmentedVariant, stretch: boolean): ViewStyle[] {
  const shape: ViewStyle[] = [];
  if (variant === SegmentedVariant.Filled) shape.push(styles.filledTrack);
  if (stretch) shape.push(styles.stretchTrack);
  return shape;
}

/** Extra segment style for the variant and stretch options. */
export function segmentShape(variant: SegmentedVariant, stretch: boolean): ViewStyle[] {
  const shape: ViewStyle[] = [];
  if (variant === SegmentedVariant.Filled) shape.push(styles.filledSegment);
  if (stretch) shape.push(styles.stretchSegment);
  return shape;
}
