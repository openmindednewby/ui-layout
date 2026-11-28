import { indicatorTransition, TAB_INDICATOR_EASE } from './tabIndicatorTransition';

describe('indicatorTransition', () => {
  it('on web with motion allowed, slides left and width over 180 ms', () => {
    const style = indicatorTransition(false, 'web');

    expect(style).toEqual({ transitionDuration: '180ms', transitionProperty: 'left, width', transitionTimingFunction: TAB_INDICATOR_EASE });
  });

  it('on web under reduced motion, returns no transition so the underline jumps', () => {
    const style = indicatorTransition(true, 'web');

    expect(style).toEqual({});
  });

  it('on native, returns no CSS transition because Animated drives the slide', () => {
    const style = indicatorTransition(false, 'ios');

    expect(style).toEqual({});
  });
});
