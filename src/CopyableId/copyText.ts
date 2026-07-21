/**
 * Write a string to the system clipboard, reporting honestly whether it worked.
 *
 * THREE PATHS, IN ORDER, BECAUSE THE OBVIOUS ONE IS NOT ENOUGH:
 *
 * 1. `navigator.clipboard.writeText` — the modern API. It is gated on a SECURE CONTEXT, so it is
 *    simply `undefined` on plain http. Every staging box and LAN preview in this fleet is served
 *    over http, which means the happy path is missing exactly where people test. It can also
 *    reject at call time (permission denied, document not focused), so the promise is caught, not
 *    assumed.
 * 2. `document.execCommand('copy')` over an off-screen textarea — deprecated, but it is
 *    synchronous, needs no permission, and works in non-secure contexts. It is the reason a copy
 *    button behaves the same on http staging as on https prod.
 * 3. Neither available (React Native, or a hostile browser) — return `false`. The caller then
 *    shows a visible failure instead of a fake "Copied!". A host that wants real native clipboard
 *    support injects its own writer rather than this package taking a native dependency.
 *
 * Returns `true` only when a write actually succeeded.
 */

/** Off-screen, non-focusable-by-mouse placement for the fallback textarea. */
const OFFSCREEN_POSITION = '-9999px';

/** Does this environment expose a DOM we can use at all? */
function hasDom(): boolean {
  return typeof document !== 'undefined' && document.body !== null;
}

/**
 * The legacy path: put the text in a textarea, select it, ask the document to copy the selection.
 * The textarea is always removed, including when `execCommand` throws.
 */
function copyViaExecCommand(value: string): boolean {
  if (!hasDom()) return false;

  const area = document.createElement('textarea');
  area.value = value;
  // `readOnly` stops a mobile keyboard popping up; the styles keep the node out of view and out
  // of the layout so nothing shifts for the one frame it exists.
  area.readOnly = true;
  area.setAttribute('aria-hidden', 'true');
  area.style.position = 'fixed';
  area.style.top = OFFSCREEN_POSITION;
  area.style.left = OFFSCREEN_POSITION;
  area.style.opacity = '0';

  document.body.appendChild(area);
  try {
    area.select();
    area.setSelectionRange(0, value.length);
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    document.body.removeChild(area);
  }
}

/** True when the async clipboard API is actually present (it is absent in non-secure contexts). */
function hasAsyncClipboard(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.clipboard?.writeText === 'function'
  );
}

/**
 * Copy `value`, returning whether it landed on the clipboard.
 *
 * `writer` lets a host inject a platform clipboard (React Native's `Clipboard.setString`, say)
 * without this package depending on one. An injected writer that throws falls through to the DOM
 * paths rather than failing outright.
 */
export async function copyText(
  value: string,
  writer?: (text: string) => void | Promise<void>,
): Promise<boolean> {
  if (value === '') return false;

  if (writer !== undefined) {
    try {
      await writer(value);
      return true;
    } catch {
      /* fall through to the DOM paths below */
    }
  }

  if (hasAsyncClipboard()) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      /* fall through — a rejected write is normal on http and when the doc is unfocused */
    }
  }

  return copyViaExecCommand(value);
}
