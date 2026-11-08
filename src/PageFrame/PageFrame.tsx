import React, { useCallback, useState } from 'react';

import { Pressable, StyleSheet, View } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { LAYOUT_I18N, LAYOUT_TEST_IDS } from '../constants';
import { PageOverlay } from './components/PageOverlay';
import { A4_PAGE, scaledFrame } from './utils/pageScale';
import type { PageSize } from './utils/pageScale';

const styles = StyleSheet.create({
  outer: { width: '100%', overflow: 'hidden' },
  page: { position: 'absolute', top: 0, left: 0 },
  trigger: { width: '100%', cursor: 'pointer' },
});

export interface PageFrameProps {
  children: React.ReactNode;
  pageSize?: PageSize;
  testID?: string;
  /** When true, a press or Enter on the preview opens the page at full size in an overlay. */
  enlargeable?: boolean;
}

/** Lays children out at a fixed page size and scales the page down to the container width, never up. */
export const PageFrame = ({
  children,
  pageSize = A4_PAGE,
  testID = LAYOUT_TEST_IDS.pageFrame,
  enlargeable = false,
}: PageFrameProps): React.ReactElement => {
  const { t } = useUi();
  const [containerWidth, setContainerWidth] = useState(0);
  const [enlarged, setEnlarged] = useState(false);
  const onLayout = useCallback((event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  }, []);
  const open = useCallback(() => setEnlarged(true), []);
  const close = useCallback(() => setEnlarged(false), []);
  const frame = scaledFrame(containerWidth, pageSize);

  const preview = (
    <View style={[styles.outer, { height: frame.height }]} testID={testID} onLayout={onLayout}>
      <View
        style={[
          styles.page,
          {
            width: pageSize.width,
            height: pageSize.height,
            transform: [{ translateX: frame.offsetX }, { translateY: frame.offsetY }, { scale: frame.scale }],
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
  if (!enlargeable) return preview;

  return (
    <>
      <Pressable
        accessibilityHint={t(LAYOUT_I18N.pageEnlargeHint)}
        accessibilityLabel={t(LAYOUT_I18N.pageEnlarge)}
        accessibilityRole="button"
        style={styles.trigger}
        testID={`${testID}-enlarge`}
        onPress={open}
      >
        {preview}
      </Pressable>
      <PageOverlay pageSize={pageSize} testID={`${testID}-overlay`} visible={enlarged} onClose={close}>
        {children}
      </PageOverlay>
    </>
  );
};
