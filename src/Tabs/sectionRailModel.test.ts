import { splitSectionTabs } from './sectionRailModel';

const tabsOf = (count: number): Array<{ key: string; label: string }> =>
  Array.from({ length: count }, (_unused, index) => ({ key: `s${index}`, label: `S${index}` }));

describe('splitSectionTabs', () => {
  it('with eleven sections and four slots, puts four in the bar and seven in More', () => {
    const tabs = tabsOf(11);

    const split = splitSectionTabs(tabs, 's0', 4);

    expect([split.barTabs.length, split.moreTabs.length, split.moreActive]).toEqual([4, 7, false]);
  });

  it('with five sections and four slots, shows all five and no More', () => {
    const tabs = tabsOf(5);

    const split = splitSectionTabs(tabs, 's4', 4);

    expect([split.barTabs.length, split.moreTabs.length, split.moreActive]).toEqual([5, 0, false]);
  });

  it('with the active section inside More, marks More active', () => {
    const tabs = tabsOf(11);

    const split = splitSectionTabs(tabs, 's9', 4);

    expect(split.moreActive).toBe(true);
  });
});
