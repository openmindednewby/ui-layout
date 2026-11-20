import React from 'react';

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { MIN_TARGET_PX } from '../constants';

const FONT_SIZE = 13;
const GAP = 6;
const SEPARATOR = '›';
const BACK = '‹';

const styles = StyleSheet.create({
  link: { justifyContent: 'center', minHeight: MIN_TARGET_PX },
  row: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  text: { fontSize: FONT_SIZE, fontWeight: '500' },
});

export interface BreadcrumbItem {
  key: string;
  label: string;
  onPress?: () => void;
  accessibilityHint?: string;
  testID?: string;
}

export interface BreadcrumbProps {
  items: ReadonlyArray<BreadcrumbItem>;
  accessibilityLabel: string;
  accessibilityHint?: string;
  testID?: string;
}

/** A compact text trail back to the parent list; a step without onPress is the current place. */
export const Breadcrumb = ({ items, accessibilityLabel, accessibilityHint, testID }: BreadcrumbProps): React.ReactElement => {
  const { theme } = useUi();
  const muted = { color: theme.colors.textSecondary };
  return (
    <View accessibilityHint={accessibilityHint} aria-label={accessibilityLabel} style={styles.row} testID={testID}>
      <Text aria-hidden style={[styles.text, muted]}>{BACK}</Text>
      {items.map((item, index) => (
        <React.Fragment key={item.key}>
          {index > 0 ? <Text aria-hidden style={[styles.text, muted]}>{SEPARATOR}</Text> : null}
          {item.onPress === undefined ? (
            <Text style={[styles.text, muted]} testID={item.testID}>{item.label}</Text>
          ) : (
            <Pressable accessibilityHint={item.accessibilityHint} accessibilityLabel={item.label} accessibilityRole="link" style={styles.link} testID={item.testID} onPress={item.onPress}>
              <Text style={[styles.text, { color: theme.colors.text }]}>{item.label}</Text>
            </Pressable>
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

export default Breadcrumb;
