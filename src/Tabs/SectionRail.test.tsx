let mockWidth = 1280;

jest.mock('react-native', () => {
  const actual = jest.requireActual('react-native');
  return {
    ...actual,
    useWindowDimensions: () => ({ width: mockWidth, height: 800, scale: 1, fontScale: 1 }),
  };
});

import { fireEvent, render, screen } from '@testing-library/react';

import { MIN_TARGET_PX } from '../constants';
import { SectionRail } from './SectionRail';

const TABS = Array.from({ length: 11 }, (_unused, index) => ({ key: `s${index}`, label: `Section ${index}`, testID: `tab-s${index}` }));
const MORE = { label: 'More', hint: 'Shows the other sections' };

const renderRail = (onChange: (key: string) => void): void => {
  render(
    <SectionRail accessibilityLabel="Sections" activeKey="s0" more={MORE} onChange={onChange} tabs={TABS}>
      <span>panel</span>
    </SectionRail>,
  );
};

describe('SectionRail', () => {
  it('on a wide viewport, pressing a rail section emits its key', () => {
    mockWidth = 1280;
    const onChange = jest.fn();
    renderRail(onChange);

    fireEvent.click(screen.getByTestId('tab-s9'));

    expect(onChange).toHaveBeenCalledWith('s9');
  });

  it('on a wide viewport, every rail section has a 44px minimum height', () => {
    mockWidth = 1280;

    renderRail(jest.fn());

    expect(window.getComputedStyle(screen.getByTestId('tab-s3')).minHeight).toBe(`${MIN_TARGET_PX}px`);
  });

  it('on a phone, choosing a section from More emits its key and closes the list', () => {
    mockWidth = 360;
    const onChange = jest.fn();
    renderRail(onChange);
    fireEvent.click(screen.getByTestId('section-rail-more'));

    fireEvent.click(screen.getByTestId('tab-s9'));

    expect([onChange.mock.calls[0]?.[0], screen.queryByTestId('section-rail-more-sheet')]).toEqual(['s9', null]);
  });
});
