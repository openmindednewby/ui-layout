/**
 * TruncatedText — a single-line text/link that middle-truncates to fit its container and
 * never overflows, at any width.
 *
 * THREE THINGS THAT LOOK LIKE THEY WOULD WORK AND DO NOT (all verified against
 * react-native-web 0.21, not assumed):
 *
 * 1. `numberOfLines={1}` alone. RN-web compiles it to `text-overflow: ellipsis`, which only
 *    truncates at the TAIL. Every URL from one publisher then collapses to the same
 *    `timesofindia.indiatimes.com/city/de…` prefix — the reader cannot tell the articles
 *    apart. There is no CSS for middle truncation, so it is computed in JS here.
 * 2. `title={full}` for the hover tooltip. RN-web's `<Text>` forwards exactly
 *    `href`, `lang` and `pointerEvents` beyond the shared whitelist — `title` is dropped
 *    silently. It is set on the host node through a ref instead (the same escape hatch
 *    `ui-buttons/useKeyboardActivation` already uses).
 * 3. JS truncation alone. The character budget is estimated from the measured width, and an
 *    estimate can be wrong for an unusual glyph mix. So `numberOfLines={1}` is ALSO applied,
 *    as a hard backstop: if the estimate ever runs long, CSS clamps it. Overflow is then
 *    impossible by construction rather than by tuning.
 * 4. `onLayout` on the `<Text>` itself. It does not fire under RN-web, so the measured width
 *    stayed 0, the character budget stayed 0, and the component silently degraded to exactly
 *    the tail-only CSS truncation of (1) — compiling, typechecking and passing its unit tests
 *    the whole time, because the helpers are pure and were never the broken part. The width is
 *    measured on a wrapping `<View>`, which does fire, and the result was confirmed in a
 *    browser rather than inferred.
 *
 * The full, untruncated value always stays reachable: as the accessible name (`aria-label`)
 * and, on web, as the native tooltip.
 */
import React, { useCallback, useMemo, useRef, useState } from 'react';

import { Platform, StyleSheet, Text, View, type LayoutChangeEvent, type TextStyle } from 'react-native';

import { formatUrlForDisplay, truncateMiddle } from './truncate';

/**
 * Mean glyph width as a fraction of font size, for the system sans stack. Deliberately on the
 * WIDE side of the true average (~0.5) so the estimate errs toward truncating slightly early
 * rather than overflowing — and `numberOfLines` catches whatever it still gets wrong.
 */
const AVG_CHAR_WIDTH_RATIO = 0.58;
const DEFAULT_FONT_SIZE = 13;
/** Width is unknown until the first `onLayout`; render the full string for that one frame. */
const UNMEASURED = 0;

const styles = StyleSheet.create({
  base: { fontSize: DEFAULT_FONT_SIZE },
  /** `minWidth: 0` lets the text shrink inside a flex row instead of forcing the row wider. */
  fill: { flexShrink: 1, minWidth: 0 },
});

export interface TruncatedTextProps {
  /** The full value. Always the accessible name and the web tooltip, however it is displayed. */
  value: string;
  /**
   * Treat `value` as a URL: drop `scheme://`, a leading `www.` and a bare trailing slash so the
   * character budget is spent on the host and the slug rather than on boilerplate.
   */
  isUrl?: boolean;
  /** Web only: render a real `<a href>`, so middle-click and "copy link address" work. */
  href?: string;
  onPress?: () => void;
  style?: TextStyle | TextStyle[];
  testID: string;
  accessibilityLabel: string;
  accessibilityHint: string;
}

/** Characters that fit in `width` at `fontSize`, or 0 while the width is still unmeasured. */
function charBudget(width: number, fontSize: number): number {
  if (width <= UNMEASURED) return UNMEASURED;
  return Math.floor(width / (fontSize * AVG_CHAR_WIDTH_RATIO));
}

export const TruncatedText = ({
  value,
  isUrl = false,
  href,
  onPress,
  style,
  testID,
  accessibilityLabel,
  accessibilityHint,
}: TruncatedTextProps): React.ReactElement => {
  const [width, setWidth] = useState(UNMEASURED);
  const hostRef = useRef<Text | null>(null);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  }, []);

  /**
   * The native tooltip. RN-web renders `<Text>` to a real DOM node, so the ref is an
   * HTMLElement there; on native the ref is a Text instance and this is skipped.
   */
  const attachTooltip = useCallback(
    (node: Text | null) => {
      hostRef.current = node;
      if (Platform.OS !== 'web' || node === null) return;
      (node as unknown as HTMLElement).setAttribute?.('title', value);
    },
    [value],
  );

  const flatStyle = useMemo(() => StyleSheet.flatten([styles.base, style]) as TextStyle, [style]);
  const fontSize = flatStyle.fontSize ?? DEFAULT_FONT_SIZE;

  const display = useMemo(() => {
    const source = isUrl ? formatUrlForDisplay(value) : value;
    const budget = charBudget(width, fontSize);
    return budget === UNMEASURED ? source : truncateMiddle(source, budget);
  }, [value, isUrl, width, fontSize]);

  return (
    <View style={styles.fill} onLayout={onLayout}>
      <Text
        ref={attachTooltip}
        numberOfLines={1}
        style={[styles.base, style]}
        testID={testID}
        accessibilityRole={onPress !== undefined || href !== undefined ? 'link' : 'text'}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        onPress={onPress}
        {...(Platform.OS === 'web' && href !== undefined ? { href } : {})}
      >
        {display}
      </Text>
    </View>
  );
};

export default TruncatedText;
