import { AA_NORMAL_TEXT_RATIO, contrastRatio, isHexColor } from '@dloizides/design-tokens';
import type { UiTheme } from '@dloizides/ui-feedback';

const CHANNEL_MAX = 255;
const HEX_RADIX = 16;
const CHANNEL_WIDTH = 2;
const RGB_LENGTH = 6;
const RGBA_LENGTH = 8;
const MIX_STEPS = 10;

interface Rgba {
  channels: number[];
  alpha: number;
}

function parseHex(value: string): Rgba | null {
  const digits = value.trim().replace(/^#/, '').toLowerCase();
  if (!/^[0-9a-f]+$/.test(digits) || (digits.length !== RGB_LENGTH && digits.length !== RGBA_LENGTH)) return null;
  const pairs = digits.match(/../g) ?? [];
  const numbers = pairs.map((pair) => parseInt(pair, HEX_RADIX));
  const alpha = digits.length === RGBA_LENGTH ? (numbers[RGB_LENGTH / CHANNEL_WIDTH] ?? CHANNEL_MAX) / CHANNEL_MAX : 1;
  return { channels: numbers.slice(0, RGB_LENGTH / CHANNEL_WIDTH), alpha };
}

function toHex(channels: number[]): string {
  return `#${channels.map((channel) => Math.round(channel).toString(HEX_RADIX).padStart(CHANNEL_WIDTH, '0')).join('')}`;
}

function mix(from: number[], to: number[], weight: number): string {
  return toHex(from.map((channel, index) => channel * (1 - weight) + (to[index] ?? channel) * weight));
}

/** The opaque colour a `#rrggbb` / `#rrggbbaa` background shows over the surface; null when either cannot be scored. */
export function compositeOver(background: string, surface: string): string | null {
  const top = parseHex(background);
  const base = isHexColor(surface) ? parseHex(surface) : null;
  if (top === null || base === null) return null;
  return mix(base.channels, top.channels, top.alpha);
}

/** A caller's raw ink, moved toward the theme text until it reaches 4.5:1 on the background shown over `ground` (default: theme surface). */
export function readableRawInk(theme: UiTheme, ink: string, background: string, ground: string = theme.colors.surface): string {
  const visible = compositeOver(background, ground);
  const source = isHexColor(ink) ? parseHex(ink) : null;
  const target = isHexColor(theme.colors.text) ? parseHex(theme.colors.text) : null;
  if (visible === null || source === null || target === null) return ink;
  for (let step = 0; step <= MIX_STEPS; step += 1) {
    const candidate = step === 0 ? ink : mix(source.channels, target.channels, step / MIX_STEPS);
    if (contrastRatio(candidate, visible) >= AA_NORMAL_TEXT_RATIO) return candidate;
  }
  return theme.colors.text;
}
