import React, { useMemo } from 'react';

import { Platform, StyleSheet, View } from 'react-native';
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

export interface StickyPreviewProps {
  full: React.ReactNode;
  compact: React.ReactNode;
  forceCompact?: boolean;
  topOffset?: number;
  accessibilityLabel: string;
  accessibilityHint?: string;
  testID?: string;
}

/** Keeps a preview at the top of the visible viewport, swapping to its compact slot while space is short. */
export const StickyPreview = ({
  full,
  compact,
  forceCompact = false,
  topOffset = 0,
  accessibilityLabel,
  accessibilityHint,
  testID = LAYOUT_TEST_IDS.stickyPreview,
}: StickyPreviewProps): React.ReactElement => {
  const { theme } = useUi();
  const { offsetTop, keyboardOpen } = useVisibleViewport();
  const { sentinelRef, isStuck } = useStuckSentinel(topOffset);
  const isCompact = forceCompact || isStuck || keyboardOpen;

  const pinned = useMemo(() => {
    const web = { position: 'sticky', top: topOffset + offsetTop, zIndex: STICKY_Z_INDEX };
    return (Platform.OS === WEB_PLATFORM ? web : {}) as unknown as ViewStyle;
  }, [offsetTop, topOffset]);

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
        <View testID={`${testID}-${isCompact ? 'compact' : 'full'}`}>{isCompact ? compact : full}</View>
      </View>
    </>
  );
};

export default StickyPreview;
