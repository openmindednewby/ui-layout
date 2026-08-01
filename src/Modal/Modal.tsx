/**
 * Modal — a themed, CENTERED dialog overlay for RN + RN-web.
 *
 * Distinct from this package's {@link import('../ModalShell/ModalShell').ModalShell}, which is a
 * full-screen slide-up sheet. `Modal` is the floating card an app opens over the current screen:
 * a scrim, a rounded surface, an optional header (title + a top-right ✕ close), a scrollable body,
 * and an optional footer (action buttons). It is the shared shell {@link ConfirmDialog} is built on,
 * and the replacement for per-app dialogs like kefi-web's `PromoterActionModal`.
 *
 * DISMISSAL — four routes, all funnel to `onClose`:
 *   - the top-right ✕ button (web tooltip + aria-label "Close"; a 44dp `IconButton` target),
 *   - a press on the backdrop scrim (a SIBLING of the dialog, so option/action buttons are never
 *     nested inside a button — invalid DOM),
 *   - Escape on web (via {@link useEscapeKey}),
 *   - the hardware back button on native (RN `Modal`'s `onRequestClose`).
 *
 * ACCESSIBILITY: the dialog carries `role="dialog"` + `aria-modal` (via `accessibilityViewIsModal`)
 * and an accessible name (`accessibilityLabel` → `title` → the neutral "dialog" key). Focus is
 * trapped within the dialog on web ({@link useFocusTrap}) and restored to the opener on close, and
 * page scroll behind the dialog is locked ({@link useScrollLock}).
 *
 * Every colour is read from the app's theme via `useUi()` — no raw literals.
 */
import React, { useMemo, useRef } from 'react';

import { Animated, Modal as RNModal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { IconButton } from '@dloizides/ui-buttons';
import { MODAL_OVERLAY_COLOR, useUi } from '@dloizides/ui-feedback';
import { SvgIcon } from '@dloizides/ui-icons';
import { useEnterExit } from '@dloizides/ui-motion';

import { Heading } from '../Heading/Heading';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useScrollLock } from '../hooks/useScrollLock';
import { LAYOUT_I18N, LAYOUT_TEST_IDS } from '../constants';
import type { ModalSize } from './ModalSize';

const OVERLAY_PADDING = 16;
const DIALOG_RADIUS = 12;
const DIALOG_PADDING = 16;
const HEADER_GAP = 12;
const FOOTER_MARGIN = 16;
const HEADER_MARGIN = 12;
/** The dialog never grows past most of the viewport height; its body scrolls instead. */
const DIALOG_MAX_HEIGHT = '90%';
/** The panel enters scaled slightly down (and fades in), settling to its natural size. */
const PANEL_ENTER_SCALE = 0.96;

/** Max width per size preset. A floor-less card otherwise stretches to the full viewport on web. */
const SIZE_MAX_WIDTH: Record<ModalSize, number> = { sm: 360, md: 480, lg: 640 };

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: OVERLAY_PADDING,
  },
  // The scrim is its OWN animated layer (behind the tap-catcher and the panel) so its opacity
  // can fade independently of the panel's fade+scale. `animationType` is a native-only no-op on
  // react-native-web, which is why the fade is driven by `Animated` instead. `pointerEvents` lives
  // in style (not the deprecated prop) so taps fall through to the sibling tap-catcher below.
  scrim: { backgroundColor: MODAL_OVERLAY_COLOR, pointerEvents: 'none' },
  dialog: {
    width: '100%',
    borderRadius: DIALOG_RADIUS,
    padding: DIALOG_PADDING,
    maxHeight: DIALOG_MAX_HEIGHT,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    columnGap: HEADER_GAP,
    marginBottom: HEADER_MARGIN,
  },
  // Occupies the header's leading space so the ✕ pins to the trailing edge even without a title.
  titleWrap: { flex: 1 },
  footer: { marginTop: FOOTER_MARGIN },
});

