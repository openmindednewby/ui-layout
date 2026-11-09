import React, { useRef } from 'react';

import { Animated, Platform, Modal as RNModal, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { MIN_TOUCH_TARGET_PX } from '@dloizides/a11y';
import { MODAL_OVERLAY_COLOR, useUi } from '@dloizides/ui-feedback';
import { SvgIcon } from '@dloizides/ui-icons';
import { useEnterExit } from '@dloizides/ui-motion';

import { AppText } from '../AppText/AppText';
import { TextKind } from '../AppText/TextKind';
import { LAYOUT_I18N, LAYOUT_TEST_IDS } from '../constants';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useIsWideViewport } from '../hooks/useIsWideViewport';
import { useScrollLock } from '../hooks/useScrollLock';

const DEFAULT_MAX_HEIGHT_FRACTION = 0.92;
const PERCENT = 100;
const WIDE_MAX_WIDTH = 560;
const TOP_CORNER = 16;
const ENTER_OFFSET = 24;
const CLOSE_ICON_SIZE = 18;

const styles = StyleSheet.create({
  root: { flex: 1 },
  backdrop: { backgroundColor: MODAL_OVERLAY_COLOR, pointerEvents: 'none' },
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    borderTopLeftRadius: TOP_CORNER,
    borderTopRightRadius: TOP_CORNER,
  },
  wide: { maxWidth: WIDE_MAX_WIDTH, marginHorizontal: 'auto' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 16, paddingRight: 8, paddingTop: 8 },
  title: { flex: 1 },
  close: { minWidth: MIN_TOUCH_TARGET_PX, minHeight: MIN_TOUCH_TARGET_PX, alignItems: 'center', justifyContent: 'center' },
  body: { flexGrow: 0, flexShrink: 1 },
  content: { padding: 16, gap: 12 },
  footer: { padding: 16, borderTopWidth: 1 },
});

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxHeightFraction?: number;
  testID?: string;
  accessibilityLabel?: string;
  initialFocusTestID?: string;
}

/** A content-height panel docked to the screen bottom, with a dimmed backdrop and an optional pinned footer. */
export const BottomSheet = ({
  visible,
  onClose,
  title,
  children,
  footer,
  maxHeightFraction = DEFAULT_MAX_HEIGHT_FRACTION,
  testID = LAYOUT_TEST_IDS.bottomSheet,
  accessibilityLabel,
  initialFocusTestID,
}: BottomSheetProps): React.ReactElement => {
  const { theme, t } = useUi();
  const isWide = useIsWideViewport();
  const panelRef = useRef<View>(null);
  const backdrop = useEnterExit({ visible });
  const panel = useEnterExit({ visible, translateY: ENTER_OFFSET });
  const hasFooter = footer !== undefined && footer !== null;
  const panelSize = { maxHeight: `${maxHeightFraction * PERCENT}%` as const };

  useFocusTrap(panelRef, visible && panel.mounted, initialFocusTestID);
  useEscapeKey(visible, onClose);
  useScrollLock(visible);

  const hardwareBackClose = Platform.OS === 'web' ? undefined : onClose;

  return (
    <RNModal transparent visible={panel.mounted || backdrop.mounted} onRequestClose={hardwareBackClose}>
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: backdrop.style.opacity }]} />
        <Pressable
          accessibilityHint={t(LAYOUT_I18N.closeDialogHint)}
          accessibilityLabel={t(LAYOUT_I18N.dialogClose)}
          accessibilityRole="button"
          style={StyleSheet.absoluteFill}
          testID={`${testID}-backdrop`}
          onPress={onClose}
        />
        <Animated.View
          ref={panelRef}
          accessibilityViewIsModal
          aria-modal
          aria-label={accessibilityLabel ?? title}
          role="dialog"
          style={[
            styles.panel,
            isWide ? styles.wide : null,
            panelSize,
            { backgroundColor: theme.colors.surface },
            panel.style,
          ]}
          testID={testID}
        >
          <View style={styles.header}>
            <View style={styles.title}>
              <AppText kind={TextKind.Title}>{title}</AppText>
            </View>
            <TouchableOpacity
              accessibilityHint={t(LAYOUT_I18N.closeDialogHint)}
              accessibilityLabel={t(LAYOUT_I18N.dialogClose)}
              accessibilityRole="button"
              style={styles.close}
              testID={`${testID}-close`}
              onPress={onClose}
            >
              <SvgIcon color={theme.colors.textSecondary} name="close" size={CLOSE_ICON_SIZE} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.content} style={styles.body}>
            {children}
          </ScrollView>
          {hasFooter ? (
            <View style={[styles.footer, { borderColor: theme.colors.border }]} testID={`${testID}-footer`}>
              {footer}
            </View>
          ) : null}
        </Animated.View>
      </View>
    </RNModal>
  );
};
