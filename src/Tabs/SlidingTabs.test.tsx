import { fireEvent, render, screen } from '@testing-library/react';

import { SlidingTabs } from './SlidingTabs';

const TABS = [
  { key: 'overview', label: 'Overview', testID: 'tab-overview' },
  { key: 'checks', label: 'Checks', count: 2, testID: 'tab-checks' },
  { key: 'activity', label: 'Activity', testID: 'tab-activity' },
];

describe('SlidingTabs', () => {
  it('when a tab is pressed, calls onChange with its key', () => {
    const onChange = jest.fn();
    render(<SlidingTabs accessibilityLabel="tabs" activeKey="overview" tabs={TABS} onChange={onChange} />);

    fireEvent.click(screen.getByTestId('tab-checks'));

    expect(onChange).toHaveBeenCalledWith('checks');
  });

  it('with ArrowRight on the selected tab, selects the next tab', () => {
    const onChange = jest.fn();
    render(<SlidingTabs accessibilityLabel="tabs" activeKey="checks" tabs={TABS} onChange={onChange} />);

    fireEvent.keyDown(screen.getByTestId('tab-checks'), { key: 'ArrowRight' });

    expect(onChange).toHaveBeenCalledWith('activity');
  });

  it('with End on the first tab, selects the last tab', () => {
    const onChange = jest.fn();
    render(<SlidingTabs accessibilityLabel="tabs" activeKey="overview" tabs={TABS} onChange={onChange} />);

    fireEvent.keyDown(screen.getByTestId('tab-overview'), { key: 'End' });

    expect(onChange).toHaveBeenCalledWith('activity');
  });

  it('with the active key, makes only the selected tab a tab stop', () => {
    render(<SlidingTabs accessibilityLabel="tabs" activeKey="checks" tabs={TABS} onChange={jest.fn()} />);

    const stops = screen.getAllByRole('tab').map((tab) => tab.getAttribute('tabindex'));

    expect(stops).toEqual(['-1', '0', '-1']);
  });

  it('with the active key, marks only that tab selected', () => {
    render(<SlidingTabs accessibilityLabel="tabs" activeKey="activity" tabs={TABS} onChange={jest.fn()} />);

    const selected = screen.getAllByRole('tab').map((tab) => tab.getAttribute('aria-selected'));

    expect(selected).toEqual(['false', 'false', 'true']);
  });
});
