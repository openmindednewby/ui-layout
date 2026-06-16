/**
 * ModalDropdown — generic modal-based dropdown selector (any value type via generics).
 * Shows the selected label inline; opens a modal FlatList on press, with web focus-trap.
 */
import React, { useCallback, useMemo, useRef, useState } from 'react';

import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useUi, MODAL_OVERLAY_COLOR } from '@dloizides/ui-feedback';

import { useFocusTrap } from '../hooks/useFocusTrap';

const BORDER_RADIUS = 8;
const BORDER_WIDTH = 1;
const OPTION_BORDER_RADIUS = 4;
const BODY_FONT_SIZE = 14;
const SELECTED_FONT_WEIGHT = '600' as const;
const MODAL_PADDING = 8;
const MODAL_MIN_WIDTH = 200;
const MODAL_MAX_HEIGHT = 300;
const CONTAINER_PADDING_H = 12;
const CONTAINER_PADDING_V = 10;

const styles = StyleSheet.create({
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
  option: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: OPTION_BORDER_RADIUS,
  },
  optionText: { fontSize: BODY_FONT_SIZE },
  selectedOption: { fontWeight: SELECTED_FONT_WEIGHT },
});

export interface DropdownOption<T> {
  readonly label: string;
  readonly value: T;
}

export interface ModalDropdownProps<T> {
  testID: string;
  accessibilityLabel: string;
  accessibilityHint: string;
  value: T;
  options: ReadonlyArray<DropdownOption<T>>;
  onChange: (value: T) => void;
}

export const ModalDropdown = <T extends string | number>({
  testID,
  accessibilityLabel,
  accessibilityHint,
  value,
  options,
  onChange,
}: ModalDropdownProps<T>): React.ReactElement => {
  const { theme, t } = useUi();
  const { colors } = theme;
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<View>(null);
  useFocusTrap(dialogRef, isOpen);

  const selectedLabel = useMemo(() => {
    const found = options.find((opt) => opt.value === value);
    return found?.label ?? t('common.selectPlaceholder');
  }, [options, value, t]);

  const handleOpen = useCallback(() => { setIsOpen(true); }, []);
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

  const renderOption = useCallback(
    ({ item }: { item: DropdownOption<T> }) => {
      const isSelected = item.value === value;

      return (
        <TouchableOpacity
          accessible
          accessibilityHint={t('common.selectOptionHint')}
          accessibilityLabel={item.label}
          accessibilityRole="button"
          style={[styles.option, isSelected ? { backgroundColor: colors.surfaceElevated } : null]}
          testID={`${testID}-option-${String(item.value)}`}
          onPress={() => handleSelect(item.value)}
        >
          <Text
            style={[
              styles.optionText,
              { color: colors.text },
              isSelected ? styles.selectedOption : null,
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      );
    },
    [colors.surfaceElevated, colors.text, handleSelect, testID, value, t],
  );

  const keyExtractor = useCallback((item: DropdownOption<T>) => String(item.value), []);

  return (
    <>
      <TouchableOpacity
        accessible
        accessibilityHint={accessibilityHint}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        style={containerStyle}
        testID={testID}
        onPress={handleOpen}
      >
        <Text style={[styles.selectedText, { color: colors.text }]}>{selectedLabel}</Text>
      </TouchableOpacity>

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
            <FlatList
              data={[...options]}
              keyExtractor={keyExtractor}
              renderItem={renderOption}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default ModalDropdown;
