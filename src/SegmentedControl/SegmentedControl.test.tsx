import { render, screen, fireEvent } from '@testing-library/react';

import { SegmentedControl } from './SegmentedControl';

// Reads theme/translate from @dloizides/ui-feedback's default context (no provider needed).

const OPTIONS = [
  { label: 'All PEPs', value: 'peps', testID: 'seg-peps' },
  { label: 'Leaders', value: 'leaders', testID: 'seg-leaders' },
] as const;

describe('SegmentedControl', () => {
  const noop = (): void => undefined;

  it('renders every segment label', () => {
    render(<SegmentedControl options={OPTIONS} value="peps" onChange={noop} accessibilityLabel="Catalog view" testID="seg" />);
    expect(screen.getByTestId('seg')).toBeTruthy();
    expect(screen.getByText('All PEPs')).toBeTruthy();
    expect(screen.getByText('Leaders')).toBeTruthy();
  });

  it('marks the selected segment via accessibilityState (aria-selected on web)', () => {
    render(<SegmentedControl options={OPTIONS} value="leaders" onChange={noop} accessibilityLabel="Catalog view" />);
    expect(screen.getByTestId('seg-leaders').getAttribute('aria-selected')).toBe('true');
    expect(screen.getByTestId('seg-peps').getAttribute('aria-selected')).toBe('false');
  });

  it('emits the pressed segment value', () => {
    const onChange = jest.fn();
    render(<SegmentedControl options={OPTIONS} value="peps" onChange={onChange} accessibilityLabel="Catalog view" />);
    fireEvent.click(screen.getByTestId('seg-leaders'));
    expect(onChange).toHaveBeenCalledWith('leaders');
  });

  it('exposes the group as a tablist', () => {
    render(<SegmentedControl options={OPTIONS} value="peps" onChange={noop} accessibilityLabel="Catalog view" testID="seg" />);
    expect(screen.getByTestId('seg').getAttribute('role')).toBe('tablist');
  });
});
