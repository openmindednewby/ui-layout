jest.mock('react-native', () => {
  const actual = jest.requireActual('react-native');
  return {
    ...actual,
    useWindowDimensions: () => ({ width: 375, height: 812, scale: 1, fontScale: 1 }),
  };
});

import { render, screen } from '@testing-library/react';

import { Tabs } from './Tabs';

const TABS = [
  { key: 'all', label: 'All', testID: 'tab-all' },
  { key: 'review', label: 'Review', testID: 'tab-review' },
] as const;

const hintOf = (triggerTestID: string): string | null => {
  const describedBy = screen.getByTestId(triggerTestID).getAttribute('aria-describedby') ?? '';
  return document.getElementById(describedBy)?.textContent ?? null;
};

describe('Tabs accessibilityHint', () => {
  const noop = (): void => undefined;

  it('with a hint given, announces it on the collapsed menu trigger', () => {
    render(
      <Tabs tabs={TABS} activeKey="all" onChange={noop} accessibilityLabel="Queues" accessibilityHint="Switches the case queue" idPrefix="q" />,
    );

    const hint = hintOf('q-menu');

    expect(hint).toBe('Switches the case queue');
  });

  it('with no hint given, keeps the kit tabs-menu hint', () => {
    render(<Tabs tabs={TABS} activeKey="all" onChange={noop} accessibilityLabel="Queues" idPrefix="q" />);

    const hint = hintOf('q-menu');

    expect(hint).not.toBeNull();
    expect(hint).not.toBe('Switches the case queue');
    expect(hint).not.toBe('');
  });
});
