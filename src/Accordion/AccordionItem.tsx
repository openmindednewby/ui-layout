/**
 * AccordionItem — one disclosure row: a pressable header (title left, optional right
 * adornment/badge slot, a rotating chevron) plus a collapsible body region.
 *
 * Reads its open state + toggle from the enclosing {@link Accordion} via context.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Animated, Easing, Platform, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';
import { SvgIcon } from '@dloizides/ui-icons';

import { useAccordionContext } from './AccordionContext';

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
const EXPANDED_DEG = '180deg';
const DISABLED_OPACITY = 0.5;
const FULL_OPACITY = 1;
const ROLE_REGION = 'region';

const styles = StyleSheet.create({
  item: { borderTopWidth: StyleSheet.hairlineWidth },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HEADER_PADDING_H,
    paddingVertical: HEADER_PADDING_V,
  },
  headerLeft: { flexShrink: 1, flexGrow: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', marginLeft: HEADER_GAP },
  title: { fontSize: TITLE_FONT_SIZE, fontWeight: TITLE_FONT_WEIGHT },
  chevron: { marginLeft: HEADER_GAP },
  body: { paddingHorizontal: BODY_PADDING_H, paddingBottom: BODY_PADDING_V },
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
  const { openIds, toggle } = useAccordionContext();

  const expanded = openIds.has(id);
  const headerTestID = testID ?? `accordion-item-${id}`;
  const bodyTestID = `${headerTestID}-body`;
  const chevronTestID = `${headerTestID}-chevron`;

  const [rotation] = useState(() => new Animated.Value(expanded ? ROTATE_EXPANDED : ROTATE_COLLAPSED));

  useEffect(() => {
    Animated.timing(rotation, {
      toValue: expanded ? ROTATE_EXPANDED : ROTATE_COLLAPSED,
      duration: ROTATE_DURATION_MS,
      easing: Easing.out(Easing.ease),
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [expanded, rotation]);

  const rotate = rotation.interpolate({
    inputRange: [ROTATE_COLLAPSED, ROTATE_EXPANDED],
    outputRange: [COLLAPSED_DEG, EXPANDED_DEG],
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
    () => [styles.item, { borderTopColor: colors.border }],
    [colors.border],
  );
  const headerStyle = useMemo<ViewStyle[]>(
    () => [styles.header, { opacity: disabled ? DISABLED_OPACITY : FULL_OPACITY }],
    [disabled],
  );

  const resolvedLabel =
    accessibilityLabel ?? (typeof title === 'string' ? title : undefined);

  return (
    <View style={itemStyle}>
      <Pressable
        accessibilityHint={accessibilityHint ?? t('common.accordionToggleHint')}
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
        <View style={styles.headerLeft}>
          {typeof title === 'string' ? (
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          ) : (
            title
          )}
        </View>
        <View style={styles.headerRight}>
          {right}
          <Animated.View style={[styles.chevron, { transform: [{ rotate }] }]}>
            <SvgIcon color={colors.textSecondary} name="chevronDown" size={CHEVRON_SIZE} testID={chevronTestID} />
          </Animated.View>
        </View>
      </Pressable>

      {expanded ? (
        <View accessibilityLabel={resolvedLabel} nativeID={bodyTestID} role={ROLE_REGION} style={styles.body} testID={bodyTestID}>
          {children}
        </View>
      ) : null}
    </View>
  );
};

export default AccordionItem;
