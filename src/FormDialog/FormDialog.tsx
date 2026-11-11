import React, { useCallback } from 'react';

import { useUi } from '@dloizides/ui-feedback';

import { Modal } from '../Modal/Modal';
import type { ModalSize } from '../Modal/ModalSize';
import { LAYOUT_I18N, LAYOUT_TEST_IDS } from '../constants';
import { FormDialogActions, WebFormBody } from './FormDialogParts';

export interface FormDialogProps {
  visible: boolean;
  title: string;
  children: React.ReactNode;
  submitLabel: string;
  submitHint: string;
  cancelLabel?: string;
  loading?: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  size?: ModalSize;
  testID?: string;
}

/** A centred dialog of form fields with Cancel + Submit; ids `${testID}-dialog`, `-save`, `-cancel`. */
export const FormDialog = ({
  visible,
  title,
  children,
  submitLabel,
  submitHint,
  cancelLabel,
  loading = false,
  onSubmit,
  onCancel,
  size = 'md',
  testID = LAYOUT_TEST_IDS.formDialog,
}: FormDialogProps): React.ReactElement => {
  const { t } = useUi();
  const submit = useCallback(() => {
    if (!loading) onSubmit();
  }, [loading, onSubmit]);

  const footer = (
    <FormDialogActions
      cancelHint={t(LAYOUT_I18N.cancelHint)}
      cancelLabel={cancelLabel ?? t(LAYOUT_I18N.cancel)}
      loading={loading}
      submitHint={submitHint}
      submitLabel={submitLabel}
      testID={testID}
      onCancel={onCancel}
      onSubmit={submit}
    />
  );

  return (
    <Modal footer={footer} size={size} testID={`${testID}-dialog`} title={title} visible={visible} onClose={onCancel}>
      <WebFormBody visible={visible} onSubmit={submit}>
        {children}
      </WebFormBody>
    </Modal>
  );
};

export default FormDialog;
