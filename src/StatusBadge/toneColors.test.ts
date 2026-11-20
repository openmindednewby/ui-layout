import { contrastRatio } from '@dloizides/design-tokens';
import type { UiTheme } from '@dloizides/ui-feedback';

import { DARK_THEME, LIGHT_THEME } from '../__testing__/badgeThemes';

import { BadgeTone } from './BadgeTone';
import { resolveToneColors } from './toneColors';

const MIN_TEXT_CONTRAST = 4.5;

const ALL_TONES = [BadgeTone.Neutral, BadgeTone.Info, BadgeTone.Success, BadgeTone.Warning, BadgeTone.Danger];

describe('resolveToneColors', () => {
  const cases = (['light', 'dark'] as const).flatMap((name) =>
    ALL_TONES.map((tone) => [name, tone, name === 'light' ? LIGHT_THEME : DARK_THEME] as const),
  );

  it.each(cases)('in the %s theme, %s text reaches 4.5:1 contrast', (_name, tone, theme) => {
    const colors = resolveToneColors(theme, tone);

    const ratio = contrastRatio(colors.color, colors.backgroundColor);

    expect(ratio).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
  });

  it('with danger, fills with the error scale main step', () => {
    const tone = BadgeTone.Danger;

    const result = resolveToneColors(LIGHT_THEME, tone);

    expect(result.backgroundColor).toBe('#dc2626');
  });

  it('with a theme lacking the warning scale, falls back to text on the elevated surface', () => {
    const theme: UiTheme = { ...LIGHT_THEME, semantic: { error: { '500': '#dc2626' } } };

    const result = resolveToneColors(theme, BadgeTone.Warning);

    expect(result).toEqual({ color: '#18181b', backgroundColor: '#f4f4f5' });
  });

  it('with neutral, uses the theme text on the elevated surface', () => {
    const tone = BadgeTone.Neutral;

    const result = resolveToneColors(DARK_THEME, tone);

    expect(result).toEqual({ color: '#fafafa', backgroundColor: '#27272a' });
  });
});
