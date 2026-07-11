import { render, screen, fireEvent } from '@testing-library/react';

import { ModalDropdown } from './ModalDropdown';
import { DropdownVariant } from './DropdownVariant';

const OPTIONS = [
  { label: 'Alpha', value: 'a' as const },
  { label: 'Beta', value: 'b' as const },
  { label: 'Gamma', value: 'g' as const },
];

type Value = (typeof OPTIONS)[number]['value'];

function renderDropdown(overrides?: {
  variant?: DropdownVariant;
  value?: Value;
  onChange?: (v: Value) => void;
}) {
  const onChange = overrides?.onChange ?? jest.fn();
  render(
    <ModalDropdown
      testID="risk-select"
      accessibilityLabel="Risk"
      accessibilityHint="Pick a risk level"
      value={overrides?.value ?? 'a'}
      variant={overrides?.variant}
      options={OPTIONS}
      onChange={onChange}
    />,
  );
  return { onChange };
}

describe('ModalDropdown inline menu variant', () => {
  it('opens the inline menu on trigger press (no modal backdrop)', () => {
    renderDropdown({ variant: DropdownVariant.Menu });
    expect(screen.queryByTestId('risk-select-menu')).toBeNull();
    fireEvent.click(screen.getByTestId('risk-select'));
    expect(screen.getByTestId('risk-select-menu')).toBeTruthy();
    expect(screen.queryByTestId('risk-select-backdrop')).toBeNull();
  });

  it('selects an option (calls onChange) and closes the menu', () => {
    const { onChange } = renderDropdown({ variant: DropdownVariant.Menu });
    fireEvent.click(screen.getByTestId('risk-select'));
    fireEvent.click(screen.getByTestId('risk-select-option-b'));
    expect(onChange).toHaveBeenCalledWith('b');
    expect(screen.queryByTestId('risk-select-menu')).toBeNull();
  });

  it('closes on Escape', () => {
    renderDropdown({ variant: DropdownVariant.Menu });
    fireEvent.click(screen.getByTestId('risk-select'));
    expect(screen.getByTestId('risk-select-menu')).toBeTruthy();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByTestId('risk-select-menu')).toBeNull();
  });

  it('closes on an outside mousedown', () => {
    renderDropdown({ variant: DropdownVariant.Menu });
    fireEvent.click(screen.getByTestId('risk-select'));
    expect(screen.getByTestId('risk-select-menu')).toBeTruthy();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByTestId('risk-select-menu')).toBeNull();
  });

  it('does not close when the mousedown is inside the menu', () => {
    renderDropdown({ variant: DropdownVariant.Menu });
    fireEvent.click(screen.getByTestId('risk-select'));
    fireEvent.mouseDown(screen.getByTestId('risk-select-menu'));
    expect(screen.getByTestId('risk-select-menu')).toBeTruthy();
  });

  it('selects the keyboard-highlighted option with ArrowDown + Enter', () => {
    // value 'a' => highlight starts at index 0; one ArrowDown moves to 'b'.
    const { onChange } = renderDropdown({ variant: DropdownVariant.Menu, value: 'a' });
    fireEvent.click(screen.getByTestId('risk-select'));
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('b');
    expect(screen.queryByTestId('risk-select-menu')).toBeNull();
  });

  it('does not render the inline menu while closed', () => {
    renderDropdown({ variant: DropdownVariant.Menu });
    expect(screen.queryByTestId('risk-select-menu')).toBeNull();
    expect(screen.getByText('Alpha')).toBeTruthy();
  });

  it('portals the open menu to document.body so it escapes ancestor stacking/overflow', () => {
    renderDropdown({ variant: DropdownVariant.Menu });
    fireEvent.click(screen.getByTestId('risk-select'));
    const menu = screen.getByTestId('risk-select-menu');
    // A portal renders the menu as a direct child of <body>, not nested under the anchor —
    // that is what lets it paint above later siblings (the case table / adjacent fields).
    expect(menu.parentElement).toBe(document.body);
  });
});

describe('ModalDropdown modal variant (explicit)', () => {
  it('opens a modal with a backdrop when the modal variant is forced', () => {
    renderDropdown({ variant: DropdownVariant.Modal });
    expect(screen.queryByTestId('risk-select-menu')).toBeNull();
    fireEvent.click(screen.getByTestId('risk-select'));
    expect(screen.getByTestId('risk-select-backdrop')).toBeTruthy();
  });

  it('calls onChange when a modal option is selected', () => {
    const { onChange } = renderDropdown({ variant: DropdownVariant.Modal });
    fireEvent.click(screen.getByTestId('risk-select'));
    fireEvent.click(screen.getByTestId('risk-select-option-g'));
    expect(onChange).toHaveBeenCalledWith('g');
  });
});

describe('ModalDropdown responsive default', () => {
  // jsdom reports a zero-width viewport (no layout), so the responsive default
  // resolves to the modal — demonstrating the modal-on-narrow branch end-to-end.
  it('falls back to the modal on a narrow viewport when no variant is given', () => {
    renderDropdown();
    fireEvent.click(screen.getByTestId('risk-select'));
    expect(screen.getByTestId('risk-select-backdrop')).toBeTruthy();
    expect(screen.queryByTestId('risk-select-menu')).toBeNull();
  });
});
