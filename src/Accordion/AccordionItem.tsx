/**
 * AccordionItem — one disclosure row: a pressable header (title, optional right
 * adornment/badge slot, a rotating chevron) plus a collapsible body region.
 *
 * Reads its open state, toggle and `variant` from the enclosing {@link Accordion} via context.
 *  - `plain` (default): a borderless row with the title left and a right-hand chevron that
 *    flips 180° on open, separated from the previous item by a hairline divider.
 *  - `boxed`: the item is its own bordered, rounded box with a LEADING ▸ marker that rotates
 *    90° on open and a muted, 600-weight summary (the AML v1 console `<details>` look).
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Animated, Easing, Platform, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { useReducedMotion } from '@dloizides/rn-web-hooks';
import { useUi } from '@dloizides/ui-feedback';
import { SvgIcon } from '@dloizides/ui-icons';

import { useAccordionContext } from './AccordionContext';

import { LAYOUT_I18N } from '../constants';

const HEADER_PADDING_H = 16;
const HEADER_PADDING_V = 12;
const BODY_PADDING_H = 16;
const BODY_PADDING_V = 12;
const HEADER_GAP = 8;
const TITLE_FONT_SIZE = 15;
const TITLE_FONT_WEIGHT = '600' as const;
const CHEVRON_SIZE = 18;
const ROTATE_DURATION_MS = 160;
const ROTATE_COLLAPSED = 0;
const ROTATE_EXPANDED = 1;
const COLLAPSED_DEG = '0deg';
const PLAIN_EXPANDED_DEG = '180deg';
const BOXED_EXPANDED_DEG = '90deg';
const DISABLED_OPACITY = 0.5;
const FULL_OPACITY = 1;
const ROLE_REGION = 'region';

// Boxed variant (AML v1 `.sc-more` / `.adv-match` <details>).
const BOX_BORDER_RADIUS = 10;
const BOX_PADDING_H = 14;
const BOX_HEADER_PADDING_V = 8;
const BOX_BODY_PADDING_BOTTOM = 10;
const BOX_BODY_PADDING_TOP = 2;
const BOX_TITLE_FONT_SIZE = 14;
const BOX_MARKER_FONT_SIZE = 13;
const BOX_MARKER_GAP = 6;
const BOX_MARKER = '▸'; // ▸

const styles = StyleSheet.create({
  item: { borderTopWidth: StyleSheet.hairlineWidth },
  boxItem: { borderWidth: 1, borderRadius: BOX_BORDER_RADIUS, paddingHorizontal: BOX_PADDING_H },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HEADER_PADDING_H,
    paddingVertical: HEADER_PADDING_V,
  },
  boxHeader: { paddingHorizontal: 0, paddingVertical: BOX_HEADER_PADDING_V },
  headerLeft: { flexShrink: 1, flexGrow: 1 },
  headerLeftRow: { flexDirection: 'row', alignItems: 'center' },
  headerRight: { flexDirection: 'row', alignItems: 'center', marginLeft: HEADER_GAP },
  title: { fontSize: TITLE_FONT_SIZE, fontWeight: TITLE_FONT_WEIGHT },
  boxTitle: { fontSize: BOX_TITLE_FONT_SIZE, fontWeight: TITLE_FONT_WEIGHT },
  chevron: { marginLeft: HEADER_GAP },
  marker: { marginRight: BOX_MARKER_GAP },
  markerText: { fontSize: BOX_MARKER_FONT_SIZE, fontWeight: TITLE_FONT_WEIGHT },
  body: { paddingHorizontal: BODY_PADDING_H, paddingBottom: BODY_PADDING_V },
  boxBody: { paddingHorizontal: 0, paddingBottom: BOX_BODY_PADDING_BOTTOM, paddingTop: BOX_BODY_PADDING_TOP },
});

export interface AccordionItemProps {
  /** Stable unique id used for open-state tracking + derived testIDs. */
  id: string;
  /** Header title — a string (rendered as themed text) or custom node. */
  title: string | React.ReactNode;
  /** Optional right-hand adornment (badge, count, icon…) shown before the chevron. */
  right?: React.ReactNode;
  /** Collapsible body content. */
  children?: React.ReactNode;
  /** Start open in uncontrolled mode (ignored when the container is controlled). */
  defaultOpen?: boolean;
  /** Disable toggling for this item. */
  disabled?: boolean;
  /** testID for the header button. Body = `${testID}-body`, chevron = `${testID}-chevron`. */
  testID?: string;
  /** Accessible name for the header button (defaults to `title` when it is a string). */
  accessibilityLabel?: string;
  /** Accessible hint for the header button. */
  accessibilityHint?: string;
}

/**
 * Extra web-only DOM prop react-native-web's `Pressable` forwards but RN's types omit.
 * `Pressable` renders `accessibilityRole="button"` as a native `<button>` (keyboard-operable
 * for free in real browsers); the handler calls `preventDefault()` so the native
 * Enter/Space activation does not ALSO fire `onPress` (no double toggle).
 */
interface WebKeyboardProps {
  onKeyDown?: (event: { key?: string; preventDefault?: () => void }) => void;
}

const ACTIVATION_KEYS = ['Enter', ' ', 'Spacebar'];
const INSTANT_DURATION_MS = 0;

