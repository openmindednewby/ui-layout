import { LAYOUT_COLLAPSE_BREAKPOINT, MIN_TARGET_PX, TYPE_SCALE_BREAKPOINT } from './constants';
import { isWideWebViewport } from './responsive';

describe('shared breakpoints', () => {
  it('keeps the two breakpoints distinct — type scales before layout collapses', () => {
    expect(TYPE_SCALE_BREAKPOINT).toBe(600);
    expect(LAYOUT_COLLAPSE_BREAKPOINT).toBe(768);
    expect(TYPE_SCALE_BREAKPOINT).toBeLessThan(LAYOUT_COLLAPSE_BREAKPOINT);
  });

  it('pins the minimum hit box at the WCAG 2.5.5 value', () => {
    expect(MIN_TARGET_PX).toBe(44);
  });
});

describe('isWideWebViewport', () => {
  it('is true on web at exactly the breakpoint (inclusive lower bound)', () => {
    expect(isWideWebViewport(LAYOUT_COLLAPSE_BREAKPOINT, 'web')).toBe(true);
  });

  it('is false one pixel below the breakpoint', () => {
    expect(isWideWebViewport(LAYOUT_COLLAPSE_BREAKPOINT - 1, 'web')).toBe(false);
  });

  it('is false on native at any width, including a tablet-wide one', () => {
    expect(isWideWebViewport(1440, 'ios')).toBe(false);
    expect(isWideWebViewport(1440, 'android')).toBe(false);
  });

  it('honours an explicit breakpoint over the default', () => {
    expect(isWideWebViewport(700, 'web', TYPE_SCALE_BREAKPOINT)).toBe(true);
    expect(isWideWebViewport(700, 'web')).toBe(false);
  });

  it('is false at the 360px mobile floor the standard designs against', () => {
    expect(isWideWebViewport(360, 'web')).toBe(false);
  });
});
