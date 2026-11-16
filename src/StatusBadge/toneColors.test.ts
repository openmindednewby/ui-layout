import type { UiTheme } from '@dloizides/ui-feedback';

import { BadgeTone } from './BadgeTone';
import { resolveToneColors } from './toneColors';

const BASE_THEME: UiTheme = {
  colors: { background: '#fff', surface: '#fff', surfaceElevated: '#f4f4f4', text: '#111', textSecondary: '#555', border: '#ddd' },
  palette: { primary: { '500': '#00f' } },
  semantic: {
    error: { '50': '#fee', '500': '#e00', '700': '#a00' },
    success: { '50': '#efe', '500': '#0c0', '700': '#080' },
    warning: { '500': '#fa0' },
  },
};

describe('resolveToneColors', () => {
  it('with danger, reads the error scale text and fill steps', () => {
    const tone = BadgeTone.Danger;

    const result = resolveToneColors(BASE_THEME, tone);

    expect(result).toEqual({ color: '#a00', backgroundColor: '#fee' });
  });

  it('with success, reads the success scale', () => {
    const tone = BadgeTone.Success;

    const result = resolveToneColors(BASE_THEME, tone);

    expect(result).toEqual({ color: '#080', backgroundColor: '#efe' });
  });

  it('with a scale that has no 700 or 50 step, falls back to 500 and the elevated surface', () => {
    const tone = BadgeTone.Warning;

    const result = resolveToneColors(BASE_THEME, tone);

    expect(result).toEqual({ color: '#fa0', backgroundColor: '#f4f4f4' });
  });

  it('with info and no info scale, falls back to the neutral colours', () => {
    const tone = BadgeTone.Info;

    const result = resolveToneColors(BASE_THEME, tone);

    expect(result).toEqual({ color: '#555', backgroundColor: '#f4f4f4' });
  });

  it('with neutral, uses the secondary text on the elevated surface', () => {
    const tone = BadgeTone.Neutral;

    const result = resolveToneColors(BASE_THEME, tone);

    expect(result).toEqual({ color: '#555', backgroundColor: '#f4f4f4' });
  });
});
