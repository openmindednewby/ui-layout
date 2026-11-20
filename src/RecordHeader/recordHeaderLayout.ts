import { LAYOUT_COLLAPSE_BREAKPOINT } from '../constants';

/** True when a record header stacks its parts and shows icon-only secondary actions. */
export function isRecordHeaderCompact(width: number, breakpoint: number = LAYOUT_COLLAPSE_BREAKPOINT): boolean {
  return width < breakpoint;
}
