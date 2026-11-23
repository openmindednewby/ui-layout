import { BadgeTone } from './BadgeTone';
import { resolveTintColors, resolveToneColors } from './toneColors';
import { LIGHT_THEME } from '../__testing__/badgeThemes';

import type { UiTheme } from '@dloizides/ui-feedback';

const TINTED: UiTheme = { ...LIGHT_THEME, semantic: { ...LIGHT_THEME.semantic, warning: { '100': '#fef3c7', '500': '#d97706', '700': '#92400e' } } };

describe('resolveTintColors', () => {
  it('with a warning tint step, returns the tint fill and the deep ink', () => {
    const tone = BadgeTone.Warning;

    const colors = resolveTintColors(TINTED, tone);

    expect(colors).toEqual({ backgroundColor: '#fef3c7', color: '#92400e' });
  });

  it('with no tint step in the theme, falls back to the solid tone colours', () => {
    const tone = BadgeTone.Warning;

    const colors = resolveTintColors(LIGHT_THEME, tone);

    expect(colors).toEqual(resolveToneColors(LIGHT_THEME, tone));
  });

  it('for the neutral tone, falls back to the neutral colours', () => {
    const tone = BadgeTone.Neutral;

    const colors = resolveTintColors(TINTED, tone);

    expect(colors).toEqual(resolveToneColors(TINTED, tone));
  });
});
