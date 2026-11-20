import { RowSelectedStyle } from '../RowSelectedStyle';

export interface RowSelectionKeys {
  selectedKey: string | null;
  shownKey: string | null;
}

export interface RowSelection {
  selected: boolean;
  style: RowSelectedStyle;
}

/** Desktop marks the row whose detail is shown with an accent bar; a phone outlines only the row the user tapped. */
export function rowSelection(isDesktop: boolean, rowKey: string, keys: RowSelectionKeys): RowSelection {
  if (isDesktop) return { selected: keys.shownKey === rowKey, style: RowSelectedStyle.AccentBar };
  return { selected: keys.selectedKey === rowKey, style: RowSelectedStyle.Outline };
}
