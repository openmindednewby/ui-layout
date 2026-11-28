const ARROW_NEXT = 'ArrowRight';
const ARROW_PREV = 'ArrowLeft';
const FIRST = 'Home';
const LAST = 'End';

/** The tab index a key press moves to (arrows wrap, Home / End jump), or undefined when the key is not a tab key. */
export function nextTabIndex(key: string | undefined, current: number, count: number): number | undefined {
  if (count <= 0) return undefined;
  if (key === ARROW_NEXT) return (current + 1) % count;
  if (key === ARROW_PREV) return (current - 1 + count) % count;
  if (key === FIRST) return 0;
  if (key === LAST) return count - 1;
  return undefined;
}
