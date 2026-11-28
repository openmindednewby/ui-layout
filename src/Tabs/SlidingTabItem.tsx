import React, { forwardRef } from 'react';

import { Platform, Pressable, StyleSheet, Text, type LayoutChangeEvent, type PressableProps, type View, type ViewStyle } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { MIN_TARGET_PX } from '../constants';
import type { UnderlineTab } from './underlineTabTypes';

const PAD_H = 12;
const GAP = 6;
const FONT_SIZE = 14;
const COUNT_FONT = 12;
const COUNT_MIN = 22;
const COUNT_PAD = 6;
const PILL = 999;
const RADIUS = 6;
const RING_PX = 2;
const TONE_TRANSITION = 'background-color 150ms ease-out, color 150ms ease-out';

const styles = StyleSheet.create({
  count: { borderRadius: PILL, fontSize: COUNT_FONT, fontWeight: '700', minWidth: COUNT_MIN, paddingHorizontal: COUNT_PAD, textAlign: 'center' },
  label: { fontSize: FONT_SIZE, fontWeight: '600' },
  tab: { alignItems: 'center', borderTopLeftRadius: RADIUS, borderTopRightRadius: RADIUS, flexDirection: 'row', gap: GAP, justifyContent: 'center', minHeight: MIN_TARGET_PX, minWidth: MIN_TARGET_PX, paddingHorizontal: PAD_H },
});

interface WebPressState {
  pressed: boolean;
  hovered?: boolean;
  focused?: boolean;
}

interface TabKeyEvent {
  key?: string;
  preventDefault?: () => void;
}

export interface SlidingTabItemProps {
  tab: UnderlineTab;
  selected: boolean;
  ringColor: string;
  reducedMotion: boolean;
  onSelect: (key: string) => void;
  onTabKey: (key: string | undefined) => boolean;
  onLayout: (event: LayoutChangeEvent) => void;
}

const ringStyle = (color: string): ViewStyle => ({ outlineColor: color, outlineOffset: -RING_PX, outlineStyle: 'solid', outlineWidth: RING_PX }) as ViewStyle;

export const SlidingTabItem = forwardRef<View, SlidingTabItemProps>(({ tab, selected, ringColor, reducedMotion, onSelect, onTabKey, onLayout }, ref) => {
  const { theme } = useUi();
  const handleKeyDown = (event: TabKeyEvent): void => {
    if (onTabKey(event.key)) event.preventDefault?.();
  };
  const webProps = (Platform.OS === 'web' ? { onKeyDown: handleKeyDown } : {}) as Partial<PressableProps>;
  const toneTransition = (reducedMotion ? {} : { transition: TONE_TRANSITION }) as ViewStyle;
  return (
    <Pressable
      ref={ref}
      {...webProps}
      accessibilityHint={tab.accessibilityHint}
      accessibilityLabel={tab.label}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      aria-selected={selected}
      focusable={selected}
      style={(state) => {
        const { hovered, focused, pressed } = state as WebPressState;
        const toned = hovered === true || pressed;
        return [styles.tab, toneTransition, { backgroundColor: toned && !selected ? theme.colors.surface : 'transparent' }, focused === true ? ringStyle(ringColor) : null];
      }}
      testID={tab.testID}
      onLayout={onLayout}
      onPress={() => onSelect(tab.key)}
    >
      {(state) => {
        const { hovered } = state as WebPressState;
        const ink = selected || hovered === true ? theme.colors.text : theme.colors.textSecondary;
        return (
          <>
            {tab.icon ?? null}
            <Text style={[styles.label, { color: ink }]}>{tab.label}</Text>
            {tab.count === undefined ? null : <Text style={[styles.count, { backgroundColor: theme.colors.border, color: theme.colors.text }]}>{String(tab.count)}</Text>}
          </>
        );
      }}
    </Pressable>
  );
});

SlidingTabItem.displayName = 'SlidingTabItem';
