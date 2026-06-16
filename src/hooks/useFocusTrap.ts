/**
 * Traps keyboard focus within a container element on web.
 * No-op on native platforms where `<Modal>` handles focus containment.
 *
 * On enable: saves the previously focused element and focuses the first focusable child.
 * Tab wraps from last to first; Shift+Tab wraps from first to last. On disable/unmount:
 * restores focus to the saved element.
 */
import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

import { Platform } from 'react-native';
import type { View } from 'react-native';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
}

function savePreviousFocus(): HTMLElement | null {
  return document.activeElement instanceof HTMLElement ? document.activeElement : null;
}

function handleKeyDown(domNode: HTMLElement, event: KeyboardEvent): void {
  if (event.key !== 'Tab') return;

  const focusable = getFocusableElements(domNode);
  if (focusable.length === 0) {
    event.preventDefault();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (!first || !last) {
    event.preventDefault();
    return;
  }
  const active = document.activeElement;

  if (event.shiftKey && active === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

export function useFocusTrap(containerRef: RefObject<View | null>, enabled: boolean): void {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web' || !enabled) return;

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- RN web ref is an HTMLElement at runtime
    const domNode = containerRef.current as unknown as HTMLElement | null;
    if (!domNode) return;

    previousFocusRef.current = savePreviousFocus();
    queueMicrotask(() => getFocusableElements(domNode)[0]?.focus());

    const listener = (e: KeyboardEvent): void => handleKeyDown(domNode, e);
    domNode.addEventListener('keydown', listener);

    return () => {
      domNode.removeEventListener('keydown', listener);
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    };
  }, [containerRef, enabled]);
}
