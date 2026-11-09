/**
 * useEscapeKey — calls `onClose` when the user presses Escape (web only).
 *
 * No-op on native, where a dialog is dismissed with the hardware back button through
 * RN `Modal`'s `onRequestClose`. The `document` listener is attached ONLY while `enabled`,
 * so a closed dialog never intercepts an Escape meant for something else on the page.
 */
import { useEffect, useRef } from 'react';

import { Platform } from 'react-native';

const ESCAPE_KEY = 'Escape';
const OPEN_MENU_SELECTOR = '[aria-expanded="true"][aria-haspopup],[aria-expanded="true"][role="combobox"],[role="menu"],[role="listbox"]';

function isInsideOpenMenu(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(OPEN_MENU_SELECTOR) !== null;
}

export function useEscapeKey(enabled: boolean, onClose: () => void): void {
  const isEscapeForMenu = useRef(false);

  useEffect(() => {
    if (Platform.OS !== 'web' || !enabled) return;

    const onKeyDownCapture = (event: KeyboardEvent): void => {
      if (event.key === ESCAPE_KEY) isEscapeForMenu.current = isInsideOpenMenu(event.target);
    };
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === ESCAPE_KEY && !isEscapeForMenu.current) onClose();
    };
    document.addEventListener('keydown', onKeyDownCapture, true);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDownCapture, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [enabled, onClose]);
}
