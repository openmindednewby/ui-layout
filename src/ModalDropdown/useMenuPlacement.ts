import { useLayoutEffect, useMemo, useState } from 'react';
import type { RefObject } from 'react';

import { Platform } from 'react-native';
import type { View as RNView } from 'react-native';

import { MENU_MAX_HEIGHT, resolveMenuPlacement, type AnchorRect, type MenuPlacement } from './menuStacking';
import { toDomNode } from './useAnchorTracking';

const IS_WEB = Platform.OS === 'web';
const UNMEASURED_RECT: AnchorRect = { top: 0, left: 0, width: 0, bottom: 0 };

function readViewportHeight(): number {
  return IS_WEB && typeof window !== 'undefined' ? window.innerHeight : 0;
}

/** The open menu's vertical placement on web, from its measured height and the current viewport height. */
export function useMenuPlacement(
  rect: AnchorRect | null,
  menuRef: RefObject<RNView | null>,
  itemCount: number,
): MenuPlacement {
  const [menuHeight, setMenuHeight] = useState(MENU_MAX_HEIGHT);
  const [viewportHeight, setViewportHeight] = useState(readViewportHeight);

  useLayoutEffect(() => {
    const measured = toDomNode(menuRef)?.offsetHeight ?? 0;
    if (measured > 0) setMenuHeight(measured);
  }, [menuRef, itemCount]);

  useLayoutEffect(() => {
    if (!IS_WEB) return undefined;
    const onResize = (): void => setViewportHeight(readViewportHeight());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return useMemo(
    () => resolveMenuPlacement(rect ?? UNMEASURED_RECT, viewportHeight, menuHeight),
    [rect, viewportHeight, menuHeight],
  );
}
