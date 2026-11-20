import { showsEdgeFade } from './edgeFade';

describe('showsEdgeFade', () => {
  it('with tabs wider than the strip at the start, shows the fade', () => {
    const metrics = { contentWidth: 600, viewportWidth: 360, offset: 0 };

    const visible = showsEdgeFade(metrics);

    expect(visible).toBe(true);
  });

  it('with the strip scrolled to the end, hides the fade', () => {
    const metrics = { contentWidth: 600, viewportWidth: 360, offset: 240 };

    const visible = showsEdgeFade(metrics);

    expect(visible).toBe(false);
  });

  it('with every tab fitting the strip, hides the fade', () => {
    const metrics = { contentWidth: 300, viewportWidth: 360, offset: 0 };

    const visible = showsEdgeFade(metrics);

    expect(visible).toBe(false);
  });
});
