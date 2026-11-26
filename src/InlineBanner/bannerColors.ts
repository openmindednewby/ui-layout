import { UI_DEEP_STEP } from '@dloizides/design-tokens';
import type { UiTheme } from '@dloizides/ui-feedback';

import { BannerTone } from './BannerTone';

const WASH_STEP = '50';
const TINT_STEP = '100';

type Scale = Record<string, string | undefined>;

export interface BannerColors {
  ink: string;
  border: string;
  fill: string;
}

function scaleFor(theme: UiTheme, tone: BannerTone): Scale {
  const semantic: Record<string, Scale | undefined> = theme.semantic;
  const own = tone === BannerTone.Success ? semantic.success : semantic.info;
  return own ?? theme.palette.primary;
}

/** Ink, border and wash of an inline banner from the theme's semantic scale for its tone (primary when the theme has none). */
export function resolveBannerColors(theme: UiTheme, tone: BannerTone): BannerColors {
  const scale = scaleFor(theme, tone);
  const ink = scale[UI_DEEP_STEP] ?? theme.colors.text;
  const fill = scale[WASH_STEP] ?? scale[TINT_STEP] ?? theme.colors.surface;
  return { ink, border: ink, fill };
}
