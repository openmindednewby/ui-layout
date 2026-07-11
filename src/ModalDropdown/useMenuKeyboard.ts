/**
 * useMenuKeyboard — web-only keyboard navigation + click-outside dismissal for the
 * inline dropdown menu. No-op on native platforms (the modal variant is used there).
 *
 * While enabled it wires, on `document`:
 *   - ArrowDown / ArrowUp — move the highlight (clamped to the option range)
 *   - Home / End          — jump to first / last option
 *   - Enter               — select the highlighted option
 *   - Escape              — close the menu
 *   - mousedown outside the container AND the menu — close the menu
 *
 * On web the menu popover is portalled to `document.body` (to escape ancestor stacking contexts),
 * so it is NOT a DOM descendant of `containerRef`. The outside-click check therefore consults the
 * optional `menuRef` too, otherwise a mousedown on an option would count as "outside" and close the
 * menu before the option's click could select it.
 */
import { useEffect } from 'react';
import type { RefObject } from 'react';

import { Platform } from 'react-native';
import type { View } from 'react-native';

export interface MenuKeyboardParams {
  containerRef: RefObject<View | null>;
  /** The popover node (portalled on web); clicks inside it are NOT "outside". */
  menuRef?: RefObject<View | null>;
  enabled: boolean;
  itemCount: number;
  onHighlightChange: (next: (prev: number) => number) => void;
  onSelectHighlighted: () => void;
  onClose: () => void;
}

/** True when `target` is inside the DOM node held by `ref` (RN-web refs are HTMLElements at runtime). */
function refContains(ref: RefObject<View | null> | undefined, target: Node | null): boolean {
  if (ref === undefined) return false;
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- RN web ref is an HTMLElement at runtime
  const node = ref.current as unknown as HTMLElement | null;
  return node !== null && target !== null && node.contains(target);
}

const clampIndex = (index: number, itemCount: number): number => {
  if (index < 0) return 0;
  const lastIndex = itemCount - 1;
  return index > lastIndex ? lastIndex : index;
};

function buildKeyHandler(params: MenuKeyboardParams): (event: KeyboardEvent) => void {
  const { itemCount, onHighlightChange, onSelectHighlighted, onClose } = params;

  return (event: KeyboardEvent): void => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        onHighlightChange((prev) => clampIndex(prev + 1, itemCount));
        return;
      case 'ArrowUp':
        event.preventDefault();
        onHighlightChange((prev) => clampIndex(prev - 1, itemCount));
        return;
      case 'Home':
        event.preventDefault();
        onHighlightChange(() => 0);
        return;
      case 'End':
        event.preventDefault();
        onHighlightChange(() => clampIndex(itemCount - 1, itemCount));
        return;
      case 'Enter':
        event.preventDefault();
        onSelectHighlighted();
        return;
      case 'Escape':
        event.preventDefault();
        onClose();
        return;
      default:
    }
  };
}

export function useMenuKeyboard(params: MenuKeyboardParams): void {
  const { containerRef, menuRef, enabled, onClose } = params;

  useEffect(() => {
    if (Platform.OS !== 'web' || !enabled) return;

    const onKeyDown = buildKeyHandler(params);

    const onMouseDown = (event: MouseEvent): void => {
      const target = event.target instanceof Node ? event.target : null;
      const insideAnchor = refContains(containerRef, target);
      const insideMenu = refContains(menuRef, target);
      if (!insideAnchor && !insideMenu) onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onMouseDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onMouseDown);
    };
    // `params` is rebuilt each render; the primitive/callback members it carries are the real deps.
  }, [containerRef, menuRef, enabled, onClose, params]);
}
