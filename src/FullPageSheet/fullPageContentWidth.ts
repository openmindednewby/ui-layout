/** Horizontal space (px) the full-page sheet keeps free around its content. */
export const FULL_PAGE_SIDE_SPACE = 32;
/** Widest (px) the full-page sheet lets its content grow. */
export const FULL_PAGE_MAX_WIDTH = 1240;

/** Width of the sheet's content column for a window width, bounded by `maxWidth`. */
export function fullPageContentWidth(windowWidth: number, maxWidth: number = FULL_PAGE_MAX_WIDTH): number {
  return Math.max(0, Math.min(windowWidth - FULL_PAGE_SIDE_SPACE, maxWidth));
}
