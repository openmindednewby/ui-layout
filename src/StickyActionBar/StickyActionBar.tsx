import React from 'react';

import { Platform, StyleSheet, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { LAYOUT_COLLAPSE_BREAKPOINT, LAYOUT_TEST_IDS } from '../constants';
import { useIsWideViewport } from '../hooks/useIsWideViewport';
import { BAR_PADDING, stickyEdgeStyle } from './stickyEdge';

const ACTION_GAP = 8;

const styles = StyleSheet.create({
  inline: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end', gap: ACTION_GAP },
  bar: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'stretch', gap: ACTION_GAP, paddingTop: BAR_PADDING, paddingHorizontal: BAR_PADDING, borderTopWidth: 1 },
});

export interface StickyActionBarProps {
  accessibilityLabel: string;
  accessibilityHint?: string;
  children: React.ReactNode;
  breakpoint?: number;
  bottomInset?: number;
  bleed?: number;
  testID?: string;
}

/** Page actions: pinned to the bottom edge above the safe area when narrow, an inline end-aligned row when wide. `bleed` cancels the page's side padding so the narrow bar spans the full width. */
export const StickyActionBar = ({
  accessibilityLabel,
  accessibilityHint,
  children,
  breakpoint = LAYOUT_COLLAPSE_BREAKPOINT,
  bottomInset = 0,
  bleed = 0,
  testID = LAYOUT_TEST_IDS.stickyActionBar,
}: StickyActionBarProps): React.ReactElement => {
  const wide = useIsWideViewport(breakpoint);
  const { colors } = useUi().theme;
  if (wide) return <View accessibilityHint={accessibilityHint} accessibilityLabel={accessibilityLabel} role="toolbar" style={styles.inline} testID={testID}>{children}</View>;
  const surface = { backgroundColor: colors.surface, borderTopColor: colors.border, marginHorizontal: -bleed };
  return (
    <View accessibilityHint={accessibilityHint} accessibilityLabel={accessibilityLabel} role="toolbar" style={[styles.bar, surface, stickyEdgeStyle(Platform.OS, bottomInset)]} testID={testID}>
      {children}
    </View>
  );
};

export default StickyActionBar;
