import { renderHook, waitFor } from '@testing-library/react';

import { useApiCommit } from './useApiCommit';

function jsonResponse(body: unknown, ok = true): Response {
  return { ok, json: async () => body } as unknown as Response;
}

describe('useApiCommit', () => {
  it('stays inert (no fetch) when no apiBaseUrl is given', () => {
    const fetchImpl = jest.fn();
    const { result } = renderHook(() => useApiCommit(undefined, fetchImpl as unknown as typeof fetch));
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(result.current).toBeUndefined();
  });

  it('GETs `${base}/version` and returns its commit', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse({ commit: 'abcdef1234' }));
    const { result } = renderHook(() =>
      useApiCommit('https://api.dev', fetchImpl as unknown as typeof fetch),
    );
    await waitFor(() => expect(result.current).toBe('abcdef1234'));
    expect(fetchImpl).toHaveBeenCalledWith('https://api.dev/version');
  });

  it('trims a trailing slash on the base before appending /version', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse({ commit: 'x' }));
    renderHook(() => useApiCommit('https://api.dev/', fetchImpl as unknown as typeof fetch));
    await waitFor(() => expect(fetchImpl).toHaveBeenCalledWith('https://api.dev/version'));
  });

  it('leaves the commit undefined on a non-ok response', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse({ commit: 'nope' }, false));
    const { result } = renderHook(() =>
      useApiCommit('https://api.dev', fetchImpl as unknown as typeof fetch),
    );
    await waitFor(() => expect(fetchImpl).toHaveBeenCalled());
    expect(result.current).toBeUndefined();
  });

  it('swallows a thrown fetch (offline) and stays undefined', async () => {
    const fetchImpl = jest.fn().mockRejectedValue(new Error('offline'));
    const { result } = renderHook(() =>
      useApiCommit('https://api.dev', fetchImpl as unknown as typeof fetch),
    );
    await waitFor(() => expect(fetchImpl).toHaveBeenCalled());
    expect(result.current).toBeUndefined();
  });

  it('ignores an empty commit in the payload', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse({ commit: '' }));
    const { result } = renderHook(() =>
      useApiCommit('https://api.dev', fetchImpl as unknown as typeof fetch),
    );
    await waitFor(() => expect(fetchImpl).toHaveBeenCalled());
    expect(result.current).toBeUndefined();
  });
});
