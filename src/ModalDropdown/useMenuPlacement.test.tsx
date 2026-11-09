import { createRef } from 'react';
import type { View as RNView } from 'react-native';

import { renderHook } from '@testing-library/react';

import { MENU_MAX_HEIGHT, MENU_TOP_GAP } from './menuStacking';
import { useMenuPlacement } from './useMenuPlacement';

const VIEWPORT_HEIGHT = 800;
const rect = { top: 600, left: 40, width: 220, bottom: 640 };

function menuRefOfHeight(offsetHeight: number): ReturnType<typeof createRef<RNView>> {
  const ref = createRef<RNView>();
  Object.assign(ref, { current: { offsetHeight, getBoundingClientRect: () => ({}) } });
  return ref;
}

describe('useMenuPlacement', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: VIEWPORT_HEIGHT });
  });

  it('with a short measured menu that fits below, opens below', () => {
    const menuRef = menuRefOfHeight(120);

    const { result } = renderHook(() => useMenuPlacement(rect, menuRef, 3));

    expect(result.current.top).toBe(rect.bottom + MENU_TOP_GAP);
  });

  it('with a tall measured menu that does not fit below, opens above', () => {
    const menuRef = menuRefOfHeight(MENU_MAX_HEIGHT);

    const { result } = renderHook(() => useMenuPlacement(rect, menuRef, 20));

    expect(result.current.bottom).toBe(VIEWPORT_HEIGHT - rect.top + MENU_TOP_GAP);
  });

  it('with no measurable menu node, plans for the maximum height', () => {
    const menuRef = createRef<RNView>();

    const { result } = renderHook(() => useMenuPlacement(rect, menuRef, 3));

    expect(result.current.bottom).toBe(VIEWPORT_HEIGHT - rect.top + MENU_TOP_GAP);
  });
});
