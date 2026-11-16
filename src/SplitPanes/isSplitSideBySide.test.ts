import { isSplitSideBySide } from './isSplitSideBySide';
import { SplitLayout } from './SplitLayout';

const BREAKPOINT = 768;

describe('isSplitSideBySide', () => {
  it('with Side at 360, stays side by side', () => {
    const layout = SplitLayout.Side;

    const result = isSplitSideBySide(layout, 360, BREAKPOINT);

    expect(result).toBe(true);
  });

  it('with Stack at 1280, stacks', () => {
    const layout = SplitLayout.Stack;

    const result = isSplitSideBySide(layout, 1280, BREAKPOINT);

    expect(result).toBe(false);
  });

  it('with Auto, stacks below the breakpoint and sits side by side at it', () => {
    const widths = [360, BREAKPOINT - 1, BREAKPOINT, 1280];

    const result = widths.map((w) => isSplitSideBySide(SplitLayout.Auto, w, BREAKPOINT));

    expect(result).toEqual([false, false, true, true]);
  });
});
