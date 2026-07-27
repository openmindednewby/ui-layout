/**
 * ConfirmDialog — a confirm/cancel popup built ON {@link Modal}, for the "are you sure?" moment.
 *
 * Replaces per-app inline confirms (e.g. kefi-web's inline attendee-delete row) with one shared,
 * themed dialog reused across every portal. Renders the `message` in the body and a Cancel + Confirm
 * button row (from `@dloizides/ui-buttons`) in the footer. When `destructive` is set the Confirm
 * button uses the `danger` variant — the red, irreversible-action treatment.
 *
 * SAFE BY DEFAULT: Cancel is FIRST in the DOM, so the web focus trap lands on it — a keyboard user
 * never has a destructive Confirm pre-focused. Cancel, the backdrop, and Escape all call `onCancel`;
 * the ✕ is hidden (the explicit Cancel is the dismiss affordance). While `busy`, Confirm shows its
 * spinner and Cancel is disabled, so a slow delete cannot be fired twice or cancelled mid-flight.
 */
import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@dloizides/ui-buttons';
import { useUi } from '@dloizides/ui-feedback';

import { Modal } from './Modal';
import { LAYOUT_I18N, LAYOUT_TEST_IDS } from '../constants';

const MESSAGE_FONT_SIZE = 14;
const MESSAGE_LINE_HEIGHT = 20;
const BUTTON_GAP = 12;

const styles = StyleSheet.create({
  message: { fontSize: MESSAGE_FONT_SIZE, lineHeight: MESSAGE_LINE_HEIGHT },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', columnGap: BUTTON_GAP },
});

export interface ConfirmDialogProps {
  /** Whether the dialog is shown. */
  visible: boolean;
  /** Header title, e.g. "Remove attendee?". */
  title: string;
  /** Body copy, e.g. "This can't be undone." */
  message: string;
  /** Confirm button label. Defaults to the host's `common.confirm` translation. */
  confirmLabel?: string;
  /** Cancel button label. Defaults to the host's `common.cancel` translation. */
  cancelLabel?: string;
  /** Red `danger` Confirm for an irreversible action. Default `false` (blue `primary`). */
  destructive?: boolean;
  /** Called when the user presses Confirm. */
  onConfirm: () => void;
  /** Called by Cancel, the backdrop, and Escape. */
  onCancel: () => void;
  /** In-flight: Confirm shows a spinner and Cancel is disabled. Default `false`. */
  busy?: boolean;
  /** Base testID. Default `confirm-dialog`. Confirm is `${testID}-confirm`, Cancel `${testID}-cancel`. */
  testID?: string;
}

export const ConfirmDialog = ({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive = false,
  onConfirm,
  onCancel,
  busy = false,
  testID = LAYOUT_TEST_IDS.confirmDialog,
}: ConfirmDialogProps): React.ReactElement => {
  const { theme, t } = useUi();

  const resolvedConfirm = confirmLabel ?? t(LAYOUT_I18N.confirm);
  const resolvedCancel = cancelLabel ?? t(LAYOUT_I18N.cancel);

  const footer = (
    <View style={styles.footer}>
      {/* Cancel FIRST — the web focus trap focuses the first focusable child, so the SAFE action is
          the default, never a destructive Confirm. It is also visually first (Confirm trails right). */}
      <Button
        accessibilityHint={t(LAYOUT_I18N.cancelHint)}
        accessibilityLabel={resolvedCancel}
        disabled={busy}
        label={resolvedCancel}
        testID={`${testID}-cancel`}
        variant="secondary"
        onPress={onCancel}
      />
      <Button
        accessibilityHint={t(LAYOUT_I18N.confirmHint)}
        accessibilityLabel={resolvedConfirm}
        label={resolvedConfirm}
        loading={busy}
        testID={`${testID}-confirm`}
        variant={destructive ? 'danger' : 'primary'}
        onPress={onConfirm}
      />
    </View>
  );

  return (
    <Modal
      footer={footer}
      showClose={false}
      size="sm"
      testID={testID}
      title={title}
      visible={visible}
      onClose={onCancel}
    >
      <Text style={[styles.message, { color: theme.colors.text }]} testID={`${testID}-message`}>
        {message}
      </Text>
    </Modal>
  );
};

export default ConfirmDialog;
