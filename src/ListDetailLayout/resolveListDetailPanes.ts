import { ListDetailPane } from './ListDetailPane';

/** Which panes are on screen. */
export interface ListDetailVisibility {
  list: boolean;
  detail: boolean;
}

/** Wide shows both panes; narrow shows one, the detail only when asked for and present. */
export function resolveListDetailPanes(wide: boolean, narrowPane: ListDetailPane, hasDetail: boolean): ListDetailVisibility {
  if (wide) return { list: true, detail: true };
  const detail = narrowPane === ListDetailPane.Detail && hasDetail;
  return { list: !detail, detail };
}
