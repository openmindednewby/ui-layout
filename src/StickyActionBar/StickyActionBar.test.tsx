import { render, screen } from '@testing-library/react';

import { StickyActionBar } from './StickyActionBar';
import { stickyEdgeStyle } from './stickyEdge';

const WIDE = 0;
const NARROW = 100000;

describe('stickyEdgeStyle', () => {
  it('on web with a 10 px inset, sticks to the bottom and adds the safe area to 22 px', () => {
    const inset = 10;

    const style = stickyEdgeStyle('web', inset) as Record<string, unknown>;

    expect(style.position).toBe('sticky');
    expect(style.bottom).toBe(0);
    expect(style.paddingBottom).toBe('calc(22px + env(safe-area-inset-bottom))');
  });

  it('on native with a 34 px inset, pads the bottom by 46 px without sticky', () => {
    const inset = 34;

    const style = stickyEdgeStyle('ios', inset) as Record<string, unknown>;

    expect(style).toEqual({ paddingBottom: 46 });
  });
});

describe('StickyActionBar', () => {
  it('when narrow, pins the bar to the bottom edge', () => {
    render(<StickyActionBar accessibilityLabel="Page actions" breakpoint={NARROW} testID="bar"><span>Export</span></StickyActionBar>);

    const bar = window.getComputedStyle(screen.getByTestId('bar'));

    expect(bar.position).toBe('sticky');
  });

  it('when wide, renders the actions inline without sticking', () => {
    render(<StickyActionBar accessibilityLabel="Page actions" breakpoint={WIDE} testID="bar"><span>Export</span></StickyActionBar>);

    const bar = window.getComputedStyle(screen.getByTestId('bar'));

    expect(bar.position).not.toBe('sticky');
    expect(screen.getByTestId('bar').textContent).toBe('Export');
  });
});
