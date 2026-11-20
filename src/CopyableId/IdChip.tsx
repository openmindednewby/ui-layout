import React from 'react';

import { Platform, Pressable, StyleSheet, Text } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { MIN_TARGET_PX } from '../constants';
import { CopyStatus } from './CopyStatus';
import { useCopyToClipboard } from './useCopyToClipboard';

const RADIUS = 6;
const PAD_H = 10;
const GAP = 6;
const FONT_SIZE = 12;
const COPY_GLYPH = '⧉';
const COPIED_GLYPH = '✓';
const MONO = Platform.select({ web: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', default: 'monospace' });

const styles = StyleSheet.create({
  chip: { alignItems: 'center', alignSelf: 'flex-start', borderRadius: RADIUS, borderWidth: 1, flexDirection: 'row', gap: GAP, maxWidth: '100%', minHeight: MIN_TARGET_PX, paddingHorizontal: PAD_H },
  text: { flexShrink: 1, fontFamily: MONO, fontSize: FONT_SIZE },
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
}

/** An id chip: label and monospace value inside one box with a copy glyph; pressing it copies the full value */
export const IdChip = ({ label, value, testID, accessibilityLabel, accessibilityHint, display, valueTestID, writer }: IdChipProps): React.ReactElement => {
  const { theme } = useUi();
  const copyable = value !== null && value !== '';
  const { status, copy } = useCopyToClipboard(value ?? '', writer);
  const ink = { color: theme.colors.text };
  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: !copyable }}
      disabled={!copyable}
      style={[styles.chip, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
      testID={testID}
      onPress={copyable ? copy : undefined}
    >
      <Text style={[styles.text, { color: theme.colors.textSecondary }]}>{label}</Text>
      <Text numberOfLines={1} style={[styles.text, ink]} testID={valueTestID}>{display ?? value}</Text>
      {copyable ? <Text aria-hidden style={[styles.text, ink]} testID={`${testID}-glyph`}>{status === CopyStatus.Copied ? COPIED_GLYPH : COPY_GLYPH}</Text> : null}
    </Pressable>
  );
};

export default IdChip;
