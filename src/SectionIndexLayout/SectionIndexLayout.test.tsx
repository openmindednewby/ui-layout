import { fireEvent, render, screen } from '@testing-library/react';

import { ChipOverflow } from './ChipOverflow';
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
