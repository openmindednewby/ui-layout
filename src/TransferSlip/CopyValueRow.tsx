import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { Button, IconButton } from '@dloizides/ui-buttons';
import { useUi } from '@dloizides/ui-feedback';
import { SvgIcon } from '@dloizides/ui-icons';

import { CopyControl } from './CopyControl';
import { CopyRowEmphasis } from './CopyRowEmphasis';
import { copyActionLabel } from './copyActionLabel';
import type { CopyValueLabels } from './copyActionLabel';
import { CopyStatus } from '../CopyableId/CopyStatus';
import { useCopyToClipboard } from '../CopyableId/useCopyToClipboard';

const LABEL_SIZE = 13;
const VALUE_SIZE = 16;
const PROMINENT_SIZE = 20;
const ROW_GAP = 12;
const STACK_GAP = 8;
const ROW_PAD = 10;
const TEXT_GAP = 2;
const MONO_SPACING = 1;

const styles = StyleSheet.create({
  inline: { flexDirection: 'row', alignItems: 'center', gap: ROW_GAP, paddingVertical: ROW_PAD, borderTopWidth: StyleSheet.hairlineWidth },
  prominent: { gap: STACK_GAP, paddingVertical: ROW_PAD },
  text: { flex: 1, minWidth: 0, gap: TEXT_GAP },
  label: { fontSize: LABEL_SIZE, fontWeight: '600' },
  value: { fontSize: VALUE_SIZE },
  big: { fontSize: PROMINENT_SIZE, fontWeight: '700', fontFamily: 'monospace', letterSpacing: MONO_SPACING },
});

export interface CopyValueRowProps {
  label: string;
  value: string;
  labels: CopyValueLabels;
  emphasis?: CopyRowEmphasis;
  copyControl?: CopyControl;
  copyValue?: string;
  monospace?: boolean;
  writer?: (text: string) => void | Promise<void>;
  testID: string;
}

/** One labelled value with a copy button that confirms the copy or says it failed. */
export const CopyValueRow = ({
  label,
  value,
  labels,
  emphasis = CopyRowEmphasis.Inline,
  copyControl = CopyControl.Text,
  copyValue,
  monospace = false,
  writer,
  testID,
}: CopyValueRowProps): React.ReactElement => {
  const { theme } = useUi();
  const { colors } = theme;
  const { status, copy } = useCopyToClipboard(copyValue ?? value, writer);
  const action = copyActionLabel(status, labels);
  const prominent = emphasis === CopyRowEmphasis.Prominent;
  const valueStyle = prominent || monospace ? styles.big : styles.value;

  return (
    <View style={prominent ? styles.prominent : [styles.inline, { borderTopColor: colors.border }]} testID={testID}>
      <View style={styles.text}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
        <Text selectable style={[valueStyle, { color: colors.text }]} testID={`${testID}-value`}>{value}</Text>
      </View>
      {copyControl === CopyControl.Icon ? (
        <IconButton
          accessibilityHint={labels.hint}
          accessibilityLabel={`${action}: ${label}`}
          label={status === CopyStatus.Idle ? undefined : action}
          renderIcon={(color, size) => <SvgIcon color={color} name="copy" size={size} />}
          testID={`${testID}-copy`}
          variant="outline"
          onPress={copy}
        />
      ) : (
        <Button
          accessibilityHint={labels.hint}
          accessibilityLabel={`${action}: ${label}`}
          fullWidth={prominent}
          label={action}
          size={prominent ? 'md' : 'sm'}
          testID={`${testID}-copy`}
          variant="outline"
          onPress={copy}
        />
      )}
    </View>
  );
};

export default CopyValueRow;
