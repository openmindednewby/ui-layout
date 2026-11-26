import React from 'react';

import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { MIN_TARGET_PX } from '../constants';
import { CopyStatus } from './CopyStatus';
import { IdEllipsis } from './IdEllipsis';
import { useCopyToClipboard } from './useCopyToClipboard';

const RADIUS = 6;
const PAD_H = 10;
const GAP = 6;
const FONT_SIZE = 12;
const COPY_GLYPH = '⧉';
const COPIED_GLYPH = '✓';
const COMPACT_BOX_PX = 22;
const COMPACT_INSET = (MIN_TARGET_PX - COMPACT_BOX_PX) / 2;
const COMPACT_RADIUS = 4;
const COMPACT_PAD_H = 8;
const MONO = Platform.select({ web: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', default: 'monospace' });

const styles = StyleSheet.create({
  chip: { alignItems: 'center', alignSelf: 'flex-start', borderRadius: RADIUS, borderWidth: 1, flexDirection: 'row', gap: GAP, maxWidth: '100%', minHeight: MIN_TARGET_PX, paddingHorizontal: PAD_H },
  text: { flexShrink: 1, fontFamily: MONO, fontSize: FONT_SIZE },
  fixed: { flexShrink: 0, fontFamily: MONO, fontSize: FONT_SIZE },
  compactHit: { alignSelf: 'flex-start', justifyContent: 'center', marginVertical: -COMPACT_INSET, maxWidth: '100%', minHeight: MIN_TARGET_PX },
  compactBox: { alignItems: 'center', borderRadius: COMPACT_RADIUS, borderWidth: 1, flexDirection: 'row', gap: GAP, minHeight: COMPACT_BOX_PX, paddingHorizontal: COMPACT_PAD_H },
});

export interface IdChipProps {
  label: string;
  value: string | null;
  testID: string;
  accessibilityLabel: string;
  accessibilityHint: string;
  display?: string;
  valueTestID?: string;
  writer?: (text: string) => void | Promise<void>;
  width?: number;
  ellipsis?: IdEllipsis;
  /** Compact: a 22 px box inside a 44 px hit box that takes only 22 px of layout. */
  compact?: boolean;
}

/** An id chip: label and monospace value inside one box with a copy glyph; pressing it copies the full value; a set width keeps label and glyph whole and cuts the value at `ellipsis` */
export const IdChip = ({ label, value, testID, accessibilityLabel, accessibilityHint, display, valueTestID, writer, width, ellipsis = IdEllipsis.Tail, compact = false }: IdChipProps): React.ReactElement => {
  const { theme } = useUi();
  const copyable = value !== null && value !== '';
  const { status, copy } = useCopyToClipboard(value ?? '', writer);
  const ink = { color: theme.colors.text };
  const sized = width === undefined ? null : { width };
  const paint = { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border };
  const body = (
    <>
      <Text style={[styles.fixed, { color: theme.colors.textSecondary }]}>{label}</Text>
      <Text ellipsizeMode={ellipsis} numberOfLines={1} style={[styles.text, ink]} testID={valueTestID}>{display ?? value}</Text>
      {copyable ? <Text aria-hidden style={[styles.fixed, ink]} testID={`${testID}-glyph`}>{status === CopyStatus.Copied ? COPIED_GLYPH : COPY_GLYPH}</Text> : null}
    </>
  );
  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: !copyable }}
      disabled={!copyable}
      style={compact ? [styles.compactHit, sized] : [styles.chip, sized, paint]}
      testID={testID}
      onPress={copyable ? copy : undefined}
    >
      {compact ? <View style={[styles.compactBox, paint]} testID={`${testID}-box`}>{body}</View> : body}
    </Pressable>
  );
};

export default IdChip;
