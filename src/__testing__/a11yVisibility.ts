/**
 * Test helpers for asserting that a hint is ANNOUNCED but not PAINTED.
 *
 * Since ui-layout delegates hint threading to `@dloizides/a11y`, the description node is a
 * DESCENDANT of its host (that is the package's deliberate design — a sibling could outlive
 * the host and leave `aria-describedby` dangling). So `host.textContent` now legitimately
 * includes the hint text, and a bare `textContent === 'Alpha'` assertion no longer expresses
 * what it was trying to express.
 *
 * The replacement is stricter, not looser. The old check could not distinguish a hint that
 * was ABSENT from one that was PRESENT-BUT-HIDDEN — it passed for both. These helpers assert
 * both halves separately: the visible text excludes the hint, AND the node carrying the hint
 * is genuinely clipped out of view.
 */

/** Text a sighted user actually sees — everything except the `aria-describedby` target. */
export function visibleText(host: HTMLElement): string {
  const describedById = host.getAttribute('aria-describedby');
  const clone = host.cloneNode(true) as HTMLElement;
  if (describedById !== null) {
    clone.querySelector(`[id="${CSS.escape(describedById)}"]`)?.remove();
  }
  return clone.textContent ?? '';
}

/** The element `aria-describedby` points at, or `null` when the attribute is missing. */
export function describedByNode(host: HTMLElement): HTMLElement | null {
  const id = host.getAttribute('aria-describedby');
  return id === null ? null : host.ownerDocument.getElementById(id);
}

/**
 * Assert the node is clipped out of view while STAYING in the accessibility tree.
 *
 * Deliberately does not accept `display: none` / `visibility: hidden` — those would hide the
 * text from screen readers too, silently un-announcing the hint while still passing a naive
 * "it isn't visible" check.
 */
export function expectVisuallyHidden(node: HTMLElement): void {
  const view = node.ownerDocument.defaultView;
  if (view === null) {
    throw new Error('node is not attached to a window');
  }
  const style = view.getComputedStyle(node);

  expect(style.display).not.toBe('none');
  expect(style.visibility).not.toBe('hidden');
  expect(style.position).toBe('absolute');
  // The LONGHANDS, not `style.overflow`: react-native-web applies the style through an
  // injected class, and jsdom's getComputedStyle expands the shorthand — so `style.overflow`
  // reads back as '' here even though the clipping is genuinely applied.
  expect(style.overflowX).toBe('hidden');
  expect(style.overflowY).toBe('hidden');
  expect(parseFloat(style.width)).toBeLessThanOrEqual(1);
  expect(parseFloat(style.height)).toBeLessThanOrEqual(1);
}