/*
 * The local `prefersReducedMotion` that used to sit here was a character-for-character copy of
 * the one in accordionAnimation.ts. Both now come from @dloizides/rn-web-hooks. This call site
 * uses the HOOK rather than the imperative probe: it reads the preference during render, so the
 * chevron now responds when the user flips "reduce motion" mid-session — the one-shot copy kept
 * animating until some unrelated state change happened to re-run the effect.
 */

export const AccordionItem = ({
  id,
  title,
  right,
  children,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- read by the container's initial-open scan, not here
  defaultOpen: _defaultOpen,
  disabled = false,
  testID,
  accessibilityLabel,
  accessibilityHint,
}: AccordionItemProps): React.ReactElement => {
  const { theme, t } = useUi();
  const { colors } = theme;
  const { openIds, toggle, variant } = useAccordionContext();
  const boxed = variant === 'boxed';

  const expanded = openIds.has(id);
  const headerTestID = testID ?? `accordion-item-${id}`;
  const bodyTestID = `${headerTestID}-body`;
  const chevronTestID = `${headerTestID}-chevron`;

  const [rotation] = useState(() => new Animated.Value(expanded ? ROTATE_EXPANDED : ROTATE_COLLAPSED));
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    Animated.timing(rotation, {
      toValue: expanded ? ROTATE_EXPANDED : ROTATE_COLLAPSED,
      duration: reducedMotion ? INSTANT_DURATION_MS : ROTATE_DURATION_MS,
      easing: Easing.out(Easing.ease),
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [expanded, rotation, reducedMotion]);

  const rotate = rotation.interpolate({
    inputRange: [ROTATE_COLLAPSED, ROTATE_EXPANDED],
    outputRange: [COLLAPSED_DEG, boxed ? BOXED_EXPANDED_DEG : PLAIN_EXPANDED_DEG],
  });

  const handlePress = useCallback(() => {
    if (!disabled) toggle(id);
  }, [disabled, id, toggle]);

  const handleKeyDown = useCallback(
    (event: { key?: string; preventDefault?: () => void }) => {
      if (disabled) return;
      const key = event.key ?? '';
      const isActivation = ACTIVATION_KEYS.includes(key);
      if (!isActivation) return;
      if (typeof event.preventDefault === 'function') event.preventDefault();
      toggle(id);
    },
    [disabled, id, toggle],
  );

  const keyboardProps: WebKeyboardProps =
    Platform.OS === 'web' ? { onKeyDown: handleKeyDown } : {};

  const itemStyle = useMemo<ViewStyle[]>(
    () =>
      boxed
        ? [styles.boxItem, { borderColor: colors.border }]
        : [styles.item, { borderTopColor: colors.border }],
    [boxed, colors.border],
  );
  const headerStyle = useMemo<ViewStyle[]>(
    () => [
      styles.header,
      ...(boxed ? [styles.boxHeader] : []),
      { opacity: disabled ? DISABLED_OPACITY : FULL_OPACITY },
    ],
    [boxed, disabled],
  );

  const resolvedLabel =
    accessibilityLabel ?? (typeof title === 'string' ? title : undefined);

  const titleNode =
    typeof title === 'string' ? (
      <Text style={[boxed ? styles.boxTitle : styles.title, { color: boxed ? colors.textSecondary : colors.text }]}>
        {title}
      </Text>
    ) : (
      title
    );

  return (
    <View style={itemStyle}>
      <Pressable
        accessibilityHint={accessibilityHint ?? t(LAYOUT_I18N.accordionToggleHint)}
        accessibilityLabel={resolvedLabel}
        accessibilityRole="button"
        accessibilityState={{ expanded, disabled }}
        aria-controls={bodyTestID}
        aria-expanded={expanded}
        disabled={disabled}
        style={headerStyle}
        testID={headerTestID}
        onPress={handlePress}
        {...keyboardProps}
      >
        <View style={[styles.headerLeft, boxed ? styles.headerLeftRow : null]}>
          {boxed ? (
            // Decorative — the open/closed state is already conveyed by aria-expanded on the header.
            <Animated.View
              accessibilityElementsHidden
              aria-hidden
              importantForAccessibility="no-hide-descendants"
              style={[styles.marker, { transform: [{ rotate }] }]}
              testID={chevronTestID}
            >
              <Text style={[styles.markerText, { color: colors.textSecondary }]}>{BOX_MARKER}</Text>
            </Animated.View>
          ) : null}
          {titleNode}
        </View>
        <View style={styles.headerRight}>
          {right}
          {boxed ? null : (
            <Animated.View
              accessibilityElementsHidden
              aria-hidden
              importantForAccessibility="no-hide-descendants"
              style={[styles.chevron, { transform: [{ rotate }] }]}
            >
              <SvgIcon color={colors.textSecondary} name="chevronDown" size={CHEVRON_SIZE} testID={chevronTestID} />
            </Animated.View>
          )}
        </View>
      </Pressable>

      {expanded ? (
        <View
          accessibilityLabel={resolvedLabel}
          nativeID={bodyTestID}
          role={ROLE_REGION}
          style={boxed ? styles.boxBody : styles.body}
          testID={bodyTestID}
        >
          {children}
        </View>
      ) : null}
    </View>
  );
};

export default AccordionItem;
