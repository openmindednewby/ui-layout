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
import { render, screen, fireEvent } from '@testing-library/react';

import { ModalDropdown } from './ModalDropdown';
import { DropdownVariant } from './DropdownVariant';

/** Jest only permits out-of-scope refs in a module factory when the name starts with `mock`. */
const mockIsOpenSeen: boolean[] = [];

jest.mock('./InlineMenu', () => ({
  InlineMenu: (props: { isOpen: boolean }) => {
    mockIsOpenSeen.push(props.isOpen);
    return null;
  },
}));

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
});
