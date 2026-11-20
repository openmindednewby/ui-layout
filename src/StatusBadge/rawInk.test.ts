import { contrastRatio } from '@dloizides/design-tokens';
import type { UiTheme } from '@dloizides/ui-feedback';

import { DARK_THEME, LIGHT_THEME } from '../__testing__/badgeThemes';

import { compositeOver, readableRawInk } from './rawInk';

const MIN_TEXT_CONTRAST = 4.5;
const SOFT_ALPHA = '22';
const NEUTRAL_ALPHA = '55';

type SoftChip = readonly [string, string];

function softChips(theme: UiTheme): Array<readonly [string, SoftChip]> {
  const { semantic, colors } = theme;
  const semanticScales: Record<string, Record<string, string | undefined> | undefined> = semantic;
  const tones = ['error', 'success', 'warning', 'info'].map((name) => {
    const fill = semanticScales[name]?.['500'] ?? '';
    return [name, [fill, `${fill}${SOFT_ALPHA}`]] as const;
  });
  return [...tones, ['neutral', [colors.textSecondary, `${colors.border}${NEUTRAL_ALPHA}`]] as const];
}

describe('compositeOver', () => {
  it('with a half-alpha black over white, returns mid grey', () => {
    const overlay = '#00000080';

    const result = compositeOver(overlay, '#ffffff');

    expect(result).toBe('#7f7f7f');
  });

  it('with a non-hex background, returns null', () => {
    const overlay = 'transparent';

    const result = compositeOver(overlay, '#ffffff');

    expect(result).toBeNull();
  });
});

describe('readableRawInk', () => {
  const cases = (['light', 'dark'] as const).flatMap((name) => {
    const theme = name === 'light' ? LIGHT_THEME : DARK_THEME;
    return softChips(theme).map(([tone, [ink, background]]) => [name, tone, theme, ink, background] as const);
  });

  it.each(cases)('in the %s theme, a soft %s chip ink reaches 4.5:1 on its tint', (_name, _tone, theme, ink, background) => {
    const ground = compositeOver(background, theme.colors.surface) ?? '';

    const result = readableRawInk(theme, ink, background);

    expect(contrastRatio(result, ground)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
  });

  it('with an ink that already reaches 4.5:1, keeps the ink', () => {
    const ink = '#1d4ed8';

    const result = readableRawInk(LIGHT_THEME, ink, '#ffffff');

    expect(result).toBe('#1d4ed8');
  });

  it('with a background that cannot be scored, keeps the ink', () => {
    const ink = '#00aa00';

    const result = readableRawInk(LIGHT_THEME, ink, 'transparent');

    expect(result).toBe('#00aa00');
  });
});
