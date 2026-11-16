import { SplitLayout } from './SplitLayout';

/** Whether the panes sit side by side: always for Side, never for Stack, from `breakpoint` up for Auto. */
export function isSplitSideBySide(layout: SplitLayout, width: number, breakpoint: number): boolean {
  if (layout === SplitLayout.Side) return true;
  if (layout === SplitLayout.Stack) return false;
  return width >= breakpoint;
}
