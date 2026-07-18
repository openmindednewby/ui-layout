/**
 * ModalDropdown — generic dropdown selector (any value type via generics).
 *
 * Renders as either an inline anchored menu (web-native `<select>` feel) or a
 * modal / bottom-sheet, selectable per screen via the `variant` prop. When
 * `variant` is omitted the choice is **responsive**: inline menu on wide/desktop
 * web, modal on narrow/mobile (and always modal on native). Existing callers that
 * never passed `variant` therefore get the inline-on-desktop behaviour for free.
 *
 * Both variants share {@link OptionRow} for option rendering + selection.
 */
import React, { useCallback, useMemo, useRef, useState } from 'react';

import { FlatList, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useUi, MODAL_OVERLAY_COLOR } from '@dloizides/ui-feedback';

import { useFocusTrap } from '../hooks/useFocusTrap';
import { DropdownVariant } from './DropdownVariant';
import type { DropdownOption } from './dropdownTypes';
import { InlineMenu } from './InlineMenu';
import { buildAnchorStackStyle } from './menuStacking';
import { OptionRow } from './OptionRow';
import { useResolvedDropdownVariant } from './resolveDropdownVariant';

import { LAYOUT_I18N } from '../constants';

/** State handed to a custom trigger renderer. */
export interface DropdownTriggerState {
  /** The selected option's label (or the select placeholder when nothing matches). */
  label: string;
  /** Whether the menu is currently open. */
  isOpen: boolean;
}

export interface ModalDropdownProps<T> {
  testID: string;
  accessibilityLabel: string;
  accessibilityHint: string;
  value: T;
  options: ReadonlyArray<DropdownOption<T>>;
  onChange: (value: T) => void;
  /**
   * Force a rendering variant. When omitted the dropdown is **responsive**:
   * an inline anchored menu on wide/desktop web, a modal on narrow/mobile
   * (and always a modal on native). An explicit value overrides the auto choice.
   */
  variant?: DropdownVariant;
  /**
   * Custom ANCHOR content. When supplied, the caller owns the trigger's visuals
   * entirely (the default bordered field box is not rendered) — use it for compact
   * chips / avatars / icon triggers. The a11y wrapper (role=button, `aria-expanded`,
   * the label + hint, the testID) is still supplied by the dropdown, so a custom
   * trigger cannot drop the accessible contract. Omit for the default field look.
   */
  renderTrigger?: (state: DropdownTriggerState) => React.ReactNode;
  /**
   * Custom testID per option row. Defaults to `` `${testID}-option-${value}` ``.
   * Lets a caller keep a pre-existing selector stable when a flat control becomes
   * a dropdown.
   */
  optionTestID?: (value: T) => string;
  /**
   * Minimum width of the open inline menu. The menu otherwise matches the TRIGGER's width, which
   * is right for a full-width field but leaves a COMPACT anchor (a locale pill, an avatar chip, an
   * icon button — see `renderTrigger`) with a menu too narrow to read its own option labels. It is
   * a floor only: a wider trigger still wins. Omit to keep the trigger-width behaviour.
   */
  menuMinWidth?: number;
}

const IS_WEB = Platform.OS === 'web';

const BORDER_RADIUS = 8;
const BORDER_WIDTH = 1;
const BODY_FONT_SIZE = 14;
const MODAL_PADDING = 8;
const MODAL_MIN_WIDTH = 200;
const MODAL_MAX_HEIGHT = 300;
const CONTAINER_PADDING_H = 12;
const CONTAINER_PADDING_V = 10;
/** 1x1 clipped box: off-screen visually, still in the a11y tree (unlike display/visibility:none). */
const SR_ONLY_SIZE = 1;
const SR_ONLY_OFFSET = -1;

/**
 * Deliver the accessible hint on the platform's own terms.
 *
 * React Native consumes `accessibilityHint` natively. **react-native-web does not** — it silently
 * drops the prop (and older versions leaked it to the DOM as an unknown attribute, producing
 * `React does not recognize the accessibilityHint prop on a DOM element`). Either way the hint
 * never reached a screen reader, so every caller's carefully-written hint was thrown away. On web
 * we therefore point `aria-describedby` at a visually-hidden node carrying the text — the same
 * wiring `@dloizides/ui-forms`' `Field` uses for its error line — and do not pass the RN prop at
 * all, so nothing invalid can reach the DOM.
 */
function buildHintProps(
  hint: string,
  hintId: string,
): { accessibilityHint?: string; 'aria-describedby'?: string } {
  return IS_WEB ? { 'aria-describedby': hintId } : { accessibilityHint: hint };
}

const styles = StyleSheet.create({
  anchor: { position: 'relative' },
  srOnly: {
    position: 'absolute',
    width: SR_ONLY_SIZE,
    height: SR_ONLY_SIZE,
    margin: SR_ONLY_OFFSET,
    padding: 0,
    overflow: 'hidden',
  },
  container: {
    borderWidth: BORDER_WIDTH,
    borderRadius: BORDER_RADIUS,
    paddingHorizontal: CONTAINER_PADDING_H,
    paddingVertical: CONTAINER_PADDING_V,
  },
  selectedText: { fontSize: BODY_FONT_SIZE },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MODAL_OVERLAY_COLOR,
  },
  modalContent: {
    borderRadius: BORDER_RADIUS,
    padding: MODAL_PADDING,
    minWidth: MODAL_MIN_WIDTH,
    maxHeight: MODAL_MAX_HEIGHT,
  },
});

