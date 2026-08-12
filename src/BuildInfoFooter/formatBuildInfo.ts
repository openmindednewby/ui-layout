/**
 * Pure formatting for the build-info caption — split out of the component so the label
 * assembly (the part with the branches: no version, version only, version + api commit) is
 * testable without a renderer.
 */

/** Leading glyph on the build version, e.g. `v1.2.0`. */
export const BUILD_INFO_PREFIX = 'v';

/** Separator between the app build and the API commit, e.g. `v1.2.0 · api abc1234`. */
export const API_COMMIT_SEPARATOR = ' · api ';

/** How many leading chars of a commit sha to show — a 7-char short sha is the git default. */
const SHORT_COMMIT_LENGTH = 7;

/** First {@link SHORT_COMMIT_LENGTH} chars of a (trimmed) commit sha. A short sha is enough to
 *  identify a build; the full 40-char hash is noise in a footer caption. */
export function shortenCommit(commit: string): string {
  return commit.trim().slice(0, SHORT_COMMIT_LENGTH);
}

/** Drop a single trailing slash so `${base}/version` never doubles up (`https://x//version`). */
export function trimTrailingSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

/**
 * The caption text: `v<buildVersion>`, plus ` · api <sha7>` when a non-empty commit is known.
 * Both inputs are trimmed; an empty/whitespace commit is treated as absent (no API suffix).
 */
export function formatBuildInfo(buildVersion: string, apiCommit?: string): string {
  const base = `${BUILD_INFO_PREFIX}${buildVersion.trim()}`;
  const commit = apiCommit?.trim();
  if (commit === undefined || commit === '') return base;
  return `${base}${API_COMMIT_SEPARATOR}${shortenCommit(commit)}`;
}
