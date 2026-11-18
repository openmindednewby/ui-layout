import React from 'react';

import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';

import { isFactsStackTwoColumn } from './factsStackLayout';
import { FactsStrip, type Fact } from './FactsStrip';

const STACK_GAP = 16;
const COLUMN_GAP = 24;
const ASIDE_WIDTH = 340;
const DEFAULT_MAX_WIDTH = 1200;
const DEFAULT_TEST_ID = 'facts-stack';

const styles = StyleSheet.create({
  frame: { alignSelf: 'center', width: '100%', gap: STACK_GAP },
  stack: { gap: STACK_GAP },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: COLUMN_GAP },
  main: { flex: 1, minWidth: 0, gap: STACK_GAP },
  aside: { width: ASIDE_WIDTH, gap: STACK_GAP },
});

export interface FactsStackProps {
  facts: readonly Fact[];
  children?: React.ReactNode;
  header?: React.ReactNode;
  aside?: React.ReactNode;
  maxWidth?: number;
  testID?: string;
}

/** A record page: header, facts strip and stacked sections, with the aside in a second column from 1024 px on web. */
export const FactsStack = ({
  facts,
  children,
  header,
  aside,
  maxWidth = DEFAULT_MAX_WIDTH,
  testID = DEFAULT_TEST_ID,
}: FactsStackProps): React.ReactElement => {
  const { width } = useWindowDimensions();
  const hasAside = aside !== undefined && aside !== null;
  const twoColumn = isFactsStackTwoColumn(width, Platform.OS, hasAside);
  const asideNode = hasAside ? (
    <View style={twoColumn ? styles.aside : styles.stack} testID={`${testID}-aside`}>
      {aside}
    </View>
  ) : null;
  const sections = (
    <View style={twoColumn ? styles.main : styles.stack} testID={`${testID}-sections`}>
      {children}
    </View>
  );

  return (
    <View style={[styles.frame, { maxWidth }]} testID={testID}>
      {header}
      <FactsStrip facts={facts} testID={`${testID}-facts`} />
      {twoColumn ? (
        <View style={styles.row}>
          {sections}
          {asideNode}
        </View>
      ) : (
        <>
          {sections}
          {asideNode}
        </>
      )}
    </View>
  );
};

export default FactsStack;
