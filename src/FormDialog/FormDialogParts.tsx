import React, { useCallback, useEffect, useRef } from 'react';

import { Platform } from 'react-native';

import { Button } from '@dloizides/ui-buttons';

const FIELD_SELECTOR = 'input:not([disabled]), textarea:not([disabled]), select:not([disabled])';
const FORM_STYLE = { display: 'contents' } as const;

interface WebFormBodyProps {
  children: React.ReactNode;
  visible: boolean;
  onSubmit: () => void;
}

/** On web, a native form: Enter in a single-line field submits it and the first field gets focus. */
export const WebFormBody = ({ children, visible, onSubmit }: WebFormBodyProps): React.ReactElement => {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (Platform.OS !== 'web' || !visible) return;
    formRef.current?.querySelector<HTMLElement>(FIELD_SELECTOR)?.focus();
  }, [visible]);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      onSubmit();
    },
    [onSubmit],
  );

  if (Platform.OS !== 'web') return <>{children}</>;
  return React.createElement(
    'form',
    { ref: formRef, noValidate: true, style: FORM_STYLE, onSubmit: handleSubmit },
    children,
    React.createElement('button', { type: 'submit', hidden: true, tabIndex: -1, 'aria-hidden': true }),
  );
};

interface FormDialogActionsProps {
  submitLabel: string;
  submitHint: string;
  cancelLabel: string;
  cancelHint: string;
  loading: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  testID: string;
}

/** Cancel then Submit; the shared footer lays them in a row or stacks Submit on top. */
export const FormDialogActions = (props: FormDialogActionsProps): React.ReactElement => (
  <>
    <Button
      accessibilityHint={props.cancelHint}
      accessibilityLabel={props.cancelLabel}
      disabled={props.loading}
      label={props.cancelLabel}
      testID={`${props.testID}-cancel`}
      variant="secondary"
      onPress={props.onCancel}
    />
    <Button
      accessibilityHint={props.submitHint}
      accessibilityLabel={props.submitLabel}
      label={props.submitLabel}
      loading={props.loading}
      testID={`${props.testID}-save`}
      variant="primary"
      onPress={props.onSubmit}
    />
  </>
);
