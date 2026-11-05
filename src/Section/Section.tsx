/**
 * Section — a bordered card container that themes its border + surface.
 */
import React from 'react';

import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { SectionVariant } from './SectionVariant';

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 6,
  },
  raised: {
    borderRadius: 12,
    gap: 12,
  },
});

export interface SectionProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: SectionVariant;
  testID?: string;
}

export const Section = ({
  children,
  style,
  variant = SectionVariant.Panel,
  testID,
}: SectionProps): React.ReactElement => {
  const { theme } = useUi();
  const isCard = variant === SectionVariant.Card;
  const fill = isCard ? theme.colors.background : theme.colors.surface;

  const containerStyle = React.useMemo(
    () => [styles.card, isCard ? styles.raised : null, { borderColor: theme.colors.border, backgroundColor: fill }, style],
    [theme.colors.border, fill, isCard, style],
  );

  return (
    <View style={containerStyle} testID={testID}>
      {children}
    </View>
  );
};

export default Section;
