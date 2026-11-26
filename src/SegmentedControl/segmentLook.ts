import { StyleSheet, type TextStyle, type ViewStyle } from 'react-native';

import { SegmentedVariant } from './SegmentedVariant';

const FILLED_RADIUS = 10;
const FILLED_PAD_V = 12;
const BOXED_RADIUS = 10;
const BOXED_PAD = 3;
const BOXED_GAP = 2;
const BOXED_SEGMENT_RADIUS = 7;
const BOXED_PAD_V = 6;
const BOXED_PAD_H = 12;
const BOXED_FONT = 13;
const TRANSPARENT = 'transparent';

const styles = StyleSheet.create({
  filledTrack: { borderRadius: FILLED_RADIUS, padding: 0, gap: 0, overflow: 'hidden' },
  filledSegment: { borderRadius: 0, paddingVertical: FILLED_PAD_V },
  boxedTrack: { borderRadius: BOXED_RADIUS, padding: BOXED_PAD, gap: BOXED_GAP },
  boxedSegment: { borderRadius: BOXED_SEGMENT_RADIUS, paddingVertical: BOXED_PAD_V, paddingHorizontal: BOXED_PAD_H },
  boxedLabel: { fontSize: BOXED_FONT },
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

/** Fill and label colour of one segment: Raised lifts the selected one onto the surface, Filled paints it with the ink colour, Boxed tints it with `selectedColor`. */
export function segmentLook(variant: SegmentedVariant, selected: boolean, colors: SegmentColors, selectedColor?: string): SegmentLook {
  if (!selected) return { fill: TRANSPARENT, ink: colors.textSecondary };
  if (variant === SegmentedVariant.Filled) return { fill: selectedColor ?? colors.text, ink: colors.surface };
  if (variant === SegmentedVariant.Boxed) return { fill: selectedColor ?? colors.surface, ink: colors.text };
  return { fill: colors.surface, ink: colors.text };
}

/** Extra track style for the variant and stretch options. */
export function trackShape(variant: SegmentedVariant, stretch: boolean): ViewStyle[] {
  const shape: ViewStyle[] = [];
  if (variant === SegmentedVariant.Filled) shape.push(styles.filledTrack);
  if (variant === SegmentedVariant.Boxed) shape.push(styles.boxedTrack);
  if (stretch) shape.push(styles.stretchTrack);
  return shape;
}

/** Extra segment style for the variant and stretch options. */
export function segmentShape(variant: SegmentedVariant, stretch: boolean): ViewStyle[] {
  const shape: ViewStyle[] = [];
  if (variant === SegmentedVariant.Filled) shape.push(styles.filledSegment);
  if (variant === SegmentedVariant.Boxed) shape.push(styles.boxedSegment);
  if (stretch) shape.push(styles.stretchSegment);
  return shape;
}

/** Extra label style for the variant: Boxed uses the smaller frame label. */
export function labelShape(variant: SegmentedVariant): TextStyle[] {
  return variant === SegmentedVariant.Boxed ? [styles.boxedLabel] : [];
}
