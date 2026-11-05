import { useEffect, useRef, useState } from 'react';

const KEYBOARD_HEIGHT_RATIO = 0.75;

export interface VisibleViewport {
  offsetTop: number;
  keyboardOpen: boolean;
}

const INITIAL: VisibleViewport = { offsetTop: 0, keyboardOpen: false };

/** True when the visible height has dropped far enough below the tallest height seen at this width. */
export function isKeyboardOpen(visibleHeight: number, tallestHeight: number): boolean {
  return visibleHeight < tallestHeight * KEYBOARD_HEIGHT_RATIO;
}

/** Tracks the Visual Viewport offset and keyboard state; stays at its initial value where the API is absent. */
export function useVisibleViewport(): VisibleViewport {
  const [state, setState] = useState<VisibleViewport>(INITIAL);
  const tallest = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const viewport = typeof window === 'undefined' ? undefined : window.visualViewport;
    if (viewport === undefined || viewport === null) return undefined;

    const read = (): void => {
      const unzoomedHeight = viewport.height * viewport.scale;
      const unzoomedWidth = viewport.width * viewport.scale;
      const widthChanged = tallest.current.width !== unzoomedWidth;
      const height = widthChanged ? unzoomedHeight : Math.max(tallest.current.height, unzoomedHeight);
      tallest.current = { width: unzoomedWidth, height };
      const offsetTop = viewport.offsetTop;
      const keyboardOpen = isKeyboardOpen(unzoomedHeight, height);
      setState((previous) =>
        previous.offsetTop === offsetTop && previous.keyboardOpen === keyboardOpen
          ? previous
          : { offsetTop, keyboardOpen },
      );
    };

    read();
    viewport.addEventListener('resize', read);
    viewport.addEventListener('scroll', read);
    return () => {
      viewport.removeEventListener('resize', read);
      viewport.removeEventListener('scroll', read);
    };
  }, []);

  return state;
}
