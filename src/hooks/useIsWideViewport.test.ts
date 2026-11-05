import { act, renderHook } from '@testing-library/react';

import { LAYOUT_COLLAPSE_BREAKPOINT } from '../constants';
import { useIsWideViewport } from './useIsWideViewport';

const setWindowWidth = (width: number): void => {
  Object.defineProperty(document.documentElement, 'clientWidth', { configurable: true, value: width });
  act(() => {
    window.dispatchEvent(new Event('resize'));
  });
};

describe('useIsWideViewport', () => {
  it('at the breakpoint, reports wide', () => {
    setWindowWidth(LAYOUT_COLLAPSE_BREAKPOINT);

    const { result } = renderHook(() => useIsWideViewport());

    expect(result.current).toBe(true);
  });

  it('one pixel under the breakpoint, reports narrow', () => {
    setWindowWidth(LAYOUT_COLLAPSE_BREAKPOINT - 1);

    const { result } = renderHook(() => useIsWideViewport());

    expect(result.current).toBe(false);
  });

  it('with a custom breakpoint, compares against it', () => {
    setWindowWidth(500);

    const { result } = renderHook(() => useIsWideViewport(400));

    expect(result.current).toBe(true);
  });
});
