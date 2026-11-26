import React, { useRef } from 'react';

import { Platform, Modal as RNModal, StyleSheet, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { LAYOUT_I18N, LAYOUT_TEST_IDS } from '../constants';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useScrollLock } from '../hooks/useScrollLock';
import { FullPageSheetPanel } from './FullPageSheetPanel';
import type { FullPageSheetPanelProps } from './FullPageSheetPanel';

const styles = StyleSheet.create({ root: { flex: 1 } });

export interface FullPageSheetProps extends FullPageSheetPanelProps {
  visible: boolean;
  accessibilityLabel?: string;
}

/** One item drawn large over the whole screen; Close is focused on open, Escape and back close it. */
export const FullPageSheet = ({
  visible,
  accessibilityLabel,
  testID = LAYOUT_TEST_IDS.fullPageSheet,
  ...panel
}: FullPageSheetProps): React.ReactElement => {
  const { t } = useUi();
  const dialogRef = useRef<View>(null);

  useFocusTrap(dialogRef, visible, `${testID}-close`);
  useEscapeKey(visible, panel.onClose);
  useScrollLock(visible);

  const hardwareBackClose = Platform.OS === 'web' ? undefined : panel.onClose;

  return (
    <RNModal transparent visible={visible} onRequestClose={hardwareBackClose}>
      <View
        ref={dialogRef}
        accessibilityViewIsModal
        aria-modal
        aria-label={accessibilityLabel ?? t(LAYOUT_I18N.dialog)}
        role="dialog"
        style={styles.root}
        testID={`${testID}-dialog`}
      >
        {visible ? <FullPageSheetPanel testID={testID} {...panel} /> : null}
      </View>
    </RNModal>
  );
};
