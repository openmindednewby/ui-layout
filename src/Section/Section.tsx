/**
 * Section — a bordered card container that themes its border + surface.
 */
import React from 'react';

import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { Heading, type HeadingLevel } from '../Heading/Heading';

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
  titled: {
    gap: 12,
  },
});

export interface SectionProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: SectionVariant;
  title?: string;
  titleLevel?: HeadingLevel;
  testID?: string;
}

export const Section = ({
  children,
  style,
  variant = SectionVariant.Panel,
  title,
  titleLevel,
  testID,
}: SectionProps): React.ReactElement => {
  const { theme } = useUi();
  const isCard = variant === SectionVariant.Card;
  const fill = isCard ? theme.colors.background : theme.colors.surface;

  const containerStyle = React.useMemo(
    () => [styles.card, isCard ? styles.raised : null, title === undefined ? null : styles.titled, { borderColor: theme.colors.border, backgroundColor: fill }, style],
    [theme.colors.border, fill, isCard, title, style],
  );

  return (
    <View style={containerStyle} testID={testID}>
      {title === undefined ? null : <Heading level={titleLevel} testID={testID === undefined ? undefined : `${testID}-title`} text={title} />}
      {children}
    </View>
  );
};

export default Section;
