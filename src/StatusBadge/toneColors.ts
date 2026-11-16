import type { UiTheme, UiThemeColors } from '@dloizides/ui-feedback';

import { BadgeTone } from './BadgeTone';

export interface ToneColors {
  color: string;
  backgroundColor: string;
}

const TEXT_STEP = '700';
const BASE_STEP = '500';
const FILL_STEP = '50';

const SCALE_BY_TONE: Readonly<Record<BadgeTone, string | undefined>> = {
  [BadgeTone.Neutral]: undefined,
  [BadgeTone.Info]: 'info',
  [BadgeTone.Success]: 'success',
  [BadgeTone.Warning]: 'warning',
  [BadgeTone.Danger]: 'error',
};

function neutralColors(colors: UiThemeColors): ToneColors {
  return { color: colors.textSecondary, backgroundColor: colors.surfaceElevated };
}

/** Theme colours for a tone; a scale the host theme lacks falls back to the neutral colours. */
export function resolveToneColors(theme: UiTheme, tone: BadgeTone): ToneColors {
  const scaleName = SCALE_BY_TONE[tone];
  if (scaleName === undefined) return neutralColors(theme.colors);
  const scale: Record<string, string | undefined> | undefined = theme.semantic[scaleName];
  if (scale === undefined) return neutralColors(theme.colors);
  return {
    color: scale[TEXT_STEP] ?? scale[BASE_STEP] ?? theme.colors.textSecondary,
    backgroundColor: scale[FILL_STEP] ?? theme.colors.surfaceElevated,
  };
}
