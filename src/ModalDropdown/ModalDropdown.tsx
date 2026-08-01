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

import { Animated, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useA11y, MIN_TOUCH_TARGET_PX } from '@dloizides/a11y';
import { useUi, MODAL_OVERLAY_COLOR } from '@dloizides/ui-feedback';
import { useEnterExit } from '@dloizides/ui-motion';

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
  /**
   * Show a MENU affordance on the DEFAULT trigger: a caret (▾) pinned to the trailing edge that
   * rotates to point up while the menu is open, and a ≥44dp hit target. Opt-in and OFF by default,
   * so every existing field-style dropdown in the kit renders unchanged; a control that must read
   * as a tappable menu rather than a static chip (the collapsed {@link import('../Tabs/Tabs').Tabs}
   * section switcher) sets it. Ignored when a custom `renderTrigger` is supplied — that caller owns
   * its own visuals, affordance included.
   */
  showCaret?: boolean;
  /**
   * Present the DEFAULT trigger as a HAMBURGER (☰) menu: the universal mobile-nav glyph LEADING the
   * active option's label, with the same bordered field box and ≥44dp hit target. Opt-in and OFF by
   * default. When set it takes precedence over `showCaret` (a hamburger already IS the "this is a
   * menu" cue, so the trailing caret is redundant), and — like `showCaret` — it is ignored when a
   * custom `renderTrigger` is supplied. The glyph is a font character (U+2630), so no icon package
   * enters this contract-pure kit, and it is decorative: the trigger's `aria-label` names the
   * control, so screen readers do not announce it.
   */
  showHamburger?: boolean;
}

const BORDER_RADIUS = 8;
const BORDER_WIDTH = 1;
const BODY_FONT_SIZE = 14;
const MODAL_PADDING = 8;
const MODAL_MIN_WIDTH = 200;
const MODAL_MAX_HEIGHT = 300;
const CONTAINER_PADDING_H = 12;
const CONTAINER_PADDING_V = 10;
/** WCAG 2.5.5 minimum target size — the caret trigger must be comfortably tappable on a phone. */
const MIN_TOUCH_TARGET = 44;
const CARET_FONT_SIZE = 12;
/** Gap between the label and the trailing caret (also the gap after the leading hamburger). */
const CARET_GAP = 8;
/** ▾ (U+25BE) — a font glyph, so no icon package is imported into this contract-pure kit. */
const CARET_GLYPH = '▾';
/** ☰ (U+2630) — the hamburger menu glyph, likewise a font character (no icon package). */
const HAMBURGER_GLYPH = '☰';
/** The hamburger reads as an icon, so it sits a touch larger than the body label. */
const HAMBURGER_FONT_SIZE = 18;
/** Caret points up while the menu is open, down while closed. */
const CARET_OPEN_ROTATION = '180deg';
const CARET_CLOSED_ROTATION = '0deg';
/** The open popover fades + scales in from just under its natural size (subtle, anchor-origin). */
const POPOVER_ENTER_SCALE = 0.96;
/** A snappy popover duration — the open eases in, the close reads as near-instant. */
const POPOVER_MOTION_MS = 120;

/*
 * The hint used to be threaded by a private `buildHintProps` helper plus a hand-rolled
 * `srOnly` visually-hidden <Text>, both living in this file. That was a verbatim
 * reimplementation of `@dloizides/a11y`'s `useA11y` + `A11yHint` — same platform branch,
 * same 1x1-clip technique, same `aria-describedby` wiring — so it was a second place for
 * the SAME bug to regress, with none of that package's dual-platform test gate behind it.
 * It now delegates. See `useA11y` in the render below.
 */

