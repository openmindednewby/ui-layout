import { contrastRatio } from '@dloizides/design-tokens';
import type { UiTheme } from '@dloizides/ui-feedback';

import { BadgeTone } from './BadgeTone';
import { resolveToneColors } from './toneColors';

const MIN_TEXT_CONTRAST = 4.5;

const LIGHT_THEME: UiTheme = {
  colors: { background: '#ffffff', surface: '#ffffff', surfaceElevated: '#f4f4f5', text: '#18181b', textSecondary: '#52525b', border: '#d4d4d8' },
  palette: { primary: { '500': '#2563eb', '700': '#1d4ed8' } },
  semantic: {
    error: { '500': '#dc2626', '700': '#b91c1c' },
    success: { '500': '#16a34a', '700': '#15803d' },
    warning: { '500': '#d97706', '700': '#b45309' },
    info: { '500': '#2563eb', '700': '#1d4ed8' },
  },
};

const DARK_THEME: UiTheme = {
  colors: { background: '#09090b', surface: '#18181b', surfaceElevated: '#27272a', text: '#fafafa', textSecondary: '#a1a1aa', border: '#3f3f46' },
  palette: { primary: { '500': '#60a5fa', '700': '#2563eb' } },
  semantic: {
    error: { '500': '#f87171', '700': '#dc2626' },
    success: { '500': '#4ade80', '700': '#16a34a' },
    warning: { '500': '#fbbf24', '700': '#d97706' },
    info: { '500': '#60a5fa', '700': '#2563eb' },
  },
};

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
