/**
 * Component-level proof that BELOW the collapse breakpoint the Tabs strip becomes
 * a genuine menu (the mobile affordance) — the viewport width is mocked narrow
 * via `useWindowDimensions`, mirroring `ModalDropdown.responsive.test.tsx`.
 */
jest.mock('react-native', () => {
  const actual = jest.requireActual('react-native');
  return {
    ...actual,
    useWindowDimensions: () => ({ width: 375, height: 812, scale: 1, fontScale: 1 }),
  };
});

import { render, screen, fireEvent } from '@testing-library/react';

import { Tabs } from './Tabs';
import { TabsCollapsedTrigger } from './TabsCollapsedTrigger';

const TABS = [
  { key: 'overview', label: 'Overview', testID: 'tab-overview' },
  { key: 'passes', label: 'Passes', testID: 'tab-passes' },
  { key: 'door', label: 'Door', testID: 'tab-door' },
] as const;

describe('Tabs — collapsed (mobile) menu', () => {
  const noop = (): void => undefined;

  it('renders a menu trigger, not a tablist, below the breakpoint', () => {
    render(
      <Tabs tabs={TABS} activeKey="overview" onChange={noop} accessibilityLabel="Organizer sections" idPrefix="org" />,
    );
    expect(screen.queryByRole('tablist')).toBeNull();
    expect(screen.getByTestId('org-menu')).toBeTruthy();
  });

  it('shows the active tab label on the collapsed trigger', () => {
    render(
      <Tabs tabs={TABS} activeKey="passes" onChange={noop} accessibilityLabel="Organizer sections" idPrefix="org" />,
    );
    expect(screen.getByTestId('org-menu').textContent).toContain('Passes');
  });

  it('presents the collapsed trigger as a focusable menu control with a caret, not a static chip', () => {
    render(
      <Tabs tabs={TABS} activeKey="passes" onChange={noop} accessibilityLabel="Organizer sections" idPrefix="org" />,
    );
    const trigger = screen.getByTestId('org-menu');
    // The caret is the menu affordance the live chip was missing.
    expect(trigger.textContent).toContain('▾');
    // A primary nav control MUST be keyboard-reachable — the live defect rendered tabindex="-1".
    expect(trigger.getAttribute('tabindex')).not.toBe('-1');
    // role=button so Enter/Space activate it (native <button> element under react-native-web).
    expect(trigger.getAttribute('role')).toBe('button');
  });

  it('keeps the descriptor per-tab testIDs resolvable once the menu is open', () => {
    render(
      <Tabs tabs={TABS} activeKey="overview" onChange={noop} accessibilityLabel="Organizer sections" idPrefix="org" />,
    );
    fireEvent.click(screen.getByTestId('org-menu'));
    expect(screen.getByTestId('tab-passes')).toBeTruthy();
  });

  it('emits the chosen tab key when a menu option is selected', () => {
    const onChange = jest.fn();
    render(
      <Tabs tabs={TABS} activeKey="overview" onChange={onChange} accessibilityLabel="Organizer sections" idPrefix="org" />,
    );
    fireEvent.click(screen.getByTestId('org-menu'));
    fireEvent.click(screen.getByTestId('tab-passes'));
    expect(onChange).toHaveBeenCalledWith('passes');
  });

  it('still renders the active panel, labelled by the active tab id, in collapsed mode', () => {
    render(
      <Tabs tabs={TABS} activeKey="passes" onChange={noop} accessibilityLabel="Organizer sections" idPrefix="org">
        <div data-testid="active-panel">passes panel</div>
      </Tabs>,
    );
    expect(screen.getByTestId('active-panel').textContent).toBe('passes panel');
    expect(document.getElementById('org-panel-passes')?.getAttribute('aria-labelledby')).toBe('org-tab-passes');
  });

  it('falls back to the {idPrefix}-tab-{key} testID for tabs without a descriptor testID', () => {
    const bare = [
      { key: 'a', label: 'Alpha' },
      { key: 'b', label: 'Beta' },
    ] as const;
    render(<Tabs tabs={bare} activeKey="a" onChange={noop} accessibilityLabel="Sections" idPrefix="s" />);
    fireEvent.click(screen.getByTestId('s-menu'));
    expect(screen.getByTestId('s-tab-b')).toBeTruthy();
  });
});

describe('Tabs — collapsed trigger presentation (caret vs hamburger)', () => {
  const noop = (): void => undefined;
  const HAMBURGER = '☰';
  const CARET = '▾';

  it('defaults to the caret affordance (no hamburger) when collapsedTrigger is omitted', () => {
    render(
      <Tabs tabs={TABS} activeKey="door" onChange={noop} accessibilityLabel="Organizer sections" idPrefix="org" />,
    );
    const trigger = screen.getByTestId('org-menu');
    expect(trigger.textContent).toContain(CARET);
    expect(trigger.textContent).not.toContain(HAMBURGER);
  });

  it('renders a ☰ hamburger (and no caret) when collapsedTrigger=Hamburger', () => {
    render(
      <Tabs
        tabs={TABS}
        activeKey="door"
        onChange={noop}
        accessibilityLabel="Organizer sections"
        idPrefix="org"
        collapsedTrigger={TabsCollapsedTrigger.Hamburger}
      />,
    );
    const trigger = screen.getByTestId('org-menu');
    expect(trigger.textContent).toContain(HAMBURGER);
    expect(trigger.textContent).not.toContain(CARET);
    // The active section label still rides alongside the hamburger.
    expect(trigger.textContent).toContain('Door');
  });

  it('keeps the menu behaviour (opens the list, resolves per-tab testIDs, emits keys) as a hamburger', () => {
    const onChange = jest.fn();
    render(
      <Tabs
        tabs={TABS}
        activeKey="overview"
        onChange={onChange}
        accessibilityLabel="Organizer sections"
        idPrefix="org"
        collapsedTrigger={TabsCollapsedTrigger.Hamburger}
      />,
    );
    const trigger = screen.getByTestId('org-menu');
    // Still keyboard-reachable and a real menu button.
    expect(trigger.getAttribute('role')).toBe('button');
    expect(trigger.getAttribute('tabindex')).not.toBe('-1');
    fireEvent.click(trigger);
    expect(screen.getByTestId('tab-passes')).toBeTruthy();
    fireEvent.click(screen.getByTestId('tab-passes'));
    expect(onChange).toHaveBeenCalledWith('passes');
  });
});
