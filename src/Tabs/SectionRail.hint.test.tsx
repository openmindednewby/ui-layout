let mockWidth = 1280;

jest.mock('react-native', () => {
  const actual = jest.requireActual('react-native');
  return {
    ...actual,
    useWindowDimensions: () => ({ width: mockWidth, height: 800, scale: 1, fontScale: 1 }),
  };
});

import { render, screen } from '@testing-library/react';

import { SectionRail } from './SectionRail';

const TABS = [
  { key: 'a', label: 'A', testID: 'tab-a' },
  { key: 'b', label: 'B', testID: 'tab-b' },
];
const MORE = { label: 'More', hint: 'Shows the other sections' };
const HINT = 'Switches the event section';

const hintOnTablist = (width: number): string | null => {
  mockWidth = width;
  render(<SectionRail accessibilityHint={HINT} accessibilityLabel="Sections" activeKey="a" more={MORE} onChange={jest.fn()} tabs={TABS} />);
  return screen.getByRole('tablist').getAttribute('aria-description');
};

describe('SectionRail accessibilityHint', () => {
  it('on a wide viewport, describes the rail tablist with the hint', () => {
    const width = 1280;

    const hint = hintOnTablist(width);

    expect(hint).toBe(HINT);
  });

  it('on a phone, describes the bottom bar tablist with the hint', () => {
    const width = 360;

    const hint = hintOnTablist(width);

    expect(hint).toBe(HINT);
  });
});
