import { useCallback, useState } from 'react';

import type { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

const SLACK_PX = 1;

export interface EdgeFadeMetrics {
  contentWidth: number;
  viewportWidth: number;
  offset: number;
}

/** True while tabs remain hidden past the strip's end edge. */
export function showsEdgeFade({ contentWidth, viewportWidth, offset }: EdgeFadeMetrics): boolean {
  return contentWidth - viewportWidth - offset > SLACK_PX;
}

export interface EdgeFadeHandlers {
  visible: boolean;
  onLayout: (event: LayoutChangeEvent) => void;
  onContentSizeChange: (width: number) => void;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

/** Tracks a horizontal scroll strip and says whether its end-edge fade should show. */
export function useEdgeFade(): EdgeFadeHandlers {
  const [metrics, setMetrics] = useState<EdgeFadeMetrics>({ contentWidth: 0, viewportWidth: 0, offset: 0 });
  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const viewportWidth = event.nativeEvent.layout.width;
    setMetrics((prev) => ({ ...prev, viewportWidth }));
  }, []);
  const onContentSizeChange = useCallback((contentWidth: number) => setMetrics((prev) => ({ ...prev, contentWidth })), []);
  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = event.nativeEvent.contentOffset.x;
    setMetrics((prev) => ({ ...prev, offset }));
  }, []);
  return { visible: showsEdgeFade(metrics), onLayout, onContentSizeChange, onScroll };
}