export interface ModalProps {
  /** Whether the dialog is mounted + shown. */
  visible: boolean;
  /** Called by every dismissal route: ✕, backdrop, Escape (web), hardware back (native). */
  onClose: () => void;
  /** Header title. Omit for a chromeless dialog (the ✕ still shows unless `showClose` is false). */
  title?: string;
  /** Dialog body. Rendered inside a scroll view so long content scrolls within the dialog. */
  children?: React.ReactNode;
  /** Optional footer, typically an action-button row (see {@link ConfirmDialog}). */
  footer?: React.ReactNode;
  /** Max-width preset. Default `md`. */
  size?: ModalSize;
  /**
   * Show the top-right ✕ close button. Default `true`. `ConfirmDialog` sets it `false` — it offers
   * an explicit Cancel, and hiding the ✕ lets the web focus trap land on the SAFE Cancel action.
   */
  showClose?: boolean;
  /** Base testID. Default `modal`. The ✕ is `${testID}-close`, the backdrop `${testID}-backdrop`. */
  testID?: string;
  /** Accessible name of the dialog. Falls back to `title`, then the neutral "dialog" key. */
  accessibilityLabel?: string;
}

export const Modal = ({
  visible,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  showClose = true,
  testID = LAYOUT_TEST_IDS.modal,
  accessibilityLabel,
}: ModalProps): React.ReactElement => {
  const { theme, t } = useUi();
  const dialogRef = useRef<View>(null);

  // Backdrop fades opacity only; the panel fades AND scales in from 0.96. Both share `visible`,
  // so they enter/exit in lock-step. `panel.mounted` keeps the whole RN `Modal` host (and thus
  // the backdrop) in the tree through the exit fade — RN `Modal` unmounting on `visible=false`
  // is exactly what makes the native-only `animationType` snap on web, so we drive it ourselves.
  const backdrop = useEnterExit({ visible });
  const panel = useEnterExit({ visible, fromScale: PANEL_ENTER_SCALE });
  const mounted = panel.mounted || backdrop.mounted;

  useFocusTrap(dialogRef, visible);
  useEscapeKey(visible, onClose);
  useScrollLock(visible);

  const accessibleName = accessibilityLabel ?? title ?? t(LAYOUT_I18N.dialog);
  const closeLabel = t(LAYOUT_I18N.dialogClose);

  const dialogStyle = useMemo(
    () => [styles.dialog, { backgroundColor: theme.colors.surface, maxWidth: SIZE_MAX_WIDTH[size] }],
    [theme.colors.surface, size],
  );

  const hasHeader = title !== undefined || showClose;

  return (
    <RNModal transparent visible={mounted} onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Animated scrim layer — fades independently, behind the tap-catcher and the panel. */}
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.scrim, { opacity: backdrop.style.opacity }]}
        />
        {/* Backdrop is a SIBLING behind the dialog, not its parent: a wrapping pressable would nest
            the footer's action buttons inside a button (invalid DOM). Absolute-fill catches taps
            outside the dialog surface. */}
        <TouchableOpacity
          accessible
          accessibilityHint={t(LAYOUT_I18N.dismissDropdownHint)}
          accessibilityLabel={t(LAYOUT_I18N.dismissDropdown)}
          accessibilityRole="button"
          activeOpacity={1}
          style={StyleSheet.absoluteFill}
          testID={`${testID}-backdrop`}
          onPress={onClose}
        />
        <Animated.View
          ref={dialogRef}
          accessibilityViewIsModal
          aria-label={accessibleName}
          role="dialog"
          style={[dialogStyle, panel.style]}
          testID={testID}
        >
          {hasHeader ? (
            <View style={styles.headerRow}>
              <View style={styles.titleWrap}>
                {title !== undefined ? <Heading>{title}</Heading> : null}
              </View>
              {showClose ? (
                <IconButton
                  accessibilityHint={t(LAYOUT_I18N.closeDialogHint)}
                  accessibilityLabel={closeLabel}
                  appearance="ghost"
                  renderIcon={(color, iconSize) => <SvgIcon color={color} name="close" size={iconSize} />}
                  size="md"
                  testID={`${testID}-close`}
                  tooltip={closeLabel}
                  variant="ghost"
                  onPress={onClose}
                />
              ) : null}
            </View>
          ) : null}

          <ScrollView>{children}</ScrollView>

          {footer !== undefined ? <View style={styles.footer}>{footer}</View> : null}
        </Animated.View>
      </View>
    </RNModal>
  );
};

export default Modal;