const styles = StyleSheet.create({
  anchor: { position: 'relative' },
  container: {
    borderWidth: BORDER_WIDTH,
    borderRadius: BORDER_RADIUS,
    paddingHorizontal: CONTAINER_PADDING_H,
    paddingVertical: CONTAINER_PADDING_V,
    // Match the shared control height used by @dloizides/ui-forms inputs (same MIN_TOUCH_TARGET_PX
    // floor from @dloizides/a11y), so a select trigger and a text/typeahead field sitting side by
    // side in a filter bar are exactly the same height. Centre the label within that floor.
    minHeight: MIN_TOUCH_TARGET_PX,
    justifyContent: 'center',
  },
  // Caret variant: a row with the label leading and the caret pinned to the trailing edge, at a
  // phone-friendly minimum height. Only applied when `showCaret` is set, so field dropdowns are
  // untouched.
  containerMenu: {
    minHeight: MIN_TOUCH_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: CARET_GAP,
  },
  // Hamburger variant: the ☰ glyph LEADS the label (icon-first, like a phone nav button), so the
  // row packs to the start rather than pushing a trailing caret to the far edge. Same tap target.
  containerHamburger: {
    minHeight: MIN_TOUCH_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    columnGap: CARET_GAP,
  },
  selectedText: { fontSize: BODY_FONT_SIZE },
  // The label may shrink/ellipsize; the caret / hamburger glyph never does.
  selectedTextMenu: { flexShrink: 1 },
  caret: { fontSize: CARET_FONT_SIZE, flexShrink: 0 },
  hamburger: { fontSize: HAMBURGER_FONT_SIZE, flexShrink: 0 },
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
  showCaret = false,
  showHamburger = false,
}: ModalDropdownProps<T>): React.ReactElement => {
  const { theme, t } = useUi();
  const { colors } = theme;
  const resolvedVariant = useResolvedDropdownVariant(variant);
  const isMenu = resolvedVariant === DropdownVariant.Menu;

  const [isOpen, setIsOpen] = useState(false);
  /*
   * The trigger's accessible contract, emitted per-platform by the shared adapter:
   * `aria-label`/`aria-describedby`/`role`/`aria-expanded` on web, the `accessibility*`
   * props on native. `hintNode` is the visually-hidden description element — `null` on
   * native, where the hint is a first-class prop — and MUST be rendered inside the same
   * host component, which is why it sits among the trigger's children below.
   *
   * The hint id is no longer derived from `testID`: `useA11y` generates it from React's
   * `useId()`, which stays unique even if two dropdowns are ever handed the same testID.
   */
  const { a11yProps, hintNode } = useA11y({
    label: accessibilityLabel,
    hint: accessibilityHint,
    role: 'button',
    state: { expanded: isOpen },
    testID,
  });
  const anchorRef = useRef<View>(null);
  const dialogRef = useRef<View>(null);
  useFocusTrap(dialogRef, isOpen && !isMenu);

  // The popover (inline menu on web-desktop, centered modal on mobile/native) fades + scales in
  // on open and reverses on close. `mounted` keeps the node in the tree through the exit fade —
  // without it the popover would snap out (the RN `Modal` `animationType` is a no-op on web).
  // Under reduced-motion the enter/exit collapse to instant, so the close reads as immediate.
  const menuAnim = useEnterExit({
    visible: isMenu && isOpen,
    fromScale: POPOVER_ENTER_SCALE,
    duration: POPOVER_MOTION_MS,
  });
  const modalAnim = useEnterExit({
    visible: !isMenu && isOpen,
    fromScale: POPOVER_ENTER_SCALE,
    duration: POPOVER_MOTION_MS,
  });

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

  // The hamburger is the stronger affordance, so it wins when both are set: a ☰ trigger has no
  // reason to also carry a trailing caret.
  const isHamburger = showHamburger;
  const isCaret = showCaret && !isHamburger;

  // A custom trigger owns its own visuals, so the default bordered field box stands down. Otherwise
  // the bordered field box renders, gaining the menu row layout + ≥44dp tap target when either the
  // caret or the hamburger affordance is on.
  const containerStyle = useMemo(
    () =>
      renderTrigger !== undefined
        ? undefined
        : [
            styles.container,
            isHamburger ? styles.containerHamburger : isCaret ? styles.containerMenu : null,
            { borderColor: colors.border, backgroundColor: colors.surface },
          ],
    [colors.border, colors.surface, renderTrigger, isHamburger, isCaret],
  );
  const hamburgerStyle = useMemo(
    () => [styles.hamburger, { color: colors.textSecondary }],
    [colors.textSecondary],
  );
  const caretStyle = useMemo(
    () => [
      styles.caret,
      { color: colors.textSecondary, transform: [{ rotate: isOpen ? CARET_OPEN_ROTATION : CARET_CLOSED_ROTATION }] },
    ],
    [colors.textSecondary, isOpen],
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
      <TouchableOpacity {...a11yProps} style={containerStyle} onPress={handleToggle}>
        {renderTrigger !== undefined ? (
          renderTrigger({ label: selectedLabel, isOpen })
        ) : isHamburger ? (
          <>
            {/* Decorative LEADING glyph: the trigger's aria-label already names the control, so
                screen readers ignore it. It is the universal "open the menu" cue on mobile. */}
            <Text style={hamburgerStyle}>{HAMBURGER_GLYPH}</Text>
            <Text numberOfLines={1} style={[styles.selectedText, styles.selectedTextMenu, { color: colors.text }]}>
              {selectedLabel}
            </Text>
          </>
        ) : isCaret ? (
          <>
            <Text numberOfLines={1} style={[styles.selectedText, styles.selectedTextMenu, { color: colors.text }]}>
              {selectedLabel}
            </Text>
            {/* Decorative: the trigger's aria-label already names the control, so screen readers
                ignore this glyph. It exists to make the control read as a menu, not a chip. */}
            <Text style={caretStyle}>{CARET_GLYPH}</Text>
          </>
        ) : (
          <Text style={[styles.selectedText, { color: colors.text }]}>{selectedLabel}</Text>
        )}
        {/* The hidden description node the trigger's `aria-describedby` points at. A DESCENDANT
            rather than a sibling, so it cannot outlive the trigger and leave the attribute
            dangling. `null` on native, where the hint is a first-class prop. */}
        {hintNode}
      </TouchableOpacity>

      {isMenu && menuAnim.mounted ? (
        <InlineMenu
          accessibilityLabel={accessibilityLabel}
          animatedStyle={menuAnim.style}
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
        <Modal transparent visible={modalAnim.mounted} onRequestClose={handleClose}>
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
            <Animated.View
              ref={dialogRef}
              accessibilityViewIsModal
              aria-label={accessibilityLabel}
              role="dialog"
              style={[modalContentStyle, modalAnim.style]}
            >
              <FlatList data={[...options]} keyExtractor={keyExtractor} renderItem={renderModalOption} />
            </Animated.View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
};

export default ModalDropdown;
