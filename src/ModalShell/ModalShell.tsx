/**
 * ModalShell — a slide-up full-screen modal with a themed header (title + close button)
 * and a scrollable body. Composes Heading (this package) + SvgIcon (@dloizides/ui-icons).
 */
import React from 'react';

import { Modal, ScrollView, StyleSheet, TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';
import { SvgIcon } from '@dloizides/ui-icons';

import { Heading } from '../Heading/Heading';
import { LAYOUT_TEST_IDS } from '../constants';

const CLOSE_ICON_SIZE = 18;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    padding: 6,
    borderRadius: 6,
  },
});

export interface ModalShellProps {
  visible: boolean;
  onCancel: () => void;
  title?: string | React.ReactNode;
  children?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  showClose?: boolean;
}

export const ModalShell = ({
  visible,
  onCancel,
  title,
  children,
  contentStyle,
  showClose = true,
}: ModalShellProps): React.ReactElement => {
  const { theme, t } = useUi();

  const containerStyle = React.useMemo(
    () => [styles.container, { backgroundColor: theme.colors.background }, contentStyle],
    [theme.colors.background, contentStyle],
  );
  const closeA11yLabel = t('quizTemplates.cancel');
  const accessibleTitle = typeof title === 'string' ? title : t('common.dialog');

  return (
    <Modal
      animationType="slide"
      testID={LAYOUT_TEST_IDS.modalShell}
      visible={visible}
      onRequestClose={onCancel}
    >
      <ScrollView
        accessibilityViewIsModal
        aria-label={accessibleTitle}
        role="dialog"
        style={containerStyle}
      >
        <View style={styles.headerRow}>
          <Heading>{title ?? t('close')}</Heading>
          {showClose ? (
            <TouchableOpacity
              accessibilityHint={t('common.closeDialogHint')}
              accessibilityLabel={closeA11yLabel}
              accessibilityRole="button"
              style={styles.closeButton}
              testID={LAYOUT_TEST_IDS.modalShellClose}
              onPress={onCancel}
            >
              <SvgIcon color={theme.colors.textSecondary} name="close" size={CLOSE_ICON_SIZE} />
            </TouchableOpacity>
          ) : null}
        </View>

        {children}
      </ScrollView>
    </Modal>
  );
};

export default ModalShell;
