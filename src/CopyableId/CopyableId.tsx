/**
 * CopyableId — show a long machine identifier (a GUID, a reference, a correlation id) so a human
 * can both READ enough of it to tell two apart, and TAKE it in one action.
 *
 * WHY MIDDLE TRUNCATION AND NOT `numberOfLines={1}`: two GUIDs from the same table share a
 * prefix far more often than intuition suggests, and tail-truncation renders them IDENTICALLY —
 * `3f2a9c81-…`. The tail is what distinguishes them, so both ends must survive. That is exactly
 * what `TruncatedText` already solves for URLs, so this composes it rather than re-deriving it.
 *
 * WHY A COPY BUTTON IS NOT OPTIONAL POLISH: an ID exists to be pasted somewhere else — into a
 * re-screen, a support ticket, a SQL console. Displaying a truncated GUID with no copy affordance
 * is strictly WORSE than not showing it, because what is on screen is not the value: hand-select
 * it and you get `3f2a9c81…d4e7`, ellipsis and all, which silently fails wherever it is pasted.
 * The full value is therefore always the accessible name and the web tooltip, and the button
 * copies the full value, never the display string.
 *
 * FAILURE IS SHOWN, NOT SWALLOWED: see `copyText` — clipboard writes really do fail on plain
 * http, which is how staging is served. A silent failure would hand the analyst a false belief.
 */
import React, { useMemo } from 'react';

import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { LAYOUT_I18N } from '../constants';
import { TruncatedText } from '../TruncatedText/TruncatedText';
import { CopyStatus } from './CopyStatus';
import { useCopyToClipboard } from './useCopyToClipboard';

const LABEL_FONT_SIZE = 11;
const VALUE_FONT_SIZE = 12;
const ACTION_FONT_SIZE = 12;
const ROW_GAP = 8;
const CELL_GAP = 2;
const LABEL_LETTER_SPACING = 0.4;
const ACTION_PADDING_H = 6;
const ACTION_PADDING_V = 2;
const ACTION_RADIUS = 6;

const styles = StyleSheet.create({
  cell: { gap: CELL_GAP },
  label: {
    fontSize: LABEL_FONT_SIZE,
    fontWeight: '700',
    letterSpacing: LABEL_LETTER_SPACING,
    textTransform: 'uppercase',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: ROW_GAP },
  /**
   * The truncation width comes from this wrapper, not from the row: `TruncatedText` measures its
   * PARENT (see `useAvailableWidth`), and the row also holds the copy button.
   *
   * `flex: 1` IS LOAD-BEARING — do not weaken it to `flexShrink: 1`. A shrink-only wrapper
   * SHRINK-WRAPS its content, which makes the measured parent width depend on the very string we
   * are computing: truncate -> wrapper narrows -> re-measure smaller -> truncate harder. Verified
   * in Chrome: with `flexShrink: 1` a 506px-wide container and a 306px one both rendered the SAME
   * 196px string, i.e. the id was cut short with 300px of room going spare. `flex: 1` makes the
   * wrapper fill the row's leftover width instead, so its size is independent of what we put in
   * it — the same reason `useAvailableWidth` measures the parent and not the element.
   *
   * `minWidth: 0` is what actually permits a flex child to go below its content width.
   */
  valueWrap: { flex: 1, minWidth: 0 },
  value: { fontSize: VALUE_FONT_SIZE, fontWeight: '600' },
  action: {
    fontSize: ACTION_FONT_SIZE,
    fontWeight: '600',
    paddingHorizontal: ACTION_PADDING_H,
    paddingVertical: ACTION_PADDING_V,
    borderRadius: ACTION_RADIUS,
  },
});

export interface CopyableIdProps {
  /** The full identifier. Always what gets copied, and always the accessible name / tooltip. */
  value: string;
  /** Optional eyebrow above the value (e.g. "Screening ID"). Pass pre-localized. */
  label?: string;
  /**
   * Style for the outer container.
   *
   * Hosts should give this a width that does NOT derive from its own content — a `flexBasis`, a
   * `width`, or `flex: 1`. The component measures its container to decide how much of the value
   * to show, so a shrink-to-fit parent makes the available width depend on the string being
   * computed, and the id renders clipped with space to spare.
   */
  style?: StyleProp<ViewStyle>;
  /** Base testID; the copy control is `${testID}-copy` and the value `${testID}-value`. */
  testID: string;
  /** Accessible name for the value itself. Pass pre-localized; falls back to the raw value. */
  accessibilityLabel?: string;
  /**
   * Platform clipboard writer, for hosts that have one (React Native). Omit on web — the DOM
   * paths in `copyText` cover it.
   */
  writer?: (text: string) => void | Promise<void>;
}

/** Colour scale step used for every state tone. */
const TONE_STEP = '500';

/**
 * The copy control's label and tone for a given status.
 *
 * `semantic.success` is NOT a guaranteed key on the theme contract — only `semantic.error` is
 * (see `FeedbackThemeSemantic`). A host that ships no success scale falls back to the primary
 * colour rather than rendering an undefined colour, which RN-web turns into unstyled black.
 */
function useActionState(status: CopyStatus): { key: string; color: string } {
  const { theme } = useUi();
  return useMemo(() => {
    const primary = theme.palette.primary[TONE_STEP];
    if (status === CopyStatus.Copied) {
      return { key: LAYOUT_I18N.copied, color: theme.semantic.success?.[TONE_STEP] ?? primary };
    }
    if (status === CopyStatus.Failed) {
      return { key: LAYOUT_I18N.copyFailed, color: theme.semantic.error[TONE_STEP] };
    }
    return { key: LAYOUT_I18N.copy, color: primary };
  }, [status, theme]);
}

export const CopyableId = ({
  value,
  label,
  style,
  testID,
  accessibilityLabel,
  writer,
}: CopyableIdProps): React.ReactElement => {
  const { theme, t } = useUi();
  const { colors } = theme;
  const { status, copy } = useCopyToClipboard(value, writer);
  const action = useActionState(status);

  return (
    <View style={[styles.cell, style]} testID={testID}>
      {label !== undefined && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      )}
      <View style={styles.row}>
        <View style={styles.valueWrap}>
          <TruncatedText
            value={value}
            style={[styles.value, { color: colors.text }]}
            testID={`${testID}-value`}
            accessibilityLabel={accessibilityLabel ?? value}
            accessibilityHint={t(LAYOUT_I18N.copyableIdHint)}
          />
        </View>
        <Text
          onPress={copy}
          accessibilityRole="button"
          // The accessible NAME carries the status, because `accessibilityHint` is dropped by
          // react-native-web and never reaches the DOM — a screen-reader user would otherwise get
          // no confirmation at all that the copy happened.
          accessibilityLabel={t(action.key)}
          accessibilityHint={t(LAYOUT_I18N.copyHint)}
          testID={`${testID}-copy`}
          style={[styles.action, { color: action.color }]}
        >
          {t(action.key)}
        </Text>
      </View>
    </View>
  );
};

export default CopyableId;
