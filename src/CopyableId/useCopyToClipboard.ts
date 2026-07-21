/**
 * Copy-with-feedback state: run a clipboard write, expose whether it succeeded, and return to
 * idle after a beat so the control does not sit on a stale "Copied!" forever.
 *
 * Split out of the component so the timing and the failure branch are testable without a
 * renderer — the part most likely to be wrong is the part that only shows up when the clipboard
 * says no, which is hard to reach through the UI.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { copyText } from './copyText';
import { CopyStatus } from './CopyStatus';

/** How long the "Copied!"/"Copy failed" confirmation stays up before reverting to idle. */
export const COPY_FEEDBACK_MS = 2000;

export interface CopyToClipboard {
  status: CopyStatus;
  /** Fire-and-forget: performs the write and drives `status`. Safe to pass straight to onPress. */
  copy: () => void;
}

/**
 * @param value  the text to copy
 * @param writer optional platform clipboard writer (see `copyText`)
 */
export function useCopyToClipboard(
  value: string,
  writer?: (text: string) => void | Promise<void>,
): CopyToClipboard {
  const [status, setStatus] = useState<CopyStatus>(CopyStatus.Idle);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Guards a setState after unmount: the clipboard write is async, and a drawer can close
  // mid-flight.
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, []);

  const copy = useCallback((): void => {
    void (async () => {
      const ok = await copyText(value, writer);
      if (!mountedRef.current) return;

      setStatus(ok ? CopyStatus.Copied : CopyStatus.Failed);

      if (timerRef.current !== null) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (mountedRef.current) setStatus(CopyStatus.Idle);
      }, COPY_FEEDBACK_MS);
    })();
  }, [value, writer]);

  return { status, copy };
}
