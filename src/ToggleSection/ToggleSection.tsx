import React, { useState } from 'react';

import { StyleSheet, View } from 'react-native';

import { Button } from '@dloizides/ui-buttons';

import { Section } from '../Section/Section';
import { SectionVariant } from '../Section/SectionVariant';

const styles = StyleSheet.create({
  stack: { gap: 12 },
});

export interface ToggleSectionProps {
  wide: boolean;
  title: string;
  toggleLabel: string;
  toggleHint: string;
  forceOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  testID: string;
  children: React.ReactNode;
}

/** A titled card when wide; when narrow the same content sits behind one toggle button, open when forced. */
export const ToggleSection = ({ wide, title, toggleLabel, toggleHint, forceOpen = false, open, onOpenChange, testID, children }: ToggleSectionProps): React.ReactElement => {
  const [ownOpen, setOwnOpen] = useState(false);
  const isOpen = open ?? ownOpen;
  const toggle = (): void => {
    if (open === undefined) setOwnOpen(!isOpen);
    onOpenChange?.(!isOpen);
  };
  if (wide) return <Section testID={`${testID}-card`} title={title} variant={SectionVariant.Card}>{children}</Section>;
  return (
    <View style={styles.stack}>
      <Button accessibilityHint={toggleHint} accessibilityLabel={toggleLabel} label={toggleLabel} testID={`${testID}-toggle`} variant="outline" onPress={toggle} />
      {isOpen || forceOpen ? children : null}
    </View>
  );
};

export default ToggleSection;
