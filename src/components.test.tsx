import { render, screen, fireEvent } from '@testing-library/react';

import { Section } from './Section/Section';
import { Heading } from './Heading/Heading';
import { StatusBadge } from './StatusBadge/StatusBadge';
import { UpgradePrompt } from './UpgradePrompt/UpgradePrompt';
import { ModalDropdown } from './ModalDropdown/ModalDropdown';
import { DropdownVariant } from './ModalDropdown/DropdownVariant';

// Read theme/translate from @dloizides/ui-feedback's default context (no provider needed in tests).

describe('Heading', () => {
  it('renders heading text at the heading testID', () => {
    render(<Heading text="Account" />);
    expect(screen.getByTestId('heading-text')).toBeTruthy();
    expect(screen.getByText('Account')).toBeTruthy();
  });
});

describe('Section', () => {
  it('renders its children', () => {
    render(<Section><Heading text="Inside" /></Section>);
    expect(screen.getByText('Inside')).toBeTruthy();
  });
});

describe('StatusBadge', () => {
  it('renders the label with the default testID', () => {
    render(<StatusBadge label="Active" color="#0a0" backgroundColor="#efe" />);
    expect(screen.getByTestId('status-label')).toBeTruthy();
    expect(screen.getByText('Active')).toBeTruthy();
  });
});

describe('UpgradePrompt', () => {
  it('renders the CTA and shows the dismiss button only when onDismiss is given', () => {
    const onDismiss = jest.fn();
    render(<UpgradePrompt requiredTier="Pro" currentTier="Free" onDismiss={onDismiss} />);
    expect(screen.getByTestId('upgrade-prompt')).toBeTruthy();
    expect(screen.getByTestId('upgrade-prompt-cta')).toBeTruthy();
    fireEvent.click(screen.getByTestId('upgrade-prompt-dismiss'));
    expect(onDismiss).toHaveBeenCalled();
  });
});

describe('ModalDropdown', () => {
  it('shows the selected label and opens the modal when the modal variant is forced', () => {
    const onChange = jest.fn();
    render(
      <ModalDropdown
        testID="plan-select"
        accessibilityLabel="Plan"
        accessibilityHint="Pick a plan"
        value="a"
        variant={DropdownVariant.Modal}
        options={[{ label: 'Alpha', value: 'a' }, { label: 'Beta', value: 'b' }]}
        onChange={onChange}
      />
    );
    expect(screen.getByTestId('plan-select')).toBeTruthy();
    expect(screen.getByText('Alpha')).toBeTruthy();
    fireEvent.click(screen.getByTestId('plan-select'));
    expect(screen.getByTestId('plan-select-backdrop')).toBeTruthy();
  });
});
