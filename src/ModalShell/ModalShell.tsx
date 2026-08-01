/**
 * ModalShell — a slide-up full-screen modal with a themed header (title + close button)
 * and a scrollable body. Composes Heading (this package) + SvgIcon (@dloizides/ui-icons).
 */
import React from 'react';

import { Animated, Modal, ScrollView, StyleSheet, TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';
import { SvgIcon } from '@dloizides/ui-icons';
import { useEnterExit } from '@dloizides/ui-motion';

import { Heading } from '../Heading/Heading';
import { LAYOUT_I18N, LAYOUT_TEST_IDS } from '../constants';

const CLOSE_ICON_SIZE = 18;
/** The sheet enters scaled slightly down (and fades in), settling to its natural size. */
const PANEL_ENTER_SCALE = 0.96;

const styles = StyleSheet.create({
  animatedFill: { flex: 1 },
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

  // The sheet fades + scales in on open and reverses on close; `mounted` keeps the RN `Modal`
  // host in the tree through the exit fade, replacing the native-only `animationType="slide"`
  // (a no-op on react-native-web, where the sheet used to snap).
  const { style: sheetStyle, mounted } = useEnterExit({ visible, fromScale: PANEL_ENTER_SCALE });

  const containerStyle = React.useMemo(
    () => [styles.container, { backgroundColor: theme.colors.background }, contentStyle],
    [theme.colors.background, contentStyle],
  );
  const closeA11yLabel = t(LAYOUT_I18N.close);
  const accessibleTitle = typeof title === 'string' ? title : t(LAYOUT_I18N.dialog);

  return (
    <Modal
      transparent
      testID={LAYOUT_TEST_IDS.modalShell}
      visible={mounted}
      onRequestClose={onCancel}
    >
      <Animated.View style={[styles.animatedFill, sheetStyle]}>
        <ScrollView
          accessibilityViewIsModal
          aria-label={accessibleTitle}
          role="dialog"
          style={containerStyle}
        >
        <View style={styles.headerRow}>
          <Heading>{title ?? t(LAYOUT_I18N.closeHeading)}</Heading>
          {showClose ? (
            <TouchableOpacity
              accessibilityHint={t(LAYOUT_I18N.closeDialogHint)}
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
      </Animated.View>
    </Modal>
  );
};

export default ModalShell;
