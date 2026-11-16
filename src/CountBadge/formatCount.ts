const OVERFLOW_SUFFIX = '+';

/** The text a count badge shows: a whole non-negative count, capped as `max+`. */
export function formatCount(count: number, max: number): string {
  const whole = Math.max(0, Math.floor(count));
  if (whole > max) return `${String(max)}${OVERFLOW_SUFFIX}`;
  return String(whole);
}
