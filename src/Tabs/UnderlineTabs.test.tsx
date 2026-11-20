import { fireEvent, render, screen } from '@testing-library/react';

import { UnderlineTabs } from './UnderlineTabs';

const TABS = [
  { key: 'overview', label: 'Overview', testID: 'tab-overview' },
  { key: 'checks', label: 'Checks', count: 2, testID: 'tab-checks' },
];

describe('UnderlineTabs', () => {
  it('with a count on a tab, shows the count only on that tab', () => {
    render(<UnderlineTabs accessibilityLabel="tabs" activeKey="overview" tabs={TABS} onChange={jest.fn()} />);

    const texts = [screen.getByTestId('tab-overview').textContent, screen.getByTestId('tab-checks').textContent];

    expect(texts).toEqual(['Overview', 'Checks2']);
  });

  it('when a tab is pressed, calls onChange with its key', () => {
    const onChange = jest.fn();
    render(<UnderlineTabs accessibilityLabel="tabs" activeKey="overview" tabs={TABS} onChange={onChange} />);

    fireEvent.click(screen.getByTestId('tab-checks'));

    expect(onChange).toHaveBeenCalledWith('checks');
  });

  it('with the active key, marks only that tab selected', () => {
    render(<UnderlineTabs accessibilityLabel="tabs" activeKey="checks" tabs={TABS} onChange={jest.fn()} />);

    const selected = screen.getAllByRole('tab').map((tab) => tab.getAttribute('aria-selected'));

    expect(selected).toEqual(['false', 'true']);
  });
});
