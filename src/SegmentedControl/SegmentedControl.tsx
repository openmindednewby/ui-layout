/**
 * SegmentedControl — a single rounded pill *track* holding N mutually-exclusive segments
 * (the iOS-style segmented / tab toggle). The selected segment lifts onto a raised surface
 * with a subtle shadow; the rest stay transparent. Promoted from the v1 AML console's
 * `.lf-mode` mode switch so erevna/katalogos/kefi can share ONE toggle instead of
 * hand-rolling two primary/ghost buttons.
 *
 * Contract discipline (same as the rest of `@dloizides/ui-layout`): NO FM/router/store/icon
 * imports. Labels are pre-localized strings; every colour is read from the
 * `@dloizides/ui-feedback` UiProvider theme, so it re-skins on tenant swap. Renders as a
 * `tablist` of `tab`s (`accessibilityRole` + `accessibilityState.selected`, which
 * react-native-web forwards to `role`/`aria-selected` on the DOM).
 */
import React from 'react';

import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useA11y } from '@dloizides/a11y';
import { useUi } from '@dloizides/ui-feedback';

import { MIN_TARGET_PX } from '../constants';
import { segmentLook, segmentShape, trackShape } from './segmentLook';
import { SegmentedVariant } from './SegmentedVariant';

const TRACK_PADDING = 3;
const TRACK_RADIUS = 999;
const SEGMENT_RADIUS = 999;
const SEGMENT_PAD_H = 15;
const SEGMENT_PAD_V = 7;
const SEGMENT_FONT = 14;
const SEGMENT_WEIGHT = '600';
const BORDER_WIDTH = 1;

/**
 * Shadow under the SELECTED segment — matches v1 `.lf-mode__btn[aria-selected] box-shadow`.
 * Expressed as `boxShadow`: the `shadow*` family is deprecated in React Native and logged a
 * deprecation warning on every import of this module.
 */
const SEGMENT_BOX_SHADOW = '0px 1px 3px rgba(20, 30, 50, 0.1)';
/** Android draws `elevation`, not `boxShadow`. */
const SHADOW_ELEVATION = 2;
const HINT_ID_FALLBACK = 'segmented-control';

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: TRACK_PADDING + 1,
    padding: TRACK_PADDING,
    borderRadius: TRACK_RADIUS,
    borderWidth: BORDER_WIDTH,
  },
  segment: {
    minHeight: MIN_TARGET_PX,
    justifyContent: 'center',
    paddingHorizontal: SEGMENT_PAD_H,
    paddingVertical: SEGMENT_PAD_V,
    borderRadius: SEGMENT_RADIUS,
  },
  segmentSelected: {
    boxShadow: SEGMENT_BOX_SHADOW,
    elevation: SHADOW_ELEVATION,
  },
  label: {
    fontSize: SEGMENT_FONT,
    fontWeight: SEGMENT_WEIGHT,
    textAlign: 'center',
  },
});

/**
 * `aria-selected` marks the active tab for assistive tech. react-native's prop types omit
 * `aria-selected`, but react-native-web forwards `aria-*` to the DOM — so we attach it (no
 * `any`) rather than rely on `accessibilityState` (which this RNW build does not map to it).
 */
function ariaSelectedProps(selected: boolean): PressableProps & { 'aria-selected': boolean } {
  return { 'aria-selected': selected };
}

/** One selectable segment. `value` is what `onChange` emits when it's pressed. */
export interface SegmentedOption<V extends string = string> {
  label: string;
  value: V;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export interface SegmentedControlProps<V extends string = string> {
  /** The segments, left → right. */
  options: ReadonlyArray<SegmentedOption<V>>;
  /** The currently-selected value. */
  value: V;
  /** Fired with a segment's `value` when it is pressed. */
  onChange: (value: V) => void;
  /** Accessible name for the whole group (the `tablist`). */
  accessibilityLabel: string;
  /** Optional hint for the whole group. */
  accessibilityHint?: string;
  /** Optional style override merged LAST onto the track. */
  style?: StyleProp<ViewStyle>;
  /** Fill the parent width, every segment an equal share. */
  stretch?: boolean;
  /** Raised (default) lifts the selected segment; Filled paints it with `selectedColor`. */
  variant?: SegmentedVariant;
  /** Fill of the selected segment in the Filled variant (default: theme text colour). */
  selectedColor?: string;
  testID?: string;
}

/**
 * A segmented toggle. Generic over the value union so callers get a typed `onChange`
 * (e.g. `SegmentedControl<'peps' | 'leaders'>`).
 */
export function SegmentedControl<V extends string = string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  accessibilityHint,
  style,
  stretch = false,
  variant = SegmentedVariant.Raised,
  selectedColor,
  testID,
}: SegmentedControlProps<V>): React.ReactElement {
  const { theme } = useUi();
  const { colors } = theme;
  const { a11yProps, hintNode } = useA11y({ label: accessibilityLabel, hint: accessibilityHint, testID: testID ?? HINT_ID_FALLBACK });
  const describedBy = accessibilityHint === undefined ? {} : { 'aria-describedby': (a11yProps as unknown as Record<string, unknown>)['aria-describedby'] };

  return (
    <View
      accessibilityRole="tablist"
      aria-label={accessibilityLabel}
      {...describedBy}
      style={[styles.track, { backgroundColor: colors.background, borderColor: colors.border }, ...trackShape(variant, stretch), style]}
      testID={testID}
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        const look = segmentLook(variant, selected, colors, selectedColor);
        return (
          <Pressable
            key={opt.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={opt.accessibilityLabel ?? opt.label}
            accessibilityHint={opt.accessibilityHint}
            onPress={() => onChange(opt.value)}
            style={[
              styles.segment,
              selected && variant === SegmentedVariant.Raised ? styles.segmentSelected : null,
              ...segmentShape(variant, stretch),
              { backgroundColor: look.fill },
            ]}
            testID={opt.testID}
            {...ariaSelectedProps(selected)}
          >
            <Text style={[styles.label, { color: look.ink }]}>{opt.label}</Text>
          </Pressable>
        );
      })}
      {accessibilityHint === undefined ? null : hintNode}
    </View>
  );
}

export default SegmentedControl;
