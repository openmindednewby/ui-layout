import { ListDetailPane } from './ListDetailPane';
import { resolveListDetailPanes } from './resolveListDetailPanes';

describe('resolveListDetailPanes', () => {
  it('when wide, shows the list and the detail', () => {
    const wide = true;

    const panes = resolveListDetailPanes(wide, ListDetailPane.List, false);

    expect(panes).toEqual({ list: true, detail: true });
  });

  it('when narrow and the list is asked for, shows only the list', () => {
    const narrowPane = ListDetailPane.List;

    const panes = resolveListDetailPanes(false, narrowPane, true);

    expect(panes).toEqual({ list: true, detail: false });
  });

  it('when narrow with the detail asked for and present, shows only the detail', () => {
    const narrowPane = ListDetailPane.Detail;

    const panes = resolveListDetailPanes(false, narrowPane, true);

    expect(panes).toEqual({ list: false, detail: true });
  });

  it('when narrow with the detail asked for but absent, falls back to the list', () => {
    const hasDetail = false;

    const panes = resolveListDetailPanes(false, ListDetailPane.Detail, hasDetail);

    expect(panes).toEqual({ list: true, detail: false });
  });
});
