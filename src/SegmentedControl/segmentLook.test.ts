import { labelShape, segmentLook, segmentShape, trackShape } from './segmentLook';
import { SegmentedVariant } from './SegmentedVariant';

const COLORS = { text: 'ink', textSecondary: 'muted', surface: 'paper' };

describe('segmentLook', () => {
  it('with the Filled variant and a selected segment, fills with the given colour and inks with the surface', () => {
    const selectedColor = 'accent';

    const look = segmentLook(SegmentedVariant.Filled, true, COLORS, selectedColor);

    expect(look).toEqual({ fill: 'accent', ink: 'paper' });
  });

  it('with the Filled variant and no selected colour, fills with the theme text colour', () => {
    const selected = true;

    const look = segmentLook(SegmentedVariant.Filled, selected, COLORS);

    expect(look).toEqual({ fill: 'ink', ink: 'paper' });
  });

  it('with the Raised variant and a selected segment, keeps the surface fill and text ink', () => {
    const selected = true;

    const look = segmentLook(SegmentedVariant.Raised, selected, COLORS, 'accent');

    expect(look).toEqual({ fill: 'paper', ink: 'ink' });
  });

  it('with an unselected segment, stays transparent with the secondary ink', () => {
    const selected = false;

    const look = segmentLook(SegmentedVariant.Filled, selected, COLORS, 'accent');

    expect(look).toEqual({ fill: 'transparent', ink: 'muted' });
  });
});

describe('trackShape', () => {
  it('with Raised and no stretch, adds nothing', () => {
    const stretch = false;

    const shape = trackShape(SegmentedVariant.Raised, stretch);

    expect(shape).toEqual([]);
  });

  it('with Filled and stretch, squares the track and stretches it', () => {
    const stretch = true;

    const shape = trackShape(SegmentedVariant.Filled, stretch);

    expect(shape).toEqual([expect.objectContaining({ borderRadius: 10, padding: 0 }), { alignSelf: 'stretch' }]);
  });
});

describe('segmentShape', () => {
  it('with stretch, gives each segment an equal flex share', () => {
    const stretch = true;

    const shape = segmentShape(SegmentedVariant.Raised, stretch);

    expect(shape).toEqual([{ flex: 1 }]);
  });

  it('with the Boxed variant and a selected segment, tints with the given colour and keeps the text ink', () => {
    const selectedColor = 'tint';

    const look = segmentLook(SegmentedVariant.Boxed, true, COLORS, selectedColor);

    expect(look).toEqual({ fill: 'tint', ink: 'ink' });
  });

  it('with the Boxed variant, adds one track, segment and label shape', () => {
    const variant = SegmentedVariant.Boxed;

    const counts = { track: trackShape(variant, false).length, segment: segmentShape(variant, false).length, label: labelShape(variant).length };

    expect(counts).toEqual({ track: 1, segment: 1, label: 1 });
  });

  it('with the Raised variant, adds no label shape', () => {
    const variant = SegmentedVariant.Raised;

    const shapes = labelShape(variant);

    expect(shapes).toEqual([]);
  });
});
