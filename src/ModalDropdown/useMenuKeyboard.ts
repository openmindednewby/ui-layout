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
 *
 * WHY THE KEY LISTENER IS ON THE **CAPTURE** PHASE (a real bug this fixes): the trigger keeps DOM
 * focus while the menu is open, and react-native-web maps Enter on a focused Touchable to `onPress`.
 * React dispatches that from its ROOT container listener — an ancestor of the trigger but a
 * DESCENDANT of `document` — so on a BUBBLING listener React's handler ran FIRST: it toggled the
 * menu shut, React unmounted the popover, this effect's cleanup removed the very listener the event
 * was still travelling toward, and `document` never saw the Enter. Net effect: **Enter closed the
 * menu instead of selecting the highlighted option** — keyboard users could open and navigate a
 * dropdown but never choose with the keyboard. Listening in the CAPTURE phase puts this handler
 * ahead of React's, and `stopPropagation` on the keys the open menu owns keeps the trigger from
 * re-toggling behind our back.
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

/**
 * An OPEN menu owns these keys: swallow them so the still-focused trigger (whose Enter
 * react-native-web maps to `onPress`) cannot toggle the menu shut behind the handler's back.
 */
function claimKey(event: KeyboardEvent): void {
  event.preventDefault();
  event.stopPropagation();
}

function buildKeyHandler(params: MenuKeyboardParams): (event: KeyboardEvent) => void {
  const { itemCount, onHighlightChange, onSelectHighlighted, onClose } = params;

  return (event: KeyboardEvent): void => {
    switch (event.key) {
      case 'ArrowDown':
        claimKey(event);
        onHighlightChange((prev) => clampIndex(prev + 1, itemCount));
        return;
      case 'ArrowUp':
        claimKey(event);
        onHighlightChange((prev) => clampIndex(prev - 1, itemCount));
        return;
      case 'Home':
        claimKey(event);
        onHighlightChange(() => 0);
        return;
      case 'End':
        claimKey(event);
        onHighlightChange(() => clampIndex(itemCount - 1, itemCount));
        return;
      case 'Enter':
        claimKey(event);
        onSelectHighlighted();
        return;
      case 'Escape':
        claimKey(event);
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

    // CAPTURE phase — see the file header: on the bubble phase React's root listener (the trigger's
    // Enter → onPress) ran first, closed the menu, and unmounted this listener mid-flight, so Enter
    // never selected. Capture puts the open menu's keys ahead of it.
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('mousedown', onMouseDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('mousedown', onMouseDown);
    };
    // `params` is rebuilt each render; the primitive/callback members it carries are the real deps.
  }, [containerRef, menuRef, enabled, onClose, params]);
}
