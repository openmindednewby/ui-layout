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

import { useUi } from '@dloizides/ui-feedback';

const TRACK_PADDING = 3;
const TRACK_RADIUS = 999;
const SEGMENT_RADIUS = 999;
const SEGMENT_PAD_H = 15;
const SEGMENT_PAD_V = 7;
const SEGMENT_FONT = 14;
const SEGMENT_WEIGHT = '600';
const BORDER_WIDTH = 1;

/** Shadow under the SELECTED segment — matches v1 `.lf-mode__btn[aria-selected] box-shadow`. */
const SHADOW_COLOR = '#141e32';
const SHADOW_OPACITY = 0.1;
const SHADOW_RADIUS = 3;
const SHADOW_OFFSET = { width: 0, height: 1 } as const;
const SHADOW_ELEVATION = 2;
const TRANSPARENT = 'transparent';

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
    paddingHorizontal: SEGMENT_PAD_H,
    paddingVertical: SEGMENT_PAD_V,
    borderRadius: SEGMENT_RADIUS,
  },
  segmentSelected: {
    shadowColor: SHADOW_COLOR,
    shadowOpacity: SHADOW_OPACITY,
    shadowRadius: SHADOW_RADIUS,
    shadowOffset: SHADOW_OFFSET,
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
  /** Optional style override merged LAST onto the track. */
  style?: StyleProp<ViewStyle>;
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
  style,
  testID,
}: SegmentedControlProps<V>): React.ReactElement {
  const { theme } = useUi();
  const { colors } = theme;

  return (
    <View
      accessibilityRole="tablist"
      aria-label={accessibilityLabel}
      style={[styles.track, { backgroundColor: colors.background, borderColor: colors.border }, style]}
      testID={testID}
    >
      {options.map((opt) => {
        const selected = opt.value === value;
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
              selected ? styles.segmentSelected : null,
              { backgroundColor: selected ? colors.surface : TRANSPARENT },
            ]}
            testID={opt.testID}
            {...ariaSelectedProps(selected)}
          >
            <Text style={[styles.label, { color: selected ? colors.text : colors.textSecondary }]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default SegmentedControl;
