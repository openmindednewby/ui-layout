import React from 'react';

import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { INITIAL_FOCUS_PROPS, useInitialFocus } from '@dloizides/rn-web-hooks';
import { useUi } from '@dloizides/ui-feedback';

import { LAYOUT_COLLAPSE_BREAKPOINT, LAYOUT_TEST_IDS } from '../constants';

const TITLE_BASIS = 280;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  rowCompact: { gap: 10 },
  text: { gap: 4, flexGrow: 1, flexShrink: 1, flexBasis: TITLE_BASIS, minWidth: 0 },
  textCompact: { gap: 2 },
  title: { fontSize: 24, fontWeight: '800' },
  titleCompact: { fontSize: 22, lineHeight: 26, fontWeight: '700' },
  subtitle: { fontSize: 14, lineHeight: 20 },
  subtitleCompact: { fontSize: 12, lineHeight: 16 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, maxWidth: '100%' },
});

export interface PageHeadProps {
  title: string;
  /** A string is drawn in the secondary text style; any other node is drawn as given. */
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  /** Focus the title when the page opens (FOCUS-1); default false. */
  initialFocus?: boolean;
  /** Phone head (22 px title, 12 px subtitle); default true below LAYOUT_COLLAPSE_BREAKPOINT. */
  compact?: boolean;
  testID?: string;
}

function hasContent(node: React.ReactNode): boolean {
  return node !== undefined && node !== null && node !== false;
}

/** Page title row: heading and subtitle on the left, page actions on the right; actions wrap below on narrow screens. */
export const PageHead = ({ title, subtitle, actions, initialFocus = false, compact, testID = LAYOUT_TEST_IDS.pageHead }: PageHeadProps): React.ReactElement => {
  const { colors } = useUi().theme;
  const { width } = useWindowDimensions();
  const isCompact = compact ?? width < LAYOUT_COLLAPSE_BREAKPOINT;
  const titleRef = useInitialFocus<Text>();
  const focusProps = initialFocus ? { ref: titleRef, ...INITIAL_FOCUS_PROPS } : {};
  const subtitleNode = typeof subtitle === 'string'
    ? <Text style={[isCompact ? styles.subtitleCompact : styles.subtitle, { color: colors.textSecondary }]} testID={`${testID}-subtitle`}>{subtitle}</Text>
    : subtitle;
  return (
    <View style={[styles.row, isCompact ? styles.rowCompact : null]} testID={testID}>
      <View style={[styles.text, isCompact ? styles.textCompact : null]}>
        <Text {...focusProps} accessibilityRole="header" style={[isCompact ? styles.titleCompact : styles.title, { color: colors.text }]} testID={`${testID}-title`}>{title}</Text>
        {subtitleNode}
      </View>
      {hasContent(actions) ? <View style={styles.actions} testID={`${testID}-actions`}>{actions}</View> : null}
    </View>
  );
};

export default PageHead;
