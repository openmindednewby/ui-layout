import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

const LEAD_LABEL_SIZE = 14;
const AMOUNT_SIZE = 30;
const RECIPIENT_SIZE = 15;
const LEAD_PAD = 16;
const LEAD_RADIUS = 12;
const GAP = 12;
const LEAD_GAP = 4;
const LEAD_BORDER = 1.5;
const ACCENT_STEP = '500';

const styles = StyleSheet.create({
  slip: { gap: GAP, width: '100%' },
  lead: { padding: LEAD_PAD, borderRadius: LEAD_RADIUS, borderWidth: LEAD_BORDER, gap: LEAD_GAP },
  leadLabel: { fontSize: LEAD_LABEL_SIZE },
  amount: { fontSize: AMOUNT_SIZE, fontWeight: '800' },
  recipient: { fontSize: RECIPIENT_SIZE },
  rows: { width: '100%' },
});

export interface TransferSlipProps {
  leadLabel: string;
  amount: string;
  recipient?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  testID: string;
}

/** A payment slip: the amount and recipient lead, then the copy rows (children), then an optional footer. */
export const TransferSlip = ({ leadLabel, amount, recipient, children, footer, testID }: TransferSlipProps): React.ReactElement => {
  const { theme } = useUi();
  const { colors } = theme;
  const accent = theme.palette.primary[ACCENT_STEP];

  return (
    <View style={styles.slip} testID={testID}>
      <View style={[styles.lead, { borderColor: accent, backgroundColor: colors.surface }]} testID={`${testID}-lead`}>
        <Text style={[styles.leadLabel, { color: colors.textSecondary }]}>{leadLabel}</Text>
        <Text style={[styles.amount, { color: colors.text }]} testID={`${testID}-amount`}>{amount}</Text>
        {recipient !== undefined && <Text style={[styles.recipient, { color: colors.text }]}>{recipient}</Text>}
      </View>
      <View style={styles.rows}>{children}</View>
      {footer}
    </View>
  );
};

export default TransferSlip;
