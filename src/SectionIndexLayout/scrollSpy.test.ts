import { pickActiveIndex, pickSpyIndex, resolveSticky, SPY_ACTIVATION_RATIO, SPY_CLICK_LOCK_MS } from './scrollSpy';

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

describe('pickSpyIndex', () => {
  it('with the scroller at its end, picks the last section even when it never reaches the line', () => {
    const viewport = { top: 0, height: 1000, atEnd: true };

    const index = pickSpyIndex([-1000, -100, 600], viewport, 0.3);

    expect(index).toBe(2);
  });

  it('with an inner scroller below the window top, measures the line inside that scroller', () => {
    const viewport = { top: 400, height: 400, atEnd: false };

    const index = pickSpyIndex([-200, 450, 1050], viewport, 0.3);

    expect(index).toBe(1);
  });
});
