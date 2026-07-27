/**
 * useScrollLock — freezes page scroll (web only) while `enabled`, restoring the prior
 * `document.body` overflow on cleanup.
 *
 * No-op on native, where the RN `Modal` already covers the screen. Prevents the content
 * BEHIND an open dialog from scrolling under the backdrop while the dialog is focus-trapped.
 */
import { useEffect } from 'react';

import { Platform } from 'react-native';

export function useScrollLock(enabled: boolean): void {
  useEffect(() => {
    if (Platform.OS !== 'web' || !enabled) return;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = 'hidden';

    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [enabled]);
}
