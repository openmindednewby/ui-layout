export interface VisibleRows<T> {
  rows: T[];
  collapsible: boolean;
}

/** The rows to show: the first `limit` until expanded; `collapsible` when there are more than `limit`. */
export function visibleRows<T>(rows: readonly T[], limit: number, expanded: boolean): VisibleRows<T> {
  const collapsible = rows.length > limit;
  return { rows: expanded || !collapsible ? [...rows] : rows.slice(0, limit), collapsible };
}
