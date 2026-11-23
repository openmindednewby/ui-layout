import { render, screen } from '@testing-library/react';

import { StickyActionBar } from './StickyActionBar';

const WIDE = 0;
const NARROW = 100000;

describe('StickyActionBar bleed', () => {
  it('when narrow with a 12 px bleed, pulls the bar 12 px past each side of the page padding', () => {
    const bleed = 12;

    render(<StickyActionBar accessibilityLabel="Page actions" bleed={bleed} breakpoint={NARROW} testID="bar"><span>Save</span></StickyActionBar>);

    const bar = window.getComputedStyle(screen.getByTestId('bar'));
    expect(bar.marginLeft).toBe('-12px');
    expect(bar.marginRight).toBe('-12px');
  });

  it('when wide with a 12 px bleed, keeps the inline row inside the padding', () => {
    const bleed = 12;

    render(<StickyActionBar accessibilityLabel="Page actions" bleed={bleed} breakpoint={WIDE} testID="bar"><span>Save</span></StickyActionBar>);

    const bar = window.getComputedStyle(screen.getByTestId('bar'));

    expect(bar.marginLeft).not.toBe('-12px');
  });
});
