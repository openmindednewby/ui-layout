import React, { useEffect, useRef } from 'react';

import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { MIN_TARGET_PX } from '../constants';

const RADIUS = 8;
const PAD_H = 12;
const GAP = 6;
const FONT_SIZE = 13;
const DISABLED_OPACITY = 0.55;

const styles = StyleSheet.create({
  base: { alignItems: 'center', borderRadius: RADIUS, borderWidth: 1, flexDirection: 'row', gap: GAP, justifyContent: 'center', minHeight: MIN_TARGET_PX, minWidth: MIN_TARGET_PX, paddingHorizontal: PAD_H },
  disabled: { borderStyle: 'dashed', opacity: DISABLED_OPACITY },
  text: { fontSize: FONT_SIZE, fontWeight: '600' },
});

export interface RecordActionButtonProps {
  label: string;
  hint: string;
  testID: string;
  icon?: React.ReactNode;
  onPress?: () => void;
  iconOnly?: boolean;
  disabledReason?: string;
}

interface TitledNode {
  setAttribute: (name: string, value: string) => void;
}

function hasTitle(node: unknown): node is TitledNode {
  return typeof node === 'object' && node !== null && 'setAttribute' in node;
}

/** One record action with an icon; icon only when compact, disabled with a reason when it has no onPress. */
export const RecordActionButton = ({ label, hint, testID, icon, onPress, iconOnly = false, disabledReason }: RecordActionButtonProps): React.ReactElement => {
  const { theme } = useUi();
  const ref = useRef<View>(null);
  const disabled = onPress === undefined;
  const title = disabled ? disabledReason : undefined;
  useEffect(() => {
    const node: unknown = ref.current;
    if (Platform.OS === 'web' && title !== undefined && hasTitle(node)) node.setAttribute('title', title);
  }, [title]);
  const showLabel = !iconOnly || icon === undefined;
  return (
    <Pressable
      ref={ref}
      accessibilityHint={title ?? hint}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      style={[styles.base, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }, disabled && styles.disabled]}
      testID={testID}
      onPress={onPress}
    >
      {icon === undefined ? null : <View aria-hidden>{icon}</View>}
      {showLabel ? <Text style={[styles.text, { color: theme.colors.text }]}>{label}</Text> : null}
    </Pressable>
  );
};

export default RecordActionButton;
