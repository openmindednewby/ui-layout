/**
 * THE EXIT WINDOW — a closing menu must stop owning the keyboard the moment it is logically closed,
 * not when it finally unmounts.
 *
 * `ModalDropdown` keeps `InlineMenu` MOUNTED past close so the popover can fade out
 * (`useEnterExit`'s `mounted`). `useMenuKeyboard` installs a DOCUMENT-CAPTURE keydown listener that
 * `preventDefault()`s + `stopPropagation()`s Enter/Escape/Arrows. While that listener was keyed on
 * MOUNT (`enabled: true`) rather than on the owner's open state, every keystroke landing in the
 * fade-out was swallowed: the trigger already reported `aria-expanded="false"`, yet Enter never
 * reached it, so react-native-web's native `<button>` never got the browser-synthesised click and
 * the dropdown would not re-open. Measured in a real browser as a ~120ms dead zone after every
 * selection, and as an intermittent E2E failure whose flakiness was purely "did the next keypress
 * land inside that window".
 *
 * WHY THE WINDOW IS NOT RE-CREATED HERE. The obvious test — select an option, then press a key
 * before the fade ends — cannot be written in this harness, and the reason is worth recording so
 * the next person does not spend the afternoon I did. `jest.setup.ts` pins REDUCED MOTION, which
 * collapses ui-motion to 0ms so mount/unmount resolve synchronously. Overriding `window.matchMedia`
 * per-test does NOT restore the window (measured), and neither does mocking our own
 * `useReducedMotion` (measured): react-native-web's `Animated` reads the reduced-motion setting
 * ITSELF and caches it at module load, long before any test body runs, and then completes every
 * animation synchronously. So the state under test is reached DIRECTLY — mount `InlineMenu` in the
 * mounted-but-closed state — and the owner's half is proved separately by recording what
 * `ModalDropdown` actually hands down. Together they cover the same defect without depending on
 * animation timing, which is what made the original E2E failure flaky in the first place.
 */
import { createRef } from 'react';

import { render, screen, fireEvent } from '@testing-library/react';
import { View } from 'react-native';
import type { View as RNView } from 'react-native';

import { InlineMenu } from './InlineMenu';

const OPTIONS = [
  { label: 'Alpha', value: 'a' as const },
  { label: 'Beta', value: 'b' as const },
];

function renderMenu(isOpen: boolean): { onSelect: jest.Mock; onClose: jest.Mock } {
  const onSelect = jest.fn();
  const onClose = jest.fn();
  const anchorRef = createRef<RNView>();
  render(
    <View ref={anchorRef}>
      <InlineMenu
        testID="risk-select"
        accessibilityLabel="Risk"
        value="a"
        options={OPTIONS}
        containerRef={anchorRef}
        isOpen={isOpen}
        onSelect={onSelect}
        onClose={onClose}
      />
    </View>,
  );
  return { onSelect, onClose };
}

describe('InlineMenu — the keyboard follows the OPEN state, not the mount', () => {
  it('claims the keys it owns while open', () => {
    const { onSelect, onClose } = renderMenu(true);

    // `fireEvent` returns dispatchEvent's result: false once anything called preventDefault().
    expect(fireEvent.keyDown(document, { key: 'Enter' })).toBe(false);
    expect(onSelect).toHaveBeenCalledWith('a');

    expect(fireEvent.keyDown(document, { key: 'Escape' })).toBe(false);
    expect(onClose).toHaveBeenCalled();
  });

  it('releases every key it owns once closed, even though it is still mounted', () => {
    const { onSelect, onClose } = renderMenu(false);

    // Still on screen — this is the fade-out, not an unmounted component. Without this the rest
    // of the test would pass vacuously.
    expect(screen.getByTestId('risk-select-menu')).toBeTruthy();

    expect(fireEvent.keyDown(document, { key: 'Enter' })).toBe(true);
    expect(fireEvent.keyDown(document, { key: 'Escape' })).toBe(true);
    expect(fireEvent.keyDown(document, { key: 'ArrowDown' })).toBe(true);
    expect(fireEvent.keyDown(document, { key: 'Home' })).toBe(true);

    // A swallowed Enter did not merely vanish — it ran the dying menu's selection handler.
    expect(onSelect).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
