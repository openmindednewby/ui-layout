import type { UiTheme } from '@dloizides/ui-feedback';

import { LIGHT_THEME } from '../__testing__/badgeThemes';

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

  it('with a theme without info or success scales, uses the primary ink on the surface', () => {
    const colors = resolveBannerColors(NO_SEMANTIC, BannerTone.Success);

    expect(colors).toEqual({ ink: '#1d4ed8', border: '#1d4ed8', fill: '#ffffff' });
  });
});
