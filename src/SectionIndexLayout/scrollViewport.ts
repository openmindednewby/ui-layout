export interface ScrollViewport {
  top: number;
  height: number;
  atStart: boolean;
  atEnd: boolean;
}

const SCROLLABLE_OVERFLOW = /^(auto|scroll|overlay)$/;
const END_TOLERANCE_PX = 2;

function scrollParent(element: HTMLElement): HTMLElement | null {
  for (let node = element.parentElement; node !== null; node = node.parentElement) {
    if (SCROLLABLE_OVERFLOW.test(getComputedStyle(node).overflowY) && node.scrollHeight > node.clientHeight) return node;
  }
  return null;
}

function isAtStart(scrolled: number): boolean {
  return scrolled <= 0;
}

function isAtEnd(scrolled: number, visible: number, total: number): boolean {
  return scrolled > 0 && scrolled + visible >= total - END_TOLERANCE_PX;
}

/** The box the sections scroll in: their nearest scrolling ancestor, else the window. */
export function scrollViewport(anchor: HTMLElement): ScrollViewport {
  const parent = scrollParent(anchor);
  if (parent === null) {
    const root = document.scrollingElement ?? document.documentElement;
    return { top: 0, height: window.innerHeight, atStart: isAtStart(window.scrollY), atEnd: isAtEnd(window.scrollY, window.innerHeight, root.scrollHeight) };
  }
  return { top: parent.getBoundingClientRect().top, height: parent.clientHeight, atStart: isAtStart(parent.scrollTop), atEnd: isAtEnd(parent.scrollTop, parent.clientHeight, parent.scrollHeight) };
}
