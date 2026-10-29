import { fireEvent, render, screen } from '@testing-library/react';

import { DropdownVariant } from './DropdownVariant';
import { ModalDropdown } from './ModalDropdown';

const OPTIONS = [
  { label: 'Admin', value: 'admin' },
  { label: 'Organizer', value: 'organizer' },
];

function openDropdown(variant: DropdownVariant, menuHeading?: string): void {
  render(
    <ModalDropdown
      accessibilityHint="Switch dashboard"
      accessibilityLabel="Organizer"
      menuHeading={menuHeading}
      options={OPTIONS}
      testID="dash"
      value="organizer"
      variant={variant}
      onChange={jest.fn()}
    />,
  );
  fireEvent.click(screen.getByTestId('dash'));
}

describe('ModalDropdown menuHeading', () => {
  it('with a heading on the inline menu, shows it as a heading and names the menu by it', () => {
    openDropdown(DropdownVariant.Menu, 'Your dashboards');

    const heading = screen.getByTestId('dash-menu-heading');

    expect(heading.textContent).toBe('Your dashboards');
    expect(heading.getAttribute('role')).toBe('heading');
    expect(heading.getAttribute('tabindex')).toBeNull();
    expect(screen.getByTestId('dash-menu').getAttribute('aria-label')).toBe('Your dashboards');
  });

  it('with a heading on the modal, shows it as a heading and names the dialog by it', () => {
    openDropdown(DropdownVariant.Modal, 'Your dashboards');

    const heading = screen.getByTestId('dash-menu-heading');

    expect(heading.getAttribute('role')).toBe('heading');
    expect(screen.getByRole('dialog', { name: 'Your dashboards' })).toBeTruthy();
  });

  it('without a heading, renders no heading and names the menu by the trigger label', () => {
    openDropdown(DropdownVariant.Menu);

    const heading = screen.queryByTestId('dash-menu-heading');

    expect(heading).toBeNull();
    expect(screen.getByTestId('dash-menu').getAttribute('aria-label')).toBe('Organizer');
  });
});
