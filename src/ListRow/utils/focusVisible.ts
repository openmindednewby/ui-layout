interface SelectorMatcher {
  matches: (selector: string) => boolean;
}

function canMatch(target: unknown): target is SelectorMatcher {
  return typeof target === 'object' && target !== null && typeof (target as Partial<SelectorMatcher>).matches === 'function';
}

/** True when a focus came from the keyboard (`:focus-visible`); a mouse or touch press returns false. */
export function isFocusVisible(target: unknown): boolean {
  if (!canMatch(target)) return true;
  try {
    return target.matches(':focus-visible');
  } catch {
    return true;
  }
}
