import {
  formatBuildInfo,
  shortenCommit,
  trimTrailingSlash,
  BUILD_INFO_PREFIX,
  API_COMMIT_SEPARATOR,
} from './formatBuildInfo';

describe('formatBuildInfo', () => {
  it('prefixes the build version with "v"', () => {
    expect(formatBuildInfo('1.2.0')).toBe('v1.2.0');
  });

  it('trims whitespace around the version', () => {
    expect(formatBuildInfo('  abc123  ')).toBe(`${BUILD_INFO_PREFIX}abc123`);
  });

  it('appends the shortened api commit when one is given', () => {
    expect(formatBuildInfo('1.2.0', '0123456789abcdef')).toBe(
      `v1.2.0${API_COMMIT_SEPARATOR}0123456`,
    );
  });

  it('omits the api suffix for an undefined, empty, or whitespace commit', () => {
    expect(formatBuildInfo('1.2.0')).toBe('v1.2.0');
    expect(formatBuildInfo('1.2.0', '')).toBe('v1.2.0');
    expect(formatBuildInfo('1.2.0', '   ')).toBe('v1.2.0');
  });
});

describe('shortenCommit', () => {
  it('returns the first 7 chars of a long sha', () => {
    expect(shortenCommit('0123456789abcdef0123')).toBe('0123456');
  });

  it('returns a short sha unchanged', () => {
    expect(shortenCommit('abc12')).toBe('abc12');
  });

  it('trims before slicing', () => {
    expect(shortenCommit('  0123456789 ')).toBe('0123456');
  });
});

describe('trimTrailingSlash', () => {
  it('drops a single trailing slash', () => {
    expect(trimTrailingSlash('https://x.dev/')).toBe('https://x.dev');
  });

  it('leaves a url without a trailing slash untouched', () => {
    expect(trimTrailingSlash('https://x.dev')).toBe('https://x.dev');
  });
});
