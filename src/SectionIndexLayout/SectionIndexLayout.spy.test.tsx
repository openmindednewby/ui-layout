import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';

import { SectionIndexLayout } from './SectionIndexLayout';

const SECTIONS = [
  { key: 'health', title: 'List health', content: 'health body' },
  { key: 'fresh', title: 'Freshness', content: 'fresh body' },
  { key: 'audit', title: 'Audit', content: 'audit body' },
];
const WIDE = 0;
const VIEWPORT_HEIGHT = 1000;
const SCROLLER_ID = 'inner-scroller';
const AT_TOP = [0, 900, 1800];
const SECOND_PAST_LINE = [-900, 100, 900];

let rectTops: Record<string, number | undefined> = {};

function sectionId(key: string): string {
  return `section-index-section-${key}`;
}

function placeSections(tops: ReadonlyArray<number>): void {
  SECTIONS.forEach((entry, index) => {
    rectTops[sectionId(entry.key)] = tops[index];
  });
}

function scrollSection(): void {
  fireEvent.scroll(document.getElementById(sectionId('fresh')) as HTMLElement);
}

function defineValue(target: object, key: string, value: number): void {
  Object.defineProperty(target, key, { configurable: true, value });
}

function currentKey(): string | undefined {
  return SECTIONS.find((entry) => screen.getByTestId(`section-index-index-${entry.key}`).getAttribute('aria-current') !== null)?.key;
}

function layout(stickyIndex: boolean | { scrollSpy: boolean } = true): ReactElement {
  return <SectionIndexLayout breakpoint={WIDE} indexHeading="On this page" itemHint="Jumps to the section" sections={SECTIONS} stickyIndex={stickyIndex} />;
}

const renderWide = (stickyIndex: boolean | { scrollSpy: boolean } = true): void => {
  render(layout(stickyIndex));
};

describe('SectionIndexLayout scroll spy', () => {
  beforeEach(() => {
    rectTops = {};
    defineValue(window, 'innerHeight', VIEWPORT_HEIGHT);
    defineValue(window, 'scrollY', 0);
    defineValue(document.documentElement, 'scrollHeight', 0);
    Element.prototype.scrollIntoView = jest.fn();
    Element.prototype.getBoundingClientRect = function rect(this: Element): DOMRect {
      return { top: rectTops[this.id] ?? 0 } as DOMRect;
    };
    placeSections(AT_TOP);
  });

  it('with the page at its top on mount, keeps the first section current', () => {
    renderWide();

    const key = currentKey();

    expect(key).toBe('health');
  });

  it('at scroll 0 with initialKey on a later section and a short first section, marks the first section current', () => {
    placeSections([150, 230, 600]);

    render(<SectionIndexLayout stickyIndex breakpoint={WIDE} indexHeading="On this page" initialKey="fresh" itemHint="Jumps to the section" sections={SECTIONS} />);

    expect(currentKey()).toBe('health');
  });

  it('with the second section scrolled past the line, marks it current', () => {
    renderWide();
    defineValue(window, 'scrollY', 900);
    defineValue(document.documentElement, 'scrollHeight', 4000);
    placeSections(SECOND_PAST_LINE);

    scrollSection();

    expect(currentKey()).toBe('fresh');
  });

  it('with a pressed index item, scrolls to it and ignores the spy while the scroll runs', () => {
    renderWide();

    fireEvent.click(screen.getByTestId('section-index-index-audit'));
    placeSections(SECOND_PAST_LINE);
    scrollSection();

    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    expect(currentKey()).toBe('audit');
  });

  it('with scrollSpy turned off in the config, a scroll does not change current', () => {
    renderWide({ scrollSpy: false });
    placeSections(SECOND_PAST_LINE);

    scrollSection();

    expect(currentKey()).toBe('health');
  });

  it('with a non-sticky index, a scroll does not change current', () => {
    renderWide(false);
    placeSections(SECOND_PAST_LINE);

    scrollSection();

    expect(currentKey()).toBe('health');
  });

  it('with the sections in an inner scroller below the window top, marks the section crossing that scroller line', () => {
    render(<div id={SCROLLER_ID} style={{ overflowY: 'auto' }}>{layout()}</div>);
    const scroller = document.getElementById(SCROLLER_ID) as HTMLElement;
    rectTops[SCROLLER_ID] = 400;
    defineValue(scroller, 'clientHeight', 400);
    defineValue(scroller, 'scrollHeight', 2000);
    defineValue(scroller, 'scrollTop', 600);
    placeSections([-200, 450, 1050]);

    fireEvent.scroll(scroller);

    expect(currentKey()).toBe('fresh');
  });

  it('with the window scrolled to its end, marks the last section although it never reaches the line', () => {
    renderWide();
    defineValue(window, 'scrollY', 1000);
    defineValue(document.documentElement, 'scrollHeight', 2000);
    placeSections([-1000, -100, 600]);

    scrollSection();

    expect(currentKey()).toBe('audit');
  });
});
