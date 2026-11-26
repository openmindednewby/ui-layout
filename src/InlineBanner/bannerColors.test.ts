import { contrastRatio, relativeLuminance } from '@dloizides/design-tokens';
import type { UiTheme } from '@dloizides/ui-feedback';

import { DARK_THEME, LIGHT_THEME } from '../__testing__/badgeThemes';

import { resolveBannerColors } from './bannerColors';
import { BannerTone } from './BannerTone';

const WASHED: UiTheme = {
  ...LIGHT_THEME,
  semantic: { ...LIGHT_THEME.semantic, info: { '50': '#eff6ff', '500': '#2563eb', '700': '#1d4ed8' }, success: { '100': '#dcfce7', '500': '#16a34a', '700': '#15803d' } },
};

const NO_SEMANTIC: UiTheme = { ...LIGHT_THEME, semantic: { error: { '500': '#dc2626', '700': '#b91c1c' } } };

describe('resolveBannerColors', () => {
  it('with the info tone, draws the deep info ink as text and border on the info wash', () => {
    const colors = resolveBannerColors(WASHED, BannerTone.Info);

    expect(colors).toEqual({ ink: '#1d4ed8', border: '#1d4ed8', fill: '#eff6ff' });
  });

  it('with the success tone and no wash step, falls back to the success tint', () => {
    const colors = resolveBannerColors(WASHED, BannerTone.Success);

    expect(colors).toEqual({ ink: '#15803d', border: '#15803d', fill: '#dcfce7' });
  });

  it('with a theme without info or success scales, uses the primary ink on a primary wash over the surface', () => {
    const colors = resolveBannerColors(NO_SEMANTIC, BannerTone.Success);

    expect([colors.ink, colors.border, colors.fill !== '#ffffff']).toEqual(['#1d4ed8', '#1d4ed8', true]);
  });
});

const AA = 4.5;

const DIM_DARK: UiTheme = { ...DARK_THEME, semantic: { ...DARK_THEME.semantic, info: { '500': '#1d4ed8', '700': '#1e3a8a' } } };

const PALE_LIGHT: UiTheme = { ...LIGHT_THEME, semantic: { ...LIGHT_THEME.semantic, info: { '50': '#eff6ff', '500': '#93c5fd', '700': '#93c5fd' } } };

describe('resolveBannerColors in dark mode', () => {
  it.each([BannerTone.Info, BannerTone.Success])('with the %s tone, draws light ink on a fill darker than the ink', (tone) => {
    const colors = resolveBannerColors(DARK_THEME, tone);

    expect([relativeLuminance(colors.ink) > relativeLuminance(colors.fill), contrastRatio(colors.ink, colors.fill) >= AA]).toEqual([true, true]);
  });

  it('with the info tone, borders the banner in the main info step', () => {
    const colors = resolveBannerColors(DARK_THEME, BannerTone.Info);

    expect(colors.border).toBe('#60a5fa');
  });

  it('with the info tone, keeps the fill dark instead of the light wash', () => {
    const colors = resolveBannerColors(DARK_THEME, BannerTone.Info);

    expect(contrastRatio(colors.fill, DARK_THEME.colors.surface)).toBeLessThan(2);
  });

  it('with a dim info step, lifts the ink until it reaches 4.5:1 on the fill', () => {
    const colors = resolveBannerColors(DIM_DARK, BannerTone.Info);

    expect(contrastRatio(colors.ink, colors.fill)).toBeGreaterThanOrEqual(AA);
  });
});

describe('resolveBannerColors contrast in light mode', () => {
  it('with a pale deep step, darkens the ink until it reaches 4.5:1 on the wash', () => {
    const colors = resolveBannerColors(PALE_LIGHT, BannerTone.Info);

    expect(contrastRatio(colors.ink, colors.fill)).toBeGreaterThanOrEqual(AA);
  });
});

const TINTED: UiTheme = { ...LIGHT_THEME, semantic: { ...LIGHT_THEME.semantic, info: { '50': '#eff6ff', '100': '#dbeafe', '500': '#2563eb', '700': '#1d4ed8' } } };

const MOON_SCALES = { error: { '500': '#b42318' }, info: { '500': '#1F3A5F' }, success: { '500': '#2f7a4f' } };

const MOON_LIGHT: UiTheme = { ...LIGHT_THEME, colors: { ...LIGHT_THEME.colors, surface: '#FFFFFF', text: '#1F3A5F' }, semantic: MOON_SCALES };

const MOON_DARK: UiTheme = { ...DARK_THEME, colors: { ...DARK_THEME.colors, surface: '#0F1B2D', text: '#F4EFE1' }, semantic: MOON_SCALES };

describe('resolveBannerColors wash choice', () => {
  it('with both a 100 tint and a 50 wash, lays the deep ink on the 100 tint', () => {
    const colors = resolveBannerColors(TINTED, BannerTone.Info);

    expect(colors).toEqual({ ink: '#1d4ed8', border: '#1d4ed8', fill: '#dbeafe' });
  });
});

describe('resolveBannerColors with single-step scales', () => {
  const cases = [
    ['light', BannerTone.Info, MOON_LIGHT],
    ['light', BannerTone.Success, MOON_LIGHT],
    ['dark', BannerTone.Info, MOON_DARK],
    ['dark', BannerTone.Success, MOON_DARK],
  ] as const;

  it.each(cases)('in %s mode with the %s tone, derives a wash off the surface and ink at 4.5:1 on it', (_mode, tone, theme) => {
    const colors = resolveBannerColors(theme, tone);

    expect([colors.fill !== theme.colors.surface, contrastRatio(colors.ink, colors.fill) >= AA]).toEqual([true, true]);
  });
});
