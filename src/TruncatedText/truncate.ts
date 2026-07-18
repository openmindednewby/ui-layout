/**
 * Pure truncation helpers for `TruncatedText`.
 *
 * WHY MIDDLE AND NOT TAIL: the component exists because full URLs (adverse-media article
 * links in the AML console) blew out their row. The obvious fix — RN's `numberOfLines={1}`,
 * which RN-web compiles to `text-overflow: ellipsis` — truncates at the TAIL, and a
 * tail-truncated URL is useless: every URL from one publisher collapses to the same
 * `https://timesofindia.indiatimes.com/city/de…` prefix, so the reader learns nothing about
 * WHICH article it is. The informative parts sit at both ends — the HOST (who published it,
 * the trust signal) and the SLUG (what it is about). The uninformative part is the middle
 * path. So we drop the middle:
 *
 *   timesofindia.indiatimes.com/…/delhi-court-orders-probe
 *
 * CSS cannot express that, so it is computed here in JS. The component still applies
 * `numberOfLines={1}` on top as a hard backstop, so even if the width estimate is off the
 * text can never overflow its container.
 */

/** The single-character ellipsis (U+2026) — one glyph, so it costs one character of budget. */
export const ELLIPSIS = '…';

/** Below this many characters a middle-truncation leaves nothing readable on either side. */
const MIN_TRUNCATABLE_CHARS = 4;

/** Leading `scheme://` and a leading `www.`, which carry no information for a reader. */
const SCHEME_PREFIX = /^[a-z][a-z0-9+.-]*:\/\//i;
const WWW_PREFIX = /^www\./i;
/** A single trailing slash — cosmetic only. */
const TRAILING_SLASH = /\/$/;

/**
 * Middle-truncate `value` to at most `maxChars` characters, joining the kept head and tail
 * with an ellipsis. Returns `value` unchanged when it already fits (or when `maxChars` is too
 * small to leave anything readable, in which case the caller's `numberOfLines` backstop clamps
 * it instead of us emitting a meaningless "a…z").
 *
 * The head keeps the extra character on an odd budget, because for both URLs and identifiers
 * the left side is the more identifying one.
 */
export function truncateMiddle(value: string, maxChars: number): string {
  if (maxChars < MIN_TRUNCATABLE_CHARS) return value;
  if (value.length <= maxChars) return value;

  const budget = maxChars - 1; // the ellipsis itself costs one character
  const head = Math.ceil(budget / 2);
  const tail = budget - head;
  return `${value.slice(0, head)}${ELLIPSIS}${value.slice(value.length - tail)}`;
}

/**
 * Strip the parts of a URL a human never needs to read — the scheme, a leading `www.`, and a
 * bare trailing slash — so the truncation budget is spent on the host and the slug instead.
 * Non-URL values (opaque list identifiers) pass through untouched.
 */
export function formatUrlForDisplay(value: string): string {
  const withoutScheme = value.replace(SCHEME_PREFIX, '');
  const withoutWww = withoutScheme.replace(WWW_PREFIX, '');
  const trimmed = withoutWww.replace(TRAILING_SLASH, '');
  return trimmed.length > 0 ? trimmed : value;
}
