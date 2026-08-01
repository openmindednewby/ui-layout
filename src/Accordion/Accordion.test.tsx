import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { Accordion } from './Accordion';
import { AccordionItem } from './AccordionItem';

// Stub the chevron icon so the test doesn't pull react-native-svg into jsdom.
jest.mock('@dloizides/ui-icons', () => ({ SvgIcon: () => null }));

// Reads theme/translate from @dloizides/ui-feedback's default context (no provider needed).

/*
 * OPEN STATE IS READ FROM `aria-expanded`, NOT BODY-TEXT PRESENCE.
 *
 * The body now renders inside `@dloizides/ui-motion`'s <Collapse>, which keeps its children
 * MOUNTED at all times (clipped to height 0 when closed) so the height can animate on web and
 * screen readers keep reaching the content. "Body A" is therefore always in the DOM — the thing
 * that actually toggles is the header's `aria-expanded`, which is exactly the boolean handed to
 * <Collapse open={…}>. These tests assert that logic, not the (always-present) rendering.
 */
const expanded = (id: string): string | null =>
  screen.getByTestId(`accordion-item-${id}`).getAttribute('aria-expanded');

const renderTwoItems = (props: React.ComponentProps<typeof Accordion> = {}): void => {
  render(
    <Accordion {...props}>
      <AccordionItem id="a" title="First">
        <span>Body A</span>
      </AccordionItem>
      <AccordionItem id="b" title="Second">
        <span>Body B</span>
      </AccordionItem>
    </Accordion>,
  );
};

