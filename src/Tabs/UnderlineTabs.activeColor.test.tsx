import { render, screen } from '@testing-library/react';

import { TabsVariant } from './TabsVariant';
import { UnderlineTabs } from './UnderlineTabs';

const TABS = [
  { key: 'open', label: 'Open', testID: 'tab-open' },
  { key: 'done', label: 'Done', testID: 'tab-done' },
];
const ACTIVE_FILL = '#0ea5e9';
const ACTIVE_FILL_RGB = 'rgb(14, 165, 233)';
const ACTIVE_TEXT = '#03121f';
const ACTIVE_TEXT_RGB = 'rgb(3, 18, 31)';

const colorOf = (label: string): string => window.getComputedStyle(screen.getByText(label)).color;

describe('UnderlineTabs activeTextColor', () => {
  it('with an active text colour on underline tabs, paints only the selected label with it', () => {
    const activeTextColor = ACTIVE_TEXT;

    render(<UnderlineTabs accessibilityLabel="tabs" activeKey="open" activeTextColor={activeTextColor} tabs={TABS} onChange={jest.fn()} />);

    expect(colorOf('Open')).toBe(ACTIVE_TEXT_RGB);
    expect(colorOf('Done')).not.toBe(ACTIVE_TEXT_RGB);
  });
});

describe('UnderlineTabs activeFillColor', () => {
  it('with an active fill and text colour on chips, fills the selected chip and inks its label', () => {
    const variant = TabsVariant.Chips;

    render(<UnderlineTabs accessibilityLabel="tabs" activeFillColor={ACTIVE_FILL} activeKey="open" activeTextColor={ACTIVE_TEXT} tabs={TABS} variant={variant} onChange={jest.fn()} />);

    expect(window.getComputedStyle(screen.getByTestId('tab-open')).backgroundColor).toBe(ACTIVE_FILL_RGB);
    expect(colorOf('Open')).toBe(ACTIVE_TEXT_RGB);
    expect(window.getComputedStyle(screen.getByTestId('tab-done')).backgroundColor).not.toBe(ACTIVE_FILL_RGB);
  });

  it('with no active colours on chips, keeps the default fill for the selected chip', () => {
    const variant = TabsVariant.Chips;

    render(<UnderlineTabs accessibilityLabel="tabs" activeKey="open" tabs={TABS} variant={variant} onChange={jest.fn()} />);

    expect(window.getComputedStyle(screen.getByTestId('tab-open')).backgroundColor).not.toBe(ACTIVE_FILL_RGB);
    expect(colorOf('Open')).not.toBe(ACTIVE_TEXT_RGB);
  });
});
