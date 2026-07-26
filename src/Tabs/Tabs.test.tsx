import { render, screen, fireEvent } from '@testing-library/react';

import { Tabs } from './Tabs';

// Reads theme from @dloizides/ui-feedback's default context (no provider needed).

const TABS = [
  { key: 'overview', label: 'Overview', testID: 'tab-overview' },
  { key: 'passes', label: 'Passes', testID: 'tab-passes' },
  { key: 'door', label: 'Door', testID: 'tab-door' },
] as const;

describe('Tabs', () => {
  const noop = (): void => undefined;

  it('renders every tab label', () => {
    render(
      <Tabs tabs={TABS} activeKey="overview" onChange={noop} accessibilityLabel="Organizer sections" testID="tabs">
        <span>panel</span>
      </Tabs>,
    );
    expect(screen.getByText('Overview')).toBeTruthy();
    expect(screen.getByText('Passes')).toBeTruthy();
    expect(screen.getByText('Door')).toBeTruthy();
  });

  it('renders only the active tab panel content', () => {
    render(
      <Tabs tabs={TABS} activeKey="passes" onChange={noop} accessibilityLabel="Organizer sections">
        <div data-testid="active-panel">passes panel</div>
      </Tabs>,
    );
    expect(screen.getByTestId('active-panel').textContent).toBe('passes panel');
  });

  it('marks the active tab via aria-selected', () => {
    render(
      <Tabs tabs={TABS} activeKey="door" onChange={noop} accessibilityLabel="Organizer sections">
        <span>panel</span>
      </Tabs>,
    );
    expect(screen.getByTestId('tab-door').getAttribute('aria-selected')).toBe('true');
    expect(screen.getByTestId('tab-overview').getAttribute('aria-selected')).toBe('false');
    expect(screen.getByTestId('tab-passes').getAttribute('aria-selected')).toBe('false');
  });

  it('emits the pressed tab key', () => {
    const onChange = jest.fn();
    render(
      <Tabs tabs={TABS} activeKey="overview" onChange={onChange} accessibilityLabel="Organizer sections">
        <span>panel</span>
      </Tabs>,
    );
    fireEvent.click(screen.getByTestId('tab-passes'));
    expect(onChange).toHaveBeenCalledWith('passes');
  });

  it('emits the active tab key when the active tab is pressed (host decides to no-op)', () => {
    const onChange = jest.fn();
    render(
      <Tabs tabs={TABS} activeKey="overview" onChange={onChange} accessibilityLabel="Organizer sections">
        <span>panel</span>
      </Tabs>,
    );
    fireEvent.click(screen.getByTestId('tab-overview'));
    expect(onChange).toHaveBeenCalledWith('overview');
  });

  it('exposes the strip as a tablist and each control as a tab', () => {
    render(
      <Tabs tabs={TABS} activeKey="overview" onChange={noop} accessibilityLabel="Organizer sections">
        <span>panel</span>
      </Tabs>,
    );
    expect(screen.getByRole('tablist').getAttribute('aria-label')).toBe('Organizer sections');
    expect(screen.getByTestId('tab-overview').getAttribute('role')).toBe('tab');
  });

  it('wires aria-controls on the active tab to the panel id, and the panel back to the tab', () => {
    render(
      <Tabs tabs={TABS} activeKey="passes" onChange={noop} accessibilityLabel="Organizer sections" idPrefix="org">
        <div data-testid="active-panel">passes panel</div>
      </Tabs>,
    );
    const activeTab = screen.getByTestId('tab-passes');
    expect(activeTab.getAttribute('id')).toBe('org-tab-passes');
    expect(activeTab.getAttribute('aria-controls')).toBe('org-panel-passes');
  });

  it('links the rendered panel back to the active tab via aria-labelledby', () => {
    render(
      <Tabs tabs={TABS} activeKey="passes" onChange={noop} accessibilityLabel="Organizer sections" idPrefix="org">
        <div>passes panel</div>
      </Tabs>,
    );
    expect(document.getElementById('org-panel-passes')?.getAttribute('aria-labelledby')).toBe('org-tab-passes');
  });
});
