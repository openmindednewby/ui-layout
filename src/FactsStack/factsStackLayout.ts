import { isWideWebViewport } from '../responsive';

export const FACTS_STACK_TWO_COLUMN_BREAKPOINT = 1024;

/** True when the facts stack puts its aside in a second column: web, an aside, and at least 1024 px. */
export function isFactsStackTwoColumn(width: number, platformOS: string, hasAside: boolean): boolean {
  return hasAside && isWideWebViewport(width, platformOS, FACTS_STACK_TWO_COLUMN_BREAKPOINT);
}
