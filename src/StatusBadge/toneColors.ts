import { UI_DEEP_STEP, UI_MAIN_STEP, canCarryAccessibleInk, isHexColor, resolveOnBrand } from '@dloizides/design-tokens';
import type { UiTheme, UiThemeColors } from '@dloizides/ui-feedback';

import { BadgeTone } from './BadgeTone';

export interface ToneColors {
  color: string;
  backgroundColor: string;
}

type Scale = Record<string, string | undefined>;

function scaleFor(theme: UiTheme, tone: BadgeTone): Scale | undefined {
  const semantic: Record<string, Scale | undefined> = theme.semantic;
  if (tone === BadgeTone.Danger) return theme.semantic.error;
  if (tone === BadgeTone.Success) return semantic.success;
  if (tone === BadgeTone.Warning) return semantic.warning;
  if (tone === BadgeTone.Info) return semantic.info ?? theme.palette.primary;
  return undefined;
}

function readableInk(fill: string | undefined): string | null {
  if (fill === undefined || !isHexColor(fill) || !canCarryAccessibleInk(fill)) return null;
  return resolveOnBrand(fill);
}

function neutralColors(colors: UiThemeColors): ToneColors {
  return { color: colors.text, backgroundColor: colors.surfaceElevated };
}

/** Fill and ink (>= 4.5:1 on the fill) for a tone; a tone no theme fill can carry falls back to neutral. */
export function resolveToneColors(theme: UiTheme, tone: BadgeTone): ToneColors {
  const scale = scaleFor(theme, tone);
  if (scale === undefined) return neutralColors(theme.colors);
  for (const fill of [scale[UI_MAIN_STEP], scale[UI_DEEP_STEP]]) {
    const ink = readableInk(fill);
    if (ink !== null && fill !== undefined) return { color: ink, backgroundColor: fill };
  }
  return neutralColors(theme.colors);
}
