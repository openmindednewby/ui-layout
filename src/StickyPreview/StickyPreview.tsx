import React, { useMemo, useState } from 'react';

import { Platform, Pressable, StyleSheet, View } from 'react-native';
import type { ViewStyle } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { LAYOUT_TEST_IDS } from '../constants';
import { WEB_PLATFORM } from '../responsive';
import { useStuckSentinel } from './hooks/useStuckSentinel';
import { useVisibleViewport } from './hooks/useVisibleViewport';

const STICKY_Z_INDEX = 5;

const styles = StyleSheet.create({
  sentinel: { height: 1, marginBottom: -1 },
  compact: { borderBottomWidth: 1 },
});

export interface StickyPreviewTapLabels {
  openLabel: string;
  openHint: string;
  closeLabel: string;
  closeHint: string;
}

export interface StickyPreviewProps {
  full: React.ReactNode;
  compact: React.ReactNode;
  forceCompact?: boolean;
  topOffset?: number;
  accessibilityLabel: string;
  accessibilityHint?: string;
  testID?: string;
  tapToOpen?: StickyPreviewTapLabels;
}

interface TapSlotProps {
  label: string;
  hint: string;
  testID: string;
  onPress: () => void;
  children: React.ReactNode;
}

const TapSlot = ({ label, hint, testID, onPress, children }: TapSlotProps): React.ReactElement => (
  <Pressable accessibilityHint={hint} accessibilityLabel={label} accessibilityRole="button" testID={testID} onPress={onPress}>
    {children}
  </Pressable>
);

/** Keeps a preview at the top of the visible viewport, swapping to its compact slot while space is short; with tapToOpen it rests compact until tapped. */
export const StickyPreview = ({
  full,
  compact,
  forceCompact = false,
  topOffset = 0,
  accessibilityLabel,
  accessibilityHint,
  testID = LAYOUT_TEST_IDS.stickyPreview,
  tapToOpen,
}: StickyPreviewProps): React.ReactElement => {
  const [opened, setOpened] = useState(false);
  const { theme } = useUi();
  const { offsetTop, keyboardOpen } = useVisibleViewport();
  const { sentinelRef, isStuck } = useStuckSentinel(topOffset);
  const closedByTap = tapToOpen !== undefined && !opened;
  const isCompact = forceCompact || closedByTap || isStuck || keyboardOpen;

  const pinned = useMemo(() => {
    const web = { position: 'sticky', top: topOffset + offsetTop, zIndex: STICKY_Z_INDEX };
    return (Platform.OS === WEB_PLATFORM ? web : {}) as unknown as ViewStyle;
  }, [offsetTop, topOffset]);

  const renderSlot = (): React.ReactNode => {
    if (tapToOpen === undefined) return isCompact ? compact : full;
    if (isCompact) {
      return (
        <TapSlot hint={tapToOpen.openHint} label={tapToOpen.openLabel} testID={`${testID}-open`} onPress={() => { setOpened(true); }}>
          {compact}
        </TapSlot>
      );
    }
    return (
      <TapSlot hint={tapToOpen.closeHint} label={tapToOpen.closeLabel} testID={`${testID}-close`} onPress={() => { setOpened(false); }}>
        {full}
      </TapSlot>
    );
  };

  return (
    <>
      <View aria-hidden ref={sentinelRef} style={styles.sentinel} />
      <View
        accessibilityHint={accessibilityHint}
        accessibilityLabel={accessibilityLabel}
        role="region"
        style={[
          pinned,
          { backgroundColor: theme.colors.background, borderColor: theme.colors.border },
          isCompact && styles.compact,
        ]}
        testID={testID}
      >
        <View testID={`${testID}-${isCompact ? 'compact' : 'full'}`}>{renderSlot()}</View>
      </View>
    </>
  );
};

export default StickyPreview;
