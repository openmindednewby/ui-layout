/**
 * Section — a bordered card container that themes its border + surface.
 */
import React from 'react';

import { StyleSheet, View, type ViewStyle } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 6,
  },
});

export interface SectionProps {
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export const Section = ({ children, style }: SectionProps): React.ReactElement => {
  const { theme } = useUi();

  const containerStyle = React.useMemo(
    () => [styles.card, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }, style],
    [theme.colors.border, theme.colors.surface, style],
  );

  return <View style={containerStyle}>{children}</View>;
};

export default Section;
