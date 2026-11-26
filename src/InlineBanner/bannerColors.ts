import { isHexColor, ON_BRAND_LIGHT_INK, resolveOnBrand, UI_DEEP_STEP, UI_MAIN_STEP, UI_TINT_STEP } from '@dloizides/design-tokens';
import type { UiTheme } from '@dloizides/ui-feedback';

import { compositeOver, readableRawInk } from '../StatusBadge/rawInk';

import { BannerTone } from './BannerTone';

const WASH_STEP = '50';
const DARK_WASH_ALPHA = '29';
const LIGHT_WASH_ALPHA = '1f';

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

function isDarkSurface(theme: UiTheme): boolean {
  return isHexColor(theme.colors.surface) && resolveOnBrand(theme.colors.surface) === ON_BRAND_LIGHT_INK;
}

function washOver(theme: UiTheme, main: string, alpha: string): string {
  return compositeOver(`${main}${alpha}`, theme.colors.surface) ?? theme.colors.surface;
}

function darkColors(theme: UiTheme, scale: Scale): BannerColors {
  const main = scale[UI_MAIN_STEP] ?? scale[UI_DEEP_STEP] ?? theme.colors.text;
  const fill = washOver(theme, main, DARK_WASH_ALPHA);
  return { ink: readableRawInk(theme, main, fill, fill), border: main, fill };
}

function lightColors(theme: UiTheme, scale: Scale): BannerColors {
  const deep = scale[UI_DEEP_STEP] ?? scale[UI_MAIN_STEP] ?? theme.colors.text;
  const fill = scale[UI_TINT_STEP] ?? scale[WASH_STEP] ?? washOver(theme, deep, LIGHT_WASH_ALPHA);
  return { ink: readableRawInk(theme, deep, fill, fill), border: deep, fill };
}

/** Ink, border and fill of an inline banner from its tone's semantic scale: a light wash in light mode, a dark tinted fill with light ink in dark mode; ink always reaches 4.5:1. */
export function resolveBannerColors(theme: UiTheme, tone: BannerTone): BannerColors {
  const scale = scaleFor(theme, tone);
  return isDarkSurface(theme) ? darkColors(theme, scale) : lightColors(theme, scale);
}
