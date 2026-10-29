import { fireEvent, render, screen } from '@testing-library/react';

import { DropdownVariant } from './DropdownVariant';
import { ModalDropdown } from './ModalDropdown';
import { SelectedMarker } from './SelectedMarker';

const OPTIONS = [
  { label: 'Admin', value: 'admin' },
  { label: 'Organizer', value: 'organizer' },
];

function openMenu(onChange: (value: string) => void, selectedMarker?: SelectedMarker): HTMLElement {
  render(
    <ModalDropdown
      accessibilityHint="Switch dashboard"
      accessibilityLabel="Organizer"
      options={OPTIONS}
      selectedMarker={selectedMarker}
      testID="dash"
      value="organizer"
      variant={DropdownVariant.Menu}
      onChange={onChange}
    />,
  );
  const trigger = screen.getByTestId('dash');
  fireEvent.click(trigger);
  return trigger;
}

describe('ModalDropdown inline menu', () => {
  it('on the anchored menu, gives the trigger a menu popup and the rows the menuitem role', () => {
    const trigger = openMenu(jest.fn());

    const row = screen.getByTestId('dash-option-admin');

    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(row.getAttribute('role')).toBe('menuitem');
  });

  it('on the modal variant, gives the trigger a dialog popup', () => {
    render(
      <ModalDropdown
        accessibilityHint="Switch dashboard"
        accessibilityLabel="Organizer"
        options={OPTIONS}
        testID="dash"
        value="organizer"
        variant={DropdownVariant.Modal}
        onChange={jest.fn()}
      />,
    );

    const trigger = screen.getByTestId('dash');

    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
  });

  it('with the accent-check marker, marks only the selected row as current with a check', () => {
    openMenu(jest.fn(), SelectedMarker.AccentCheck);

    const current = screen.getByTestId('dash-option-organizer');

    expect(current.getAttribute('aria-current')).toBe('true');
    expect(screen.getByTestId('dash-option-organizer-check')).toBeTruthy();
    expect(screen.queryByTestId('dash-option-admin-check')).toBeNull();
    expect(screen.getByTestId('dash-option-admin').getAttribute('aria-current')).toBeNull();
  });

  it('without a marker, renders no check on the selected row', () => {
    openMenu(jest.fn());

    const check = screen.queryByTestId('dash-option-organizer-check');

    expect(check).toBeNull();
  });

  it('when a row is chosen, reports its value and returns focus to the trigger', () => {
    const onChange = jest.fn();
    const trigger = openMenu(onChange, SelectedMarker.AccentCheck);

    fireEvent.click(screen.getByTestId('dash-option-admin'));

    expect(onChange).toHaveBeenCalledWith('admin');
    expect(document.activeElement).toBe(trigger);
  });
});
