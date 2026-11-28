import React, { useState } from 'react';

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { LAYOUT_TEST_IDS, MIN_TARGET_PX } from '../constants';
import { StickyPreview } from './StickyPreview';

const TOGGLE_PADDING = 12;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  slot: { flex: 1 },
  toggle: { minHeight: MIN_TARGET_PX, minWidth: MIN_TARGET_PX, justifyContent: 'center', alignItems: 'center', paddingHorizontal: TOGGLE_PADDING },
});

export interface TapToOpenLabels {
  openLabel: string;
  openHint: string;
  closeLabel: string;
  closeHint: string;
}

export interface TapToOpenPreviewProps {
  full: React.ReactNode;
  compact: React.ReactNode;
  labels: TapToOpenLabels;
  topOffset?: number;
  accessibilityLabel: string;
  accessibilityHint?: string;
  testID?: string;
}

interface ToggleRowProps {
  label: string;
  hint: string;
  testID: string;
  onPress: () => void;
  children: React.ReactNode;
}

const ToggleRow = ({ label, hint, testID, onPress, children }: ToggleRowProps): React.ReactElement => {
  const { theme } = useUi();
  return (
    <View style={styles.row}>
      <View style={styles.slot}>{children}</View>
      <Pressable accessibilityHint={hint} accessibilityLabel={label} accessibilityRole="button" style={styles.toggle} testID={testID} onPress={onPress}>
        <Text style={{ color: theme.colors.text }}>{label}</Text>
      </Pressable>
    </View>
  );
};

/** A StickyPreview that rests compact and opens to its full slot only when the user taps Open. */
export const TapToOpenPreview = ({
  full,
  compact,
  labels,
  testID = LAYOUT_TEST_IDS.stickyPreview,
  ...rest
}: TapToOpenPreviewProps): React.ReactElement => {
  const [opened, setOpened] = useState(false);
  return (
    <StickyPreview
      {...rest}
      autoCompact={false}
      compact={
        <ToggleRow hint={labels.openHint} label={labels.openLabel} testID={`${testID}-open`} onPress={() => { setOpened(true); }}>
          {compact}
        </ToggleRow>
      }
      forceCompact={!opened}
      full={
        <ToggleRow hint={labels.closeHint} label={labels.closeLabel} testID={`${testID}-close`} onPress={() => { setOpened(false); }}>
          {full}
        </ToggleRow>
      }
      testID={testID}
    />
  );
};

export default TapToOpenPreview;
