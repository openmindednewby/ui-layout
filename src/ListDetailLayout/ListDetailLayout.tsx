import React from 'react';

import { useWindowDimensions } from 'react-native';

import { ListDetailPane } from './ListDetailPane';
import { resolveListDetailPanes } from './resolveListDetailPanes';
import { LAYOUT_COLLAPSE_BREAKPOINT } from '../constants';
import { SplitLayout } from '../SplitPanes/SplitLayout';
import { SplitPanes } from '../SplitPanes/SplitPanes';

export interface ListDetailLayoutProps {
  list: React.ReactNode;
  detail?: React.ReactNode;
  placeholder?: React.ReactNode;
  narrowPane?: ListDetailPane;
  breakpoint?: number;
  listWeight?: number;
  testID: string;
}

/** A list beside the chosen record when wide; one of the two when narrow. */
export const ListDetailLayout = ({
  list,
  detail,
  placeholder,
  narrowPane = ListDetailPane.List,
  breakpoint = LAYOUT_COLLAPSE_BREAKPOINT,
  listWeight,
  testID,
}: ListDetailLayoutProps): React.ReactElement => {
  const { width } = useWindowDimensions();
  const wide = width >= breakpoint;
  const hasDetail = detail !== undefined && detail !== null;
  const panes = resolveListDetailPanes(wide, narrowPane, hasDetail);

  if (wide) {
    return (
      <SplitPanes end={hasDetail ? detail : placeholder} layout={SplitLayout.Side} start={list} startWeight={listWeight} testID={testID} />
    );
  }
  return <SplitPanes end={null} layout={SplitLayout.Stack} start={panes.detail ? detail : list} testID={testID} />;
};

export default ListDetailLayout;
