import React, { useRef } from 'react';

import { Animated, Platform, Modal as RNModal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { MODAL_OVERLAY_COLOR, useUi } from '@dloizides/ui-feedback';
import { useEnterExit } from '@dloizides/ui-motion';

import { AppText } from '../AppText/AppText';
import { TextKind } from '../AppText/TextKind';
import { LAYOUT_I18N, LAYOUT_TEST_IDS, MIN_TARGET_PX } from '../constants';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useIsWideViewport } from '../hooks/useIsWideViewport';
import { useScrollLock } from '../hooks/useScrollLock';

const SHEET_WIDTH = 560;
const PHONE_CORNER = 16;
const PHONE_ENTER_OFFSET = 24;

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrim: { backgroundColor: MODAL_OVERLAY_COLOR, pointerEvents: 'none' },
  sheet: { position: 'absolute', bottom: 0, overflow: 'hidden' },
  wide: { top: 0, right: 0, width: SHEET_WIDTH, maxWidth: '100%', borderLeftWidth: 1 },
  phone: {
    top: MIN_TARGET_PX,
    left: 0,
    right: 0,
    borderTopLeftRadius: PHONE_CORNER,
    borderTopRightRadius: PHONE_CORNER,
  },
  title: { paddingHorizontal: 16, paddingTop: 16 },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 12 },
  bar: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, padding: 16, borderTopWidth: 1 },
});

export interface SideSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  testID?: string;
  accessibilityLabel?: string;
  initialFocusTestID?: string;
}

/** A panel over the screen: from the bottom on a phone, from the right on a computer. */
export const SideSheet = ({
  visible,
  onClose,
  title,
  children,
  footer,
  testID = LAYOUT_TEST_IDS.sideSheet,
  accessibilityLabel,
  initialFocusTestID,
}: SideSheetProps): React.ReactElement => {
  const { theme, t } = useUi();
  const isWide = useIsWideViewport();
  const sheetRef = useRef<View>(null);
  const backdrop = useEnterExit({ visible });
  const panel = useEnterExit({ visible, translateY: isWide ? 0 : PHONE_ENTER_OFFSET });
  const edges = { borderColor: theme.colors.border };

  useFocusTrap(sheetRef, visible && panel.mounted, initialFocusTestID);
  useEscapeKey(visible, onClose);
  useScrollLock(visible);

  const hardwareBackClose = Platform.OS === 'web' ? undefined : onClose;

  return (
    <RNModal transparent visible={panel.mounted || backdrop.mounted} onRequestClose={hardwareBackClose}>
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.scrim, { opacity: backdrop.style.opacity }]} />
        <Pressable
          accessibilityHint={t(LAYOUT_I18N.closeDialogHint)}
          accessibilityLabel={t(LAYOUT_I18N.dialogClose)}
          accessibilityRole="button"
          style={StyleSheet.absoluteFill}
          testID={`${testID}-scrim`}
          onPress={onClose}
        />
        <Animated.View
          ref={sheetRef}
          accessibilityViewIsModal
          aria-modal
          aria-label={accessibilityLabel ?? title}
          role="dialog"
          style={[
            styles.sheet,
            isWide ? styles.wide : styles.phone,
            edges,
            { backgroundColor: theme.colors.surface },
            panel.style,
          ]}
          testID={testID}
        >
          <View style={styles.title}>
            <AppText kind={TextKind.Title}>{title}</AppText>
          </View>
          <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
            {children}
          </ScrollView>
          <View style={[styles.bar, edges]}>{footer}</View>
        </Animated.View>
      </View>
    </RNModal>
  );
};
