import { AA_NORMAL_TEXT_RATIO, contrastRatio, isHexColor } from '@dloizides/design-tokens';

/** The tone when it reaches AA normal-text contrast on every background, else the fallback ink. */
export function readableTone(tone: string, backgrounds: ReadonlyArray<string>, fallback: string): string {
  if (!isHexColor(tone) || !backgrounds.every(isHexColor)) return tone;
  const readable = backgrounds.every((background) => contrastRatio(tone, background) >= AA_NORMAL_TEXT_RATIO);
  return readable ? tone : fallback;
}
