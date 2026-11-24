import { pickActiveIndex, resolveSticky, spyRootMargin, SPY_ACTIVATION_RATIO, SPY_CLICK_LOCK_MS } from './scrollSpy';

describe('pickActiveIndex', () => {
  it('with no section at the line yet, picks the first', () => {
    const tops = [120, 900, 1600];

    const index = pickActiveIndex(tops, 100);

    expect(index).toBe(0);
  });

  it('with two sections above the line, picks the lower one', () => {
    const tops = [-800, 40, 700];

    const index = pickActiveIndex(tops, 100);

    expect(index).toBe(1);
  });

  it('with a top exactly on the line, counts it as reached', () => {
    const tops = [-300, 100, 500];

    const index = pickActiveIndex(tops, 100);

    expect(index).toBe(1);
  });
});

describe('resolveSticky', () => {
  it('with false, turns off both the sticky rail and the spy', () => {
    const resolved = resolveSticky(false);

    expect(resolved).toEqual({ sticky: false, spy: false, activationRatio: SPY_ACTIVATION_RATIO, clickLockMs: SPY_CLICK_LOCK_MS });
  });

  it('with true, turns on the spy with the default line and lock', () => {
    const resolved = resolveSticky(true);

    expect(resolved).toEqual({ sticky: true, spy: true, activationRatio: 0.3, clickLockMs: 900 });
  });

  it('with a config, keeps the rail sticky and applies its overrides', () => {
    const resolved = resolveSticky({ scrollSpy: false, activationRatio: 0.5, clickLockMs: 200 });

    expect(resolved).toEqual({ sticky: true, spy: false, activationRatio: 0.5, clickLockMs: 200 });
  });
});

describe('spyRootMargin', () => {
  it('with a 0.3 line, trims the bottom 70 percent of the viewport', () => {
    const margin = spyRootMargin(0.3);

    expect(margin).toBe('0px 0px -70% 0px');
  });
});
