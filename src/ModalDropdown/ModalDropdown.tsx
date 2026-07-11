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

import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useUi, MODAL_OVERLAY_COLOR } from '@dloizides/ui-feedback';

import { useFocusTrap } from '../hooks/useFocusTrap';
import { DropdownVariant } from './DropdownVariant';
import type { DropdownOption } from './dropdownTypes';
import { InlineMenu } from './InlineMenu';
import { OptionRow } from './OptionRow';
import { useResolvedDropdownVariant } from './resolveDropdownVariant';

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
}

const BORDER_RADIUS = 8;
const BORDER_WIDTH = 1;
const BODY_FONT_SIZE = 14;
const MODAL_PADDING = 8;
const MODAL_MIN_WIDTH = 200;
const MODAL_MAX_HEIGHT = 300;
const CONTAINER_PADDING_H = 12;
const CONTAINER_PADDING_V = 10;

const styles = StyleSheet.create({
  anchor: { position: 'relative' },
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
}: ModalDropdownProps<T>): React.ReactElement => {
  const { theme, t } = useUi();
  const { colors } = theme;
  const resolvedVariant = useResolvedDropdownVariant(variant);
  const isMenu = resolvedVariant === DropdownVariant.Menu;

  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<View>(null);
  const dialogRef = useRef<View>(null);
  useFocusTrap(dialogRef, isOpen && !isMenu);

  const selectedLabel = useMemo(() => {
    const found = options.find((opt) => opt.value === value);
    return found?.label ?? t('common.selectPlaceholder');
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

  const containerStyle = useMemo(
    () => [styles.container, { borderColor: colors.border, backgroundColor: colors.surface }],
    [colors.border, colors.surface],
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
        testID={`${testID}-option-${String(item.value)}`}
        onSelect={() => handleSelect(item.value)}
      />
    ),
    [handleSelect, testID, value],
  );
  const keyExtractor = useCallback((item: DropdownOption<T>) => String(item.value), []);

  return (
    <View ref={anchorRef} style={styles.anchor}>
      <TouchableOpacity
        accessible
        accessibilityHint={accessibilityHint}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        aria-expanded={isOpen}
        style={containerStyle}
        testID={testID}
        onPress={handleToggle}
      >
        <Text style={[styles.selectedText, { color: colors.text }]}>{selectedLabel}</Text>
      </TouchableOpacity>

      {isMenu && isOpen ? (
        <InlineMenu
          accessibilityLabel={accessibilityLabel}
          containerRef={anchorRef}
          options={options}
          testID={testID}
          value={value}
          onClose={handleClose}
          onSelect={handleSelect}
        />
      ) : null}

      {!isMenu ? (
        <Modal transparent animationType="fade" visible={isOpen} onRequestClose={handleClose}>
          <TouchableOpacity
            accessible
            accessibilityHint={t('common.dismissDropdownHint')}
            accessibilityLabel={t('common.dismissDropdown')}
            accessibilityRole="button"
            activeOpacity={1}
            style={styles.modalOverlay}
            testID={`${testID}-backdrop`}
            onPress={handleClose}
          >
            <View
              ref={dialogRef}
              accessibilityViewIsModal
              aria-label={accessibilityLabel}
              role="dialog"
              style={modalContentStyle}
            >
              <FlatList data={[...options]} keyExtractor={keyExtractor} renderItem={renderModalOption} />
            </View>
          </TouchableOpacity>
        </Modal>
      ) : null}
    </View>
  );
};

export default ModalDropdown;
