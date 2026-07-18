/**
 * Truncation helpers — logic only (the component's measure/paint behaviour is covered
 * visually in `apps/ui-showcase`, not asserted here).
 */
import { ELLIPSIS, formatUrlForDisplay, truncateMiddle } from './truncate';

describe('truncateMiddle', () => {
  it('returns the value unchanged when it already fits', () => {
    expect(truncateMiddle('short', 20)).toBe('short');
  });

  it('returns the value unchanged when it exactly fills the budget', () => {
    expect(truncateMiddle('abcde', 5)).toBe('abcde');
  });

  it('never exceeds the budget', () => {
    const long = 'a'.repeat(200);
    for (const budget of [4, 5, 10, 33, 80]) {
      expect(truncateMiddle(long, budget).length).toBeLessThanOrEqual(budget);
    }
  });

  it('keeps BOTH ends — the point of middle over tail truncation', () => {
    const out = truncateMiddle('timesofindia.indiatimes.com/city/delhi/probe-ordered', 30);
    expect(out.startsWith('timesofindia')).toBe(true);
    expect(out.endsWith('probe-ordered')).toBe(true);
    expect(out).toContain(ELLIPSIS);
  });

  it('distinguishes two URLs that share a long prefix (tail truncation would not)', () => {
    const base = 'timesofindia.indiatimes.com/city/delhi/';
    const a = truncateMiddle(`${base}court-orders-probe`, 34);
    const b = truncateMiddle(`${base}minister-resigns-today`, 34);
    expect(a).not.toBe(b);
  });

  it('gives the odd character to the head, which is the more identifying side', () => {
    // budget 8 → 7 after the ellipsis → head 4, tail 3
    expect(truncateMiddle('abcdefghijklmnop', 8)).toBe(`abcd${ELLIPSIS}nop`);
  });

  it('leaves the value alone when the budget is too small to be readable', () => {
    expect(truncateMiddle('abcdefghij', 3)).toBe('abcdefghij');
    expect(truncateMiddle('abcdefghij', 0)).toBe('abcdefghij');
  });
});

describe('formatUrlForDisplay', () => {
  it('drops the scheme', () => {
    expect(formatUrlForDisplay('https://example.com/a')).toBe('example.com/a');
    expect(formatUrlForDisplay('http://example.com/a')).toBe('example.com/a');
  });

  it('drops a leading www.', () => {
    expect(formatUrlForDisplay('https://www.example.com/a')).toBe('example.com/a');
  });

  it('drops a bare trailing slash', () => {
    expect(formatUrlForDisplay('https://example.com/')).toBe('example.com');
  });

  it('keeps the path, query and slug intact', () => {
    expect(formatUrlForDisplay('https://a.com/x/y?z=1')).toBe('a.com/x/y?z=1');
  });

  it('passes an opaque non-URL identifier through untouched', () => {
    expect(formatUrlForDisplay('OFAC-12345')).toBe('OFAC-12345');
    expect(formatUrlForDisplay('Q7747')).toBe('Q7747');
  });

  it('never returns an empty string for a scheme-only input', () => {
    expect(formatUrlForDisplay('https://')).toBe('https://');
  });
});