describe('Accordion', () => {
  it('renders each item header and starts with every body collapsed', () => {
    renderTwoItems();
    expect(screen.getByTestId('accordion')).toBeTruthy();
    expect(screen.getByTestId('accordion-item-a')).toBeTruthy();
    expect(screen.getByTestId('accordion-item-b')).toBeTruthy();
    expect(screen.getByText('First')).toBeTruthy();
    expect(expanded('a')).toBe('false');
    expect(expanded('b')).toBe('false');
  });

  it('wraps each body in a Collapse whose open state follows the header', () => {
    renderTwoItems();
    // The body region lives inside its item's Collapse container (the ui-motion adoption).
    const collapse = screen.getByTestId('accordion-item-a-collapse');
    expect(collapse).toBeTruthy();
    expect(collapse.contains(screen.getByTestId('accordion-item-a-body'))).toBe(true);
    // Closed -> open -> closed, tracked by the boolean handed to <Collapse open>.
    expect(expanded('a')).toBe('false');
    fireEvent.click(screen.getByTestId('accordion-item-a'));
    expect(expanded('a')).toBe('true');
    fireEvent.click(screen.getByTestId('accordion-item-a'));
    expect(expanded('a')).toBe('false');
  });

  it('opens an item on header press and closes it on a second press', () => {
    renderTwoItems();
    const header = screen.getByTestId('accordion-item-a');

    fireEvent.click(header);
    expect(expanded('a')).toBe('true');
    expect(screen.getByTestId('accordion-item-a-body')).toBeTruthy();

    fireEvent.click(header);
    expect(expanded('a')).toBe('false');
  });

  it('starts open from defaultOpenIds (uncontrolled)', () => {
    renderTwoItems({ defaultOpenIds: ['b'] });
    expect(expanded('b')).toBe('true');
    expect(expanded('a')).toBe('false');
  });

  it('respects a per-item defaultOpen flag', () => {
    render(
      <Accordion>
        <AccordionItem id="a" title="First" defaultOpen>
          <span>Body A</span>
        </AccordionItem>
      </Accordion>,
    );
    expect(expanded('a')).toBe('true');
  });

  it('keeps several items open when allowMultiple (default)', () => {
    renderTwoItems();
    fireEvent.click(screen.getByTestId('accordion-item-a'));
    fireEvent.click(screen.getByTestId('accordion-item-b'));
    expect(expanded('a')).toBe('true');
    expect(expanded('b')).toBe('true');
  });

  it('closes the previous item in single-open mode (allowMultiple=false)', () => {
    renderTwoItems({ allowMultiple: false });
    fireEvent.click(screen.getByTestId('accordion-item-a'));
    expect(expanded('a')).toBe('true');

    fireEvent.click(screen.getByTestId('accordion-item-b'));
    expect(expanded('b')).toBe('true');
    expect(expanded('a')).toBe('false');
  });

  it('is controlled: openIds drives visibility and onOpenChange reports the next set', () => {
    const onOpenChange = jest.fn();
    const { rerender } = render(
      <Accordion openIds={[]} onOpenChange={onOpenChange}>
        <AccordionItem id="a" title="First">
          <span>Body A</span>
        </AccordionItem>
      </Accordion>,
    );
    // Controlled + closed: pressing does NOT open on its own, but reports intent.
    expect(expanded('a')).toBe('false');
    fireEvent.click(screen.getByTestId('accordion-item-a'));
    expect(onOpenChange).toHaveBeenCalledWith(['a']);
    expect(expanded('a')).toBe('false');

    // Parent applies the change -> item reports expanded.
    rerender(
      <Accordion openIds={['a']} onOpenChange={onOpenChange}>
        <AccordionItem id="a" title="First">
          <span>Body A</span>
        </AccordionItem>
      </Accordion>,
    );
    expect(expanded('a')).toBe('true');
  });

  it('exposes the expanded a11y state on the header button', () => {
    renderTwoItems();
    const header = screen.getByTestId('accordion-item-a');
    expect(header.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(header);
    expect(header.getAttribute('aria-expanded')).toBe('true');
  });

  it('toggles from the keyboard (Enter / Space)', () => {
    renderTwoItems();
    const header = screen.getByTestId('accordion-item-a');

    fireEvent.keyDown(header, { key: 'Enter' });
    expect(expanded('a')).toBe('true');

    fireEvent.keyDown(header, { key: ' ' });
    expect(expanded('a')).toBe('false');
  });

  it('marks the boxed marker (decorative chevron) aria-hidden so it adds no SR noise', () => {
    render(
      <Accordion variant="boxed">
        <AccordionItem id="a" title="First">
          <span>Body A</span>
        </AccordionItem>
      </Accordion>,
    );
    // The state is conveyed by aria-expanded on the header; the rotating ▸ is decorative.
    expect(screen.getByTestId('accordion-item-a-chevron').getAttribute('aria-hidden')).toBe('true');
  });

  it('does not toggle a disabled item', () => {
    render(
      <Accordion>
        <AccordionItem id="a" title="First" disabled>
          <span>Body A</span>
        </AccordionItem>
      </Accordion>,
    );
    fireEvent.click(screen.getByTestId('accordion-item-a'));
    expect(expanded('a')).toBe('false');
  });

  it('boxed variant keeps the full API: toggles, a11y and body region still work', () => {
    render(
      <Accordion variant="boxed">
        <AccordionItem id="a" title="First">
          <span>Body A</span>
        </AccordionItem>
        <AccordionItem id="b" title="Second">
          <span>Body B</span>
        </AccordionItem>
      </Accordion>,
    );
    const header = screen.getByTestId('accordion-item-a');
    // Leading ▸ marker (the boxed chevron) is present even with SvgIcon stubbed out.
    expect(screen.getByTestId('accordion-item-a-chevron')).toBeTruthy();
    expect(header.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(header);
    expect(header.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByTestId('accordion-item-a-body')).toBeTruthy();

    fireEvent.click(header);
    expect(header.getAttribute('aria-expanded')).toBe('false');
  });

  it('boxed variant supports single-open mode (allowMultiple=false)', () => {
    render(
      <Accordion variant="boxed" allowMultiple={false}>
        <AccordionItem id="a" title="First">
          <span>Body A</span>
        </AccordionItem>
        <AccordionItem id="b" title="Second">
          <span>Body B</span>
        </AccordionItem>
      </Accordion>,
    );
    fireEvent.click(screen.getByTestId('accordion-item-a'));
    expect(expanded('a')).toBe('true');
    fireEvent.click(screen.getByTestId('accordion-item-b'));
    expect(expanded('b')).toBe('true');
    expect(expanded('a')).toBe('false');
  });
});
