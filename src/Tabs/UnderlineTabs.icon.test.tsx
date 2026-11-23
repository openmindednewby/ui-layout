import { render, screen } from '@testing-library/react';

import { UnderlineTabs } from './UnderlineTabs';

describe('UnderlineTabs icon', () => {
  it('with an icon on a tab, renders the icon inside that tab before the label', () => {
    const tabs = [{ key: 'link', label: 'Send a link', icon: <span data-testid="icon-link" />, testID: 'tab-link' }];

    render(<UnderlineTabs accessibilityLabel="tabs" activeKey="link" tabs={tabs} onChange={jest.fn()} />);

    const tab = screen.getByTestId('tab-link');
    expect(tab.contains(screen.getByTestId('icon-link'))).toBe(true);
    expect(tab.textContent).toBe('Send a link');
  });
});
