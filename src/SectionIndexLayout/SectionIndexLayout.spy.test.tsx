import { act, fireEvent, render, screen } from '@testing-library/react';

import { SectionIndexLayout } from './SectionIndexLayout';

const SECTIONS = [
  { key: 'health', title: 'List health', content: 'health body' },
  { key: 'fresh', title: 'Freshness', content: 'fresh body' },
  { key: 'audit', title: 'Audit', content: 'audit body' },
];
const WIDE = 0;
const VIEWPORT_HEIGHT = 1000;

let fireObserver: () => void = () => undefined;
let observed = 0;

class FakeObserver {
  public constructor(callback: () => void) {
    fireObserver = callback;
  }

  public observe(): void {
    observed += 1;
  }

  public disconnect(): void {
    observed = 0;
  }
}

function placeSections(tops: ReadonlyArray<number>): void {
  SECTIONS.forEach((entry, index) => {
    const element = document.getElementById(`section-index-section-${entry.key}`);
    if (element === null) return;
    element.getBoundingClientRect = () => ({ top: tops[index] ?? 0 }) as DOMRect;
  });
}

function currentKey(): string | undefined {
  return SECTIONS.find((entry) => screen.getByTestId(`section-index-index-${entry.key}`).getAttribute('aria-current') !== null)?.key;
}

const renderWide = (stickyIndex: boolean | { scrollSpy: boolean } = true): void => {
  render(<SectionIndexLayout breakpoint={WIDE} indexHeading="On this page" itemHint="Jumps to the section" sections={SECTIONS} stickyIndex={stickyIndex} />);
};

describe('SectionIndexLayout scroll spy', () => {
  beforeEach(() => {
    observed = 0;
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: VIEWPORT_HEIGHT });
    Object.defineProperty(window, 'IntersectionObserver', { configurable: true, writable: true, value: FakeObserver });
    Element.prototype.scrollIntoView = jest.fn();
  });

  it('with a sticky index, observes every section anchor', () => {
    renderWide();

    const count = observed;

    expect(count).toBe(3);
  });

  it('with the page at its top on mount, keeps the first section current', () => {
    renderWide();
    placeSections([0, 900, 1800]);

    act(() => fireObserver());

    expect(currentKey()).toBe('health');
  });

  it('with the second section scrolled past the line, marks it current', () => {
    renderWide();
    placeSections([0, 900, 1800]);
    act(() => fireObserver());
    placeSections([-900, 100, 900]);

    act(() => fireObserver());

    expect(currentKey()).toBe('fresh');
  });

  it('with a pressed index item, scrolls to it and ignores the spy while the scroll runs', () => {
    renderWide();
    placeSections([0, 900, 1800]);
    act(() => fireObserver());

    fireEvent.click(screen.getByTestId('section-index-index-audit'));
    placeSections([-900, 100, 900]);
    act(() => fireObserver());

    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    expect(currentKey()).toBe('audit');
  });

  it('with scrollSpy turned off in the config, observes nothing', () => {
    renderWide({ scrollSpy: false });

    const count = observed;

    expect(count).toBe(0);
  });

  it('with a non-sticky index, observes nothing', () => {
    renderWide(false);

    const count = observed;

    expect(count).toBe(0);
  });
});
