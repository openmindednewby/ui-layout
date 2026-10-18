jest.mock('react-native', () => {
  const actual = jest.requireActual('react-native');
  return {
    ...actual,
    useWindowDimensions: () => ({ width: 1280, height: 800, scale: 1, fontScale: 1 }),
  };
});

import { render, screen } from '@testing-library/react';

import { MIN_TARGET_PX } from '../constants';
import { Tabs } from './Tabs';

const TABS = [
  { key: 'overview', label: 'Overview', testID: 'tab-overview' },
  { key: 'passes', label: 'Passes', testID: 'tab-passes' },
] as const;

describe('Tabs hit boxes', () => {
  it('on a wide viewport, every tab pill has a 44px minimum height', () => {
    const noop = (): void => undefined;

    render(
      <Tabs tabs={TABS} activeKey="overview" onChange={noop} accessibilityLabel="Sections">
        <span>panel</span>
      </Tabs>,
    );

    const heights = TABS.map((tab) => window.getComputedStyle(screen.getByTestId(tab.testID)).minHeight);
    expect(heights).toEqual([`${MIN_TARGET_PX}px`, `${MIN_TARGET_PX}px`]);
  });
});
