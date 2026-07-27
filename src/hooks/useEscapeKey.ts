/**
 * useEscapeKey — calls `onClose` when the user presses Escape (web only).
 *
 * No-op on native, where a dialog is dismissed with the hardware back button through
 * RN `Modal`'s `onRequestClose`. The `document` listener is attached ONLY while `enabled`,
 * so a closed dialog never intercepts an Escape meant for something else on the page.
 */
import { useEffect } from 'react';

import { Platform } from 'react-native';

export function useEscapeKey(enabled: boolean, onClose: () => void): void {
  useEffect(() => {
    if (Platform.OS !== 'web' || !enabled) return;

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [enabled, onClose]);
}
