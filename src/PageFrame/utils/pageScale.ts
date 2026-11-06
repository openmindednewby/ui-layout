export interface PageSize {
  width: number;
  height: number;
}

export interface ScaledFrame {
  scale: number;
  height: number;
  offsetX: number;
  offsetY: number;
}

const HALF = 2;

/** A4 at 96 CSS px per inch: 210 x 297 mm. */
export const A4_PAGE: PageSize = { width: 794, height: 1123 };

/** The factor that fits a page of `pageWidth` into `containerWidth`, never above 1; 1 while unmeasured. */
export const pageScale = (containerWidth: number, pageWidth: number): number => {
  if (containerWidth <= 0 || pageWidth <= 0) return 1;
  return Math.min(1, containerWidth / pageWidth);
};

/** The scale, outer height and the offsets that pin a centre-scaled page to the top-left corner. */
export const scaledFrame = (containerWidth: number, page: PageSize): ScaledFrame => {
  const scale = pageScale(containerWidth, page.width);
  return {
    scale,
    height: page.height * scale,
    offsetX: ((scale - 1) * page.width) / HALF,
    offsetY: ((scale - 1) * page.height) / HALF,
  };
};
