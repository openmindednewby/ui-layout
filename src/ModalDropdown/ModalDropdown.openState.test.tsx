/**
 * The owner's half of the EXIT WINDOW defect (see `InlineMenu.exitWindow.test.tsx` for the full
 * story): `ModalDropdown` must hand `InlineMenu` its LOGICAL open state, not the fact that the
 * popover is still mounted for its fade-out.
 *
 * Recording the prop is what makes this deterministic. The render in which `isOpen` flips to
 * `false` happens while the popover is still mounted — React commits that render before the effect
 * that unmounts it — so the `false` is observable here whether or not the reduced-motion harness
 * leaves an animation window at all.
 */
import { createElement } from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import { ModalDropdown } from './ModalDropdown';
import { DropdownVariant } from './DropdownVariant';

/** Jest only permits out-of-scope refs in a module factory when the name starts with `mock`. */
const mockIsOpenSeen: boolean[] = [];

/**
 * A RECORDING PASSTHROUGH, not a stub: the first test needs the prop handed down, the second needs
 * the real popover DOM. Wrapping (rather than calling) the actual component keeps hooks legal.
 */
jest.mock('./InlineMenu', () => {
  const actual = jest.requireActual<typeof import('./InlineMenu')>('./InlineMenu');
  return {
    InlineMenu: (props: { isOpen: boolean }) => {
      mockIsOpenSeen.push(props.isOpen);
      return createElement(actual.InlineMenu, props as never);
    },
  };
});

/**
 * THE EXIT WINDOW, HELD OPEN. `jest.setup.ts` pins reduced motion, which collapses ui-motion to 0ms
 * so `mounted` flips false in the same flush as `isOpen` — the 120ms window the browser really has
 * is unreachable otherwise (see `InlineMenu.exitWindow.test.tsx` for what does NOT restore it).
 * Forcing `mounted` true reproduces exactly the state the fade leaves behind: logically closed,
 * still in the DOM. Nothing else about the motion contract is faked.
 */
jest.mock('@dloizides/ui-motion', () => {
  const actual = jest.requireActual<typeof import('@dloizides/ui-motion')>('@dloizides/ui-motion');
  return {
    ...actual,
    useEnterExit: (options: Parameters<typeof actual.useEnterExit>[0]) => ({
      ...actual.useEnterExit(options),
      mounted: true,
    }),
  };
});

const OPTIONS = [
  { label: 'Alpha', value: 'a' as const },
  { label: 'Beta', value: 'b' as const },
];

describe('ModalDropdown — hands InlineMenu its open state, not its mount state', () => {
  it('passes isOpen=true while open and isOpen=false the moment it closes', () => {
    render(
      <ModalDropdown
        testID="risk-select"
        accessibilityLabel="Risk"
        accessibilityHint="Pick a risk level"
        value="a"
        variant={DropdownVariant.Menu}
        options={OPTIONS}
        onChange={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByTestId('risk-select'));
    expect(mockIsOpenSeen).toContain(true);

    // Toggling the trigger, not Escape: `InlineMenu` is mocked here, so the real
    // `useMenuKeyboard` that would handle Escape is not installed.
    fireEvent.click(screen.getByTestId('risk-select'));

    // The LAST thing the popover was told before it goes away must be "you are closed" — that is
    // the signal that releases the document-capture keyboard listener.
    expect(mockIsOpenSeen[mockIsOpenSeen.length - 1]).toBe(false);
  });

  it('leaves the fading menu INERT — an option is unclickable and hidden during the exit window', () => {
    const onChange = jest.fn();
    render(
      <ModalDropdown
        testID="risk-select"
        accessibilityLabel="Risk"
        accessibilityHint="Pick a risk level"
        value="a"
        variant={DropdownVariant.Menu}
        options={OPTIONS}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByTestId('risk-select'));
    fireEvent.click(screen.getByTestId('risk-select'));

    // Still on screen: this IS the fade-out. Without it the rest of the test passes vacuously.
    const menu = screen.getByTestId('risk-select-menu');
    expect(menu.getAttribute('aria-hidden')).toBe('true');

    const fading = menu.firstElementChild as HTMLElement;
    // react-native-web may emit `pointerEvents` inline or via its injected stylesheet.
    const pointerEvents = fading.style.pointerEvents !== ''
      ? fading.style.pointerEvents
      : window.getComputedStyle(fading).pointerEvents;
    expect(pointerEvents).toBe('none');

    // The click race: a fast second click must not select from a menu the user already dismissed.
    fireEvent.click(screen.getByTestId('risk-select-option-b'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
