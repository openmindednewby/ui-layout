import { useCallback, useEffect, useRef, useState } from 'react';

import { Animated, Easing, type LayoutChangeEvent } from 'react-native';

import { useReducedMotion } from '@dloizides/rn-web-hooks';

export const INDICATOR_MS = 180;

interface RowBox {
  y: number;
  height: number;
}

export interface SlidingIndicator {
  measured: boolean;
  top: Animated.Value;
  height: Animated.Value;
  onRowLayout: (index: number) => (event: LayoutChangeEvent) => void;
}

const slide = (value: Animated.Value, toValue: number): Animated.CompositeAnimation =>
  Animated.timing(value, { toValue, duration: INDICATOR_MS, easing: Easing.out(Easing.cubic), useNativeDriver: false });

/** Slides the active-item bar to the measured row; jumps on first placement and under reduced motion. */
export function useSlidingIndicator(activeIndex: number): SlidingIndicator {
  const reduced = useReducedMotion();
  const [rows, setRows] = useState<ReadonlyArray<RowBox | undefined>>([]);
  const top = useRef(new Animated.Value(0)).current;
  const height = useRef(new Animated.Value(0)).current;
  const placed = useRef(false);
  const targetY = rows[activeIndex]?.y;
  const targetHeight = rows[activeIndex]?.height;

  useEffect(() => {
    if (targetY === undefined || targetHeight === undefined) return;
    if (reduced || !placed.current) {
      top.setValue(targetY);
      height.setValue(targetHeight);
      placed.current = true;
      return;
    }
    Animated.parallel([slide(top, targetY), slide(height, targetHeight)]).start();
  }, [targetY, targetHeight, reduced, top, height]);

  const onRowLayout = useCallback(
    (index: number) => (event: LayoutChangeEvent) => {
      const { y, height: rowHeight } = event.nativeEvent.layout;
      setRows((prev) => {
        const next = [...prev];
        next[index] = { y, height: rowHeight };
        return next;
      });
    },
    [],
  );

  return { measured: targetY !== undefined, top, height, onRowLayout };
}
