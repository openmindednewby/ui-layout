import { act, renderHook } from '@testing-library/react';
import { Animated, type LayoutChangeEvent } from 'react-native';

import { useReducedMotion } from '@dloizides/rn-web-hooks';

import { useSlidingIndicator } from './useSlidingIndicator';

jest.mock('@dloizides/rn-web-hooks', () => ({ useReducedMotion: jest.fn(() => false) }));

const layoutAt = (y: number, height: number): LayoutChangeEvent => ({ nativeEvent: { layout: { x: 0, y, width: 160, height } } }) as LayoutChangeEvent;

function measureRows(onRowLayout: (index: number) => (event: LayoutChangeEvent) => void): void {
  act(() => {
    onRowLayout(0)(layoutAt(20, 32));
    onRowLayout(1)(layoutAt(54, 32));
  });
}

describe('useSlidingIndicator', () => {
  beforeEach(() => {
    jest.spyOn(Animated, 'timing');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('with no measured row, reports the indicator unmeasured', () => {
    const { result } = renderHook(() => useSlidingIndicator(0));

    const { measured } = result.current;

    expect(measured).toBe(false);
  });

  it('with the first placement, jumps to the row without animating', () => {
    const { result } = renderHook(() => useSlidingIndicator(0));

    measureRows(result.current.onRowLayout);

    expect(Animated.timing).not.toHaveBeenCalled();
    expect(result.current.measured).toBe(true);
  });

  it('with a later move, slides to the new row', () => {
    const { result, rerender } = renderHook(({ index }) => useSlidingIndicator(index), { initialProps: { index: 0 } });
    measureRows(result.current.onRowLayout);

    rerender({ index: 1 });

    expect(Animated.timing).toHaveBeenCalledWith(result.current.top, expect.objectContaining({ toValue: 54 }));
  });

  it('with reduced motion, jumps on a move instead of sliding', () => {
    jest.mocked(useReducedMotion).mockReturnValue(true);
    const { result, rerender } = renderHook(({ index }) => useSlidingIndicator(index), { initialProps: { index: 0 } });
    measureRows(result.current.onRowLayout);

    rerender({ index: 1 });

    expect(Animated.timing).not.toHaveBeenCalled();
  });
});
