import { fireEvent, render, screen } from '@testing-library/react';

import { ChipOverflow } from './ChipOverflow';
import { SectionDensity } from './SectionDensity';
import { SectionIndexLayout } from './SectionIndexLayout';
import { resolveActiveKey } from './sectionKeys';

const SECTIONS = [
  { key: 'health', title: 'List health', content: 'health body' },
  { key: 'fresh', title: 'Freshness', content: 'fresh body' },
  { key: 'audit', title: 'Audit', content: 'audit body' },
];
const WIDE = 0;
const NARROW = 100000;

describe('SectionIndexLayout', () => {
  it('on a narrow viewport, shows only the first section', () => {
    render(<SectionIndexLayout breakpoint={NARROW} indexHeading="On this page" itemHint="Shows the section" sections={SECTIONS} />);

    const hidden = screen.queryByText('fresh body');

    expect(screen.getByText('health body')).toBeTruthy();
    expect(hidden).toBeNull();
  });

  it('on a narrow viewport, pressing a chip shows that section instead', () => {
    render(<SectionIndexLayout breakpoint={NARROW} indexHeading="On this page" itemHint="Shows the section" sections={SECTIONS} />);

    fireEvent.click(screen.getByTestId('section-index-chip-audit'));

    expect(screen.getByText('audit body')).toBeTruthy();
    expect(screen.queryByText('health body')).toBeNull();
  });

  it('on a narrow viewport, marks the pressed chip selected', () => {
    render(<SectionIndexLayout breakpoint={NARROW} indexHeading="On this page" itemHint="Shows the section" sections={SECTIONS} />);

    fireEvent.click(screen.getByTestId('section-index-chip-fresh'));

    expect(screen.getByTestId('section-index-chip-fresh').getAttribute('aria-selected')).toBe('true');
    expect(screen.getByTestId('section-index-chip-health').getAttribute('aria-selected')).toBe('false');
  });

  it('on a narrow viewport without a collapsedKey, opens on the first chip although initialKey names a later one', () => {
    render(<SectionIndexLayout breakpoint={NARROW} indexHeading="On this page" initialKey="audit" itemHint="Shows the section" sections={SECTIONS} />);

    const selected = screen.getByTestId('section-index-chip-health').getAttribute('aria-selected');

    expect(selected).toBe('true');
  });

  it('on a narrow viewport with a collapsedKey, opens on that section instead of initialKey', () => {
    render(<SectionIndexLayout breakpoint={NARROW} collapsedKey="audit" indexHeading="On this page" initialKey="health" itemHint="Shows the section" sections={SECTIONS} />);

    const hidden = screen.queryByText('health body');

    expect(screen.getByText('audit body')).toBeTruthy();
    expect(hidden).toBeNull();
  });

  it('on a wide viewport with a collapsedKey, marks initialKey current', () => {
    render(<SectionIndexLayout breakpoint={WIDE} collapsedKey="audit" indexHeading="On this page" initialKey="fresh" itemHint="Shows the section" sections={SECTIONS} />);

    const current = screen.getByTestId('section-index-index-fresh').getAttribute('aria-current');

    expect(current).not.toBeNull();
  });

  it('on a wide viewport, renders every section at once', () => {
    render(<SectionIndexLayout breakpoint={WIDE} indexHeading="On this page" itemHint="Scrolls to the section" sections={SECTIONS} />);

    const bodies = SECTIONS.map((entry) => screen.queryByText(String(entry.content)));

    expect(bodies.every((body) => body !== null)).toBe(true);
  });

  it('on a wide viewport, pressing an index item scrolls to its section and marks it current', () => {
    const scroll = jest.fn();
    Element.prototype.scrollIntoView = scroll;
    render(<SectionIndexLayout breakpoint={WIDE} indexHeading="On this page" itemHint="Scrolls to the section" sections={SECTIONS} />);

    fireEvent.click(screen.getByTestId('section-index-index-audit'));

    expect(scroll).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('section-index-index-audit').getAttribute('aria-current')).toBe('location');
  });

  it('with scroll overflow, keeps every chip on one row', () => {
    render(<SectionIndexLayout breakpoint={NARROW} chipOverflow={ChipOverflow.Scroll} indexHeading="On this page" itemHint="Shows the section" sections={SECTIONS} />);

    const chips = SECTIONS.map((entry) => screen.queryByTestId(`section-index-chip-${entry.key}`));

    expect(chips.every((chip) => chip !== null)).toBe(true);
    expect(window.getComputedStyle(screen.getByTestId('section-index-chips')).flexWrap).toBe('nowrap');
  });

  it('with one section, renders it without chips', () => {
    render(<SectionIndexLayout breakpoint={NARROW} indexHeading="On this page" itemHint="Shows the section" sections={SECTIONS.slice(0, 1)} />);

    const chips = screen.queryByTestId('section-index-chips');

    expect(chips).toBeNull();
    expect(screen.getByText('health body')).toBeTruthy();
  });
});

