import { bannerIconShape, BannerIconShape } from './BannerIconShape';
import { BannerTone } from './BannerTone';

describe('bannerIconShape', () => {
  it('with the info tone, picks the outlined circle-i', () => {
    const shape = bannerIconShape(BannerTone.Info);

    expect(shape).toBe(BannerIconShape.InfoCircle);
  });

  it('with the success tone, picks the filled check disk', () => {
    const shape = bannerIconShape(BannerTone.Success);

    expect(shape).toBe(BannerIconShape.CheckDisk);
  });
});
