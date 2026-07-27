import { shouldCollapseTabs, TABS_COLLAPSE_BREAKPOINT } from './tabsResponsive';

describe('shouldCollapseTabs', () => {
  it('stays a row on a wide web viewport (>= breakpoint)', () => {
    expect(shouldCollapseTabs(1280, 'web', 768)).toBe(false);
  });

  it('collapses on a narrow web viewport (< breakpoint)', () => {
    expect(shouldCollapseTabs(500, 'web', 768)).toBe(true);
  });

  it('collapses one pixel below the breakpoint', () => {
    expect(shouldCollapseTabs(767, 'web', 768)).toBe(true);
  });

  it('stays a row exactly at the breakpoint (inclusive lower bound)', () => {
    expect(shouldCollapseTabs(768, 'web', 768)).toBe(false);
  });

  it('always collapses on native, however wide the device reports', () => {
    expect(shouldCollapseTabs(2000, 'ios', 768)).toBe(true);
    expect(shouldCollapseTabs(2000, 'android', 768)).toBe(true);
  });

  it('honours a caller-supplied breakpoint', () => {
    expect(shouldCollapseTabs(900, 'web', 1024)).toBe(true);
    expect(shouldCollapseTabs(1100, 'web', 1024)).toBe(false);
  });

  it('exposes the shared kit breakpoint as the default threshold', () => {
    expect(TABS_COLLAPSE_BREAKPOINT).toBe(768);
  });
});
