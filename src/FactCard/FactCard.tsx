import React from 'react';

import { StyleSheet, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { AppText } from '../AppText/AppText';
import { TextKind } from '../AppText/TextKind';

const GAP = 8;
const RADIUS = 12;

const styles = StyleSheet.create({
  block: { gap: GAP },
  card: { borderWidth: 1, borderRadius: RADIUS, overflow: 'hidden' },
});

export interface FactCardProps {
  title: string;
  testID?: string;
  children: React.ReactNode;
}

/** A title above a bordered surface card that holds FactRow children. */
export const FactCard = ({ title, testID, children }: FactCardProps): React.ReactElement => {
  const { theme } = useUi();
  return (
    <View style={styles.block} testID={testID}>
      <AppText kind={TextKind.Strong}>{title}</AppText>
      <View style={[styles.card, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>{children}</View>
    </View>
  );
};

export default FactCard;
