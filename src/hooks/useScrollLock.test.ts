import { renderHook } from '@testing-library/react';

import { useScrollLock } from './useScrollLock';

describe('useScrollLock', () => {
  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('locks body overflow while enabled and restores it on unmount', () => {
    document.body.style.overflow = 'scroll';
    const { unmount } = renderHook(() => useScrollLock(true));

    expect(document.body.style.overflow).toBe('hidden');

    unmount();

    expect(document.body.style.overflow).toBe('scroll');
  });

  it('leaves overflow untouched while disabled', () => {
    document.body.style.overflow = 'auto';
    renderHook(() => useScrollLock(false));

    expect(document.body.style.overflow).toBe('auto');
  });
});
