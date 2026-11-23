import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { INITIAL_FOCUS_PROPS, useInitialFocus } from '@dloizides/rn-web-hooks';
import { useUi } from '@dloizides/ui-feedback';

import { LAYOUT_TEST_IDS } from '../constants';

const TITLE_BASIS = 280;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  text: { gap: 4, flexGrow: 1, flexShrink: 1, flexBasis: TITLE_BASIS, minWidth: 0 },
  title: { fontSize: 24, fontWeight: '800' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, maxWidth: '100%' },
});

export interface PageHeadProps {
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  /** Focus the title when the page opens (FOCUS-1); default false. */
  initialFocus?: boolean;
  testID?: string;
}

function hasContent(node: React.ReactNode): boolean {
  return node !== undefined && node !== null && node !== false;
}

/** Page title row: heading and subtitle on the left, page actions on the right; actions wrap below on narrow screens. */
export const PageHead = ({ title, subtitle, actions, initialFocus = false, testID = LAYOUT_TEST_IDS.pageHead }: PageHeadProps): React.ReactElement => {
  const { colors } = useUi().theme;
  const titleRef = useInitialFocus<Text>();
  const focusProps = initialFocus ? { ref: titleRef, ...INITIAL_FOCUS_PROPS } : {};
  return (
    <View style={styles.row} testID={testID}>
      <View style={styles.text}>
        <Text {...focusProps} accessibilityRole="header" style={[styles.title, { color: colors.text }]} testID={`${testID}-title`}>{title}</Text>
        {subtitle}
      </View>
      {hasContent(actions) ? <View style={styles.actions} testID={`${testID}-actions`}>{actions}</View> : null}
    </View>
  );
};

export default PageHead;
