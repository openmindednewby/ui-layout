import { BannerTone } from './BannerTone';

export const enum BannerIconShape {
  InfoCircle = 'info-circle',
  CheckDisk = 'check-disk',
}

/** The default icon of a tone, so the tones differ by shape as well as colour. */
export function bannerIconShape(tone: BannerTone): BannerIconShape {
  return tone === BannerTone.Success ? BannerIconShape.CheckDisk : BannerIconShape.InfoCircle;
}
