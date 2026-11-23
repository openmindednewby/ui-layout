import { fireEvent, render, screen } from '@testing-library/react';

import { MIN_TARGET_PX } from '../constants';
import { ChipOverflow } from '../SectionIndexLayout/ChipOverflow';
import { TabsVariant } from './TabsVariant';
import { UnderlineTabs } from './UnderlineTabs';

const TABS = [
  { key: 'screening', label: 'Screening', testID: 'chip-screening' },
  { key: 'matches', label: 'Matches', count: 3, testID: 'chip-matches' },
];

describe('UnderlineTabs chips variant', () => {
  it('with the active key, marks only that chip selected', () => {
    render(<UnderlineTabs accessibilityLabel="jump" activeKey="matches" tabs={TABS} variant={TabsVariant.Chips} onChange={jest.fn()} />);

    const selected = screen.getAllByRole('tab').map((tab) => tab.getAttribute('aria-selected'));

    expect(selected).toEqual(['false', 'true']);
  });

  it('when a chip is pressed, calls onChange with its key', () => {
    const onChange = jest.fn();
    render(<UnderlineTabs accessibilityLabel="jump" activeKey="screening" tabs={TABS} variant={TabsVariant.Chips} onChange={onChange} />);

    fireEvent.click(screen.getByTestId('chip-matches'));

    expect(onChange).toHaveBeenCalledWith('matches');
  });

  it('with a count on a chip, shows the count after the label', () => {
    render(<UnderlineTabs accessibilityLabel="jump" activeKey="screening" tabs={TABS} variant={TabsVariant.Chips} onChange={jest.fn()} />);

    const text = screen.getByTestId('chip-matches').textContent;

    expect(text).toBe('Matches3');
  });

  it('with the default overflow, puts the chips in a horizontal scroll tablist', () => {
    render(<UnderlineTabs accessibilityLabel="jump" activeKey="screening" tabs={TABS} variant={TabsVariant.Chips} onChange={jest.fn()} />);

    const overflowX = window.getComputedStyle(screen.getByRole('tablist')).overflowX;

    expect(overflowX).toBe('auto');
  });

  it('with wrap overflow, keeps every chip inside one labelled tablist', () => {
    render(<UnderlineTabs accessibilityLabel="jump" activeKey="screening" chipOverflow={ChipOverflow.Wrap} tabs={TABS} variant={TabsVariant.Chips} onChange={jest.fn()} />);

    const tabCount = screen.getByRole('tablist', { name: 'jump' }).querySelectorAll('[role="tab"]').length;

    expect(tabCount).toBe(TABS.length);
  });

  it('on every chip, has a 44px minimum height', () => {
    render(<UnderlineTabs accessibilityLabel="jump" activeKey="screening" tabs={TABS} variant={TabsVariant.Chips} onChange={jest.fn()} />);

    const heights = TABS.map((tab) => window.getComputedStyle(screen.getByTestId(tab.testID)).minHeight);

    expect(heights).toEqual([`${MIN_TARGET_PX}px`, `${MIN_TARGET_PX}px`]);
  });
});