export const ModalDropdown = <T extends string | number>({
  testID,
  accessibilityLabel,
  accessibilityHint,
  value,
  options,
  onChange,
  variant,
  renderTrigger,
  optionTestID,
  menuMinWidth,
}: ModalDropdownProps<T>): React.ReactElement => {
  const { theme, t } = useUi();
  const { colors } = theme;
  const resolvedVariant = useResolvedDropdownVariant(variant);
  const isMenu = resolvedVariant === DropdownVariant.Menu;

  const [isOpen, setIsOpen] = useState(false);
  // Derived from the (required, caller-unique) testID, so the id is stable across renders and
  // readable in the DOM — no render-order-dependent counter needed.
  const hintId = `${testID}-hint`;
  const anchorRef = useRef<View>(null);
  const dialogRef = useRef<View>(null);
  useFocusTrap(dialogRef, isOpen && !isMenu);

  const selectedLabel = useMemo(() => {
    const found = options.find((opt) => opt.value === value);
    return found?.label ?? t(LAYOUT_I18N.selectPlaceholder);
  }, [options, value, t]);

  const handleToggle = useCallback(() => { setIsOpen((prev) => !prev); }, []);
  const handleClose = useCallback(() => { setIsOpen(false); }, []);

  const handleSelect = useCallback(
    (optionValue: T) => {
      onChange(optionValue);
      setIsOpen(false);
    },
    [onChange],
  );

  // A custom trigger owns its own visuals, so the default bordered field box stands down.
  const containerStyle = useMemo(
    () =>
      renderTrigger !== undefined
        ? undefined
        : [styles.container, { borderColor: colors.border, backgroundColor: colors.surface }],
    [colors.border, colors.surface, renderTrigger],
  );

  const optionTestIDFor = useCallback(
    (optionValue: T): string =>
      optionTestID !== undefined ? optionTestID(optionValue) : `${testID}-option-${String(optionValue)}`,
    [optionTestID, testID],
  );
  // While the inline menu is open, lift the anchor wrapper's stacking so it wins over immediate
  // sibling views (defence-in-depth behind the web portal; the primary lift on native).
  const anchorStyle = useMemo(
    () => [styles.anchor, buildAnchorStackStyle(isMenu && isOpen)],
    [isMenu, isOpen],
  );
  const modalContentStyle = useMemo(
    () => [styles.modalContent, { backgroundColor: colors.surface }],
    [colors.surface],
  );

  const renderModalOption = useCallback(
    ({ item }: { item: DropdownOption<T> }) => (
      <OptionRow
        isSelected={item.value === value}
        label={item.label}
        testID={optionTestIDFor(item.value)}
        onSelect={() => handleSelect(item.value)}
      />
    ),
    [handleSelect, optionTestIDFor, value],
  );
  const keyExtractor = useCallback((item: DropdownOption<T>) => String(item.value), []);

  return (
    <View ref={anchorRef} style={anchorStyle}>
      <TouchableOpacity
        accessible
        {...buildHintProps(accessibilityHint, hintId)}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        aria-expanded={isOpen}
        style={containerStyle}
        testID={testID}
        onPress={handleToggle}
      >
        {renderTrigger !== undefined ? (
          renderTrigger({ label: selectedLabel, isOpen })
        ) : (
          <Text style={[styles.selectedText, { color: colors.text }]}>{selectedLabel}</Text>
        )}
      </TouchableOpacity>

      {/* The hint text itself — referenced by the trigger's `aria-describedby`, announced after the
          label, and never painted. Web only: native reads `accessibilityHint` off the trigger. */}
      {IS_WEB ? (
        <Text nativeID={hintId} style={styles.srOnly} testID={`${testID}-hint`}>
          {accessibilityHint}
        </Text>
      ) : null}

      {isMenu && isOpen ? (
        <InlineMenu
          accessibilityLabel={accessibilityLabel}
          containerRef={anchorRef}
          menuMinWidth={menuMinWidth}
          optionTestID={optionTestIDFor}
          options={options}
          testID={testID}
          value={value}
          onClose={handleClose}
          onSelect={handleSelect}
        />
      ) : null}

      {!isMenu ? (
        <Modal transparent animationType="fade" visible={isOpen} onRequestClose={handleClose}>
          {/* The dismiss backdrop is a SIBLING behind the dialog, not its parent — a wrapping
              pressable would nest the option buttons inside a button (invalid DOM: "<button>
              cannot contain a nested <button>"). Absolute-fill catches taps outside the dialog. */}
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              accessible
              accessibilityHint={t(LAYOUT_I18N.dismissDropdownHint)}
              accessibilityLabel={t(LAYOUT_I18N.dismissDropdown)}
              accessibilityRole="button"
              activeOpacity={1}
              style={StyleSheet.absoluteFill}
              testID={`${testID}-backdrop`}
              onPress={handleClose}
            />
            <View
              ref={dialogRef}
              accessibilityViewIsModal
              aria-label={accessibilityLabel}
              role="dialog"
              style={modalContentStyle}
            >
              <FlatList data={[...options]} keyExtractor={keyExtractor} renderItem={renderModalOption} />
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
};

export default ModalDropdown;
