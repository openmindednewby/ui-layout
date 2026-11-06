import React, { useCallback, useState } from 'react';

import { StyleSheet, View } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';

import { LAYOUT_TEST_IDS } from '../constants';
import { A4_PAGE, scaledFrame } from './utils/pageScale';
import type { PageSize } from './utils/pageScale';

const styles = StyleSheet.create({
  outer: { width: '100%', overflow: 'hidden' },
  page: { position: 'absolute', top: 0, left: 0 },
});

export interface PageFrameProps {
  children: React.ReactNode;
  pageSize?: PageSize;
  testID?: string;
}

/** Lays children out at a fixed page size and scales the page down to the container width, never up. */
export const PageFrame = ({
  children,
  pageSize = A4_PAGE,
  testID = LAYOUT_TEST_IDS.pageFrame,
}: PageFrameProps): React.ReactElement => {
  const [containerWidth, setContainerWidth] = useState(0);
  const onLayout = useCallback((event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  }, []);
  const frame = scaledFrame(containerWidth, pageSize);

  return (
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
};
