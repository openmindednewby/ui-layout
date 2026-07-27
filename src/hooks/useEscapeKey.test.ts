import { fireEvent, renderHook } from '@testing-library/react';

import { useEscapeKey } from './useEscapeKey';

describe('useEscapeKey', () => {
  it('calls onClose when Escape is pressed while enabled', () => {
    const onClose = jest.fn();
    renderHook(() => useEscapeKey(true, onClose));

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('ignores non-Escape keys', () => {
    const onClose = jest.fn();
    renderHook(() => useEscapeKey(true, onClose));

    fireEvent.keyDown(document, { key: 'Enter' });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not listen while disabled', () => {
    const onClose = jest.fn();
    renderHook(() => useEscapeKey(false, onClose));

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('removes the listener on unmount', () => {
    const onClose = jest.fn();
    const { unmount } = renderHook(() => useEscapeKey(true, onClose));

    unmount();
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).not.toHaveBeenCalled();
  });
});
