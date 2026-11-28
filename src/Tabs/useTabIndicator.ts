import { useCallback, useEffect, useRef, useState } from 'react';

import { Animated, Easing, type LayoutChangeEvent } from 'react-native';

export const TAB_INDICATOR_MS = 180;

interface TabBox {
  x: number;
  width: number;
}

export interface TabIndicator {
  measured: boolean;
  left: Animated.Value;
  width: Animated.Value;
  onTabLayout: (index: number) => (event: LayoutChangeEvent) => void;
}

const slide = (value: Animated.Value, toValue: number): Animated.CompositeAnimation =>
  Animated.timing(value, { toValue, duration: TAB_INDICATOR_MS, easing: Easing.out(Easing.cubic), useNativeDriver: false });

/** Slides the underline to the measured active tab; jumps on first placement and under reduced motion. */
export function useTabIndicator(activeIndex: number, reduced: boolean): TabIndicator {
  const [boxes, setBoxes] = useState<ReadonlyArray<TabBox | undefined>>([]);
  const left = useRef(new Animated.Value(0)).current;
  const width = useRef(new Animated.Value(0)).current;
  const placed = useRef(false);
  const targetX = boxes[activeIndex]?.x;
  const targetWidth = boxes[activeIndex]?.width;

  useEffect(() => {
    if (targetX === undefined || targetWidth === undefined) return;
    if (reduced || !placed.current) {
      left.setValue(targetX);
      width.setValue(targetWidth);
      placed.current = true;
      return;
    }
    Animated.parallel([slide(left, targetX), slide(width, targetWidth)]).start();
  }, [targetX, targetWidth, reduced, left, width]);

  const onTabLayout = useCallback(
    (index: number) => (event: LayoutChangeEvent) => {
      const { x, width: tabWidth } = event.nativeEvent.layout;
      setBoxes((prev) => {
        const next = [...prev];
        next[index] = { x, width: tabWidth };
        return next;
      });
    },
    [],
  );

  return { measured: targetX !== undefined, left, width, onTabLayout };
}
