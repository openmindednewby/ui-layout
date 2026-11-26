import React from 'react';

import { StyleSheet, Text } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

const TITLE_FONT = 15;
const TITLE_GAP = 12;

const styles = StyleSheet.create({
  title: { fontSize: TITLE_FONT, fontWeight: '700', marginBottom: TITLE_GAP },
});

export interface CardTitleProps {
  label: string;
  testID?: string;
}

/** The bold heading a card opens with: a header for assistive tech, inked with the theme text colour. */
export const CardTitle = ({ label, testID }: CardTitleProps): React.ReactElement => {
  const { theme } = useUi();
  return <Text accessibilityRole="header" style={[styles.title, { color: theme.colors.text }]} testID={testID}>{label}</Text>;
};

export default CardTitle;
