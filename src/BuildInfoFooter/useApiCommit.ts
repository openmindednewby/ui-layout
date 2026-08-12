/**
 * Best-effort fetch of an API's build commit for {@link BuildInfoFooter}.
 *
 * When `apiBaseUrl` is set, GETs `${apiBaseUrl}/version` once and returns its `commit` field.
 * ANY failure (offline, 404, non-JSON, no `fetch`) leaves the commit `undefined` and the footer
 * shows only the app build version — a version caption must never surface a network error to the
 * user. The write is guarded against a mid-flight unmount.
 */
import { useEffect, useRef, useState } from 'react';

import { trimTrailingSlash } from './formatBuildInfo';

/** Shape of the `/version` payload this hook reads. Only `commit` is consumed. */
export interface VersionResponse {
  commit?: string;
}

/**
 * @param apiBaseUrl origin/base to read `/version` from; when absent/empty the hook stays inert.
 * @param fetchImpl  injectable `fetch` (testing seam); defaults to the global when present.
 * @returns the API commit once resolved, else `undefined`.
 */
export function useApiCommit(apiBaseUrl?: string, fetchImpl?: typeof fetch): string | undefined {
  const [commit, setCommit] = useState<string | undefined>(undefined);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (apiBaseUrl === undefined || apiBaseUrl === '') return;
    const doFetch = fetchImpl ?? (typeof fetch !== 'undefined' ? fetch : undefined);
    if (doFetch === undefined) return;

    void (async () => {
      try {
        const res = await doFetch(`${trimTrailingSlash(apiBaseUrl)}/version`);
        if (!res.ok) return;
        const body = (await res.json()) as VersionResponse;
        const value = body.commit;
        if (mountedRef.current && value !== undefined && value !== '') setCommit(value);
      } catch {
        // Best-effort: any failure leaves the commit undefined; the footer shows the version alone.
        return;
      }
    })();
  }, [apiBaseUrl, fetchImpl]);

  return commit;
}
