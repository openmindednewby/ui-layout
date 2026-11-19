import { render, screen } from '@testing-library/react';

import { SplitLayout } from './SplitLayout';
import { SplitPanes } from './SplitPanes';

const TEST_ID = 'split';
const START_ID = 'split-start';
const END_ID = 'split-end';

describe('SplitPanes', () => {
  it('with Side, lays the panes out in a row', () => {
    render(<SplitPanes end={<span />} layout={SplitLayout.Side} start={<span />} testID={TEST_ID} />);

    const style = getComputedStyle(screen.getByTestId(TEST_ID));

    expect(style.flexDirection).toBe('row');
  });

  it('with Stack, lays the panes out in a column', () => {
    render(<SplitPanes end={<span />} layout={SplitLayout.Stack} start={<span />} testID={TEST_ID} />);

    const style = getComputedStyle(screen.getByTestId(TEST_ID));

    expect(style.flexDirection).toBe('column');
  });

  it('side by side, lets each pane shrink below its content so text wraps', () => {
    render(<SplitPanes end={<span />} layout={SplitLayout.Side} start={<span />} testID={TEST_ID} />);

    const widths = [START_ID, END_ID].map((id) => getComputedStyle(screen.getByTestId(id)).minWidth);

    expect(widths).toEqual(['0px', '0px']);
  });

  it('with weights, gives the start pane its share', () => {
    render(<SplitPanes end={<span />} endWeight={1} layout={SplitLayout.Side} start={<span />} startWeight={2} testID={TEST_ID} />);

    const grow = getComputedStyle(screen.getByTestId(START_ID)).flexGrow;

    expect(grow).toBe('2');
  });

  it('with an end width side by side, fixes the end pane at that width and keeps the start pane growing', () => {
    render(<SplitPanes end={<span />} endWidth={320} layout={SplitLayout.Side} start={<span />} testID={TEST_ID} />);

    const end = getComputedStyle(screen.getByTestId(END_ID));

    expect([end.width, end.flexGrow, end.flexShrink, getComputedStyle(screen.getByTestId(START_ID)).flexGrow]).toEqual(['320px', '0', '0', '1']);
  });

  it('with an end width stacked, keeps the end pane full width', () => {
    render(<SplitPanes end={<span />} endWidth={320} layout={SplitLayout.Stack} start={<span />} testID={TEST_ID} />);

    const width = getComputedStyle(screen.getByTestId(END_ID)).width;

    expect(width).toBe('100%');
  });
});