describe('resolveActiveKey', () => {
  it('with a known key, returns that key', () => {
    const key = resolveActiveKey(SECTIONS, 'audit');

    expect(key).toBe('audit');
  });

  it('with an unknown key, returns the first section key', () => {
    const key = resolveActiveKey(SECTIONS, 'missing');

    expect(key).toBe('health');
  });

  it('with no sections, returns an empty key', () => {
    const key = resolveActiveKey([], undefined);

    expect(key).toBe('');
  });
});

describe('SectionIndexLayout indexWidth', () => {
  it('on a wide viewport with indexWidth 168, sizes the index rail to 168 px', () => {
    render(<SectionIndexLayout breakpoint={WIDE} indexHeading="On this page" indexWidth={168} itemHint="Shows the section" sections={SECTIONS} />);

    const rail = window.getComputedStyle(screen.getByTestId('section-index-index'));

    expect(rail.width).toBe('168px');
  });

  it('on a wide viewport without indexWidth, keeps the 200 px rail', () => {
    render(<SectionIndexLayout breakpoint={WIDE} indexHeading="On this page" itemHint="Shows the section" sections={SECTIONS} />);

    const rail = window.getComputedStyle(screen.getByTestId('section-index-index'));

    expect(rail.width).toBe('200px');
  });
});

describe('SectionIndexLayout activeColor', () => {
  it('on a narrow viewport with activeColor, fills the active chip with it', () => {
    render(<SectionIndexLayout activeColor="rgb(1, 2, 3)" breakpoint={NARROW} indexHeading="On this page" itemHint="Shows the section" sections={SECTIONS} />);

    const chip = window.getComputedStyle(screen.getByTestId('section-index-chip-health'));

    expect(chip.backgroundColor).toBe('rgb(1, 2, 3)');
  });

  it('on a wide viewport with activeColor, draws the active bar with it', () => {
    render(<SectionIndexLayout activeColor="rgb(1, 2, 3)" breakpoint={WIDE} indexHeading="On this page" itemHint="Shows the section" sections={SECTIONS} />);

    const item = window.getComputedStyle(screen.getByTestId('section-index-index-health'));

    expect(item.borderLeftColor.replace(/\s/g, '')).toMatch(/^rgba?\(1,2,3[,)]/);
  });

  it('on a wide viewport without activeColor, keeps the active bar in another colour', () => {
    render(<SectionIndexLayout breakpoint={WIDE} indexHeading="On this page" itemHint="Shows the section" sections={SECTIONS} />);

    const item = window.getComputedStyle(screen.getByTestId('section-index-index-health'));

    expect(item.borderLeftColor.replace(/\s/g, '')).not.toMatch(/^rgba?\(1,2,3[,)]/);
  });
});

describe('SectionIndexLayout stackFrom', () => {
  it('between stackFrom and wide, renders every section stacked without an index or chips', () => {
    render(<SectionIndexLayout breakpoint={{ wide: NARROW, stackFrom: WIDE }} indexHeading="On this page" itemHint="Shows the section" sections={SECTIONS} />);

    const bodies = ['health body', 'fresh body', 'audit body'].map((body) => screen.queryByText(body));

    expect(bodies.every((body) => body !== null)).toBe(true);
    expect(screen.queryByTestId('section-index-chips')).toBeNull();
    expect(screen.queryByTestId('section-index-index')).toBeNull();
  });

  it('below stackFrom, keeps the chips and one section', () => {
    render(<SectionIndexLayout breakpoint={{ wide: NARROW, stackFrom: NARROW }} indexHeading="On this page" itemHint="Shows the section" sections={SECTIONS} />);

    const hidden = screen.queryByText('fresh body');

    expect(screen.getByTestId('section-index-chips')).toBeTruthy();
    expect(hidden).toBeNull();
  });

  it('with dense pill chips, keeps a 44 px hit box around a 38 px pill', () => {
    render(<SectionIndexLayout breakpoint={NARROW} density={SectionDensity.DensePill} indexHeading="On this page" itemHint="Shows the section" sections={SECTIONS} />);

    const hit = getComputedStyle(screen.getByTestId('section-index-chip-audit'));

    expect(hit.minHeight).toBe('44px');
    expect(getComputedStyle(screen.getByTestId('section-index-pill-audit')).minHeight).toBe('38px');
  });
});
