import { renderHook } from '@testing-library/react';
import type { RefObject } from 'react';
import type { View } from 'react-native';

import { useFocusTrap } from './useFocusTrap';

const MAX_ATTACH_FRAMES = 10;

interface FrameQueue {
  runNext: () => void;
  runAll: () => void;
}

function mockAnimationFrames(): FrameQueue {
  const pending: FrameRequestCallback[] = [];
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    pending.push(callback);
    return pending.length;
  });
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);
  const runNext = (): void => pending.shift()?.(0);
  const runAll = (): void => {
    while (pending.length > 0) runNext();
  };
  return { runNext, runAll };
}

function buildDialog(): HTMLElement {
  const dialog = document.createElement('div');
  const button = document.createElement('button');
  button.setAttribute('data-testid', 'late-dialog-confirm');
  dialog.appendChild(button);
  document.body.appendChild(dialog);
  return dialog;
}

function asViewRef(ref: { current: HTMLElement | null }): RefObject<View | null> {
  return ref as unknown as RefObject<View | null>;
}

afterEach(() => {
  jest.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('useFocusTrap', () => {
  it('with a dialog that mounts three frames late, focuses its first control', async () => {
    const frames = mockAnimationFrames();
    const ref: { current: HTMLElement | null } = { current: null };
    renderHook(() => useFocusTrap(asViewRef(ref), true));
    frames.runNext();
    frames.runNext();
    ref.current = buildDialog();

    frames.runNext();

    await Promise.resolve();
    expect(document.activeElement).toBe(ref.current.querySelector('button'));
  });

  it('with a container that never mounts, stops retrying after ten frames', () => {
    const frames = mockAnimationFrames();
    const ref: { current: HTMLElement | null } = { current: null };
    renderHook(() => useFocusTrap(asViewRef(ref), true));

    frames.runAll();

    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(MAX_ATTACH_FRAMES);
  });
});
