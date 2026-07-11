import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { Accordion } from './Accordion';
import { AccordionItem } from './AccordionItem';

// Stub the chevron icon so the test doesn't pull react-native-svg into jsdom.
jest.mock('@dloizides/ui-icons', () => ({ SvgIcon: () => null }));

// Reads theme/translate from @dloizides/ui-feedback's default context (no provider needed).

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
  it('renders each item header and hides collapsed bodies', () => {
    renderTwoItems();
    expect(screen.getByTestId('accordion')).toBeTruthy();
    expect(screen.getByTestId('accordion-item-a')).toBeTruthy();
    expect(screen.getByTestId('accordion-item-b')).toBeTruthy();
    expect(screen.getByText('First')).toBeTruthy();
    expect(screen.queryByText('Body A')).toBeNull();
  });

  it('opens an item on header press and closes it on a second press', () => {
    renderTwoItems();
    const header = screen.getByTestId('accordion-item-a');

    fireEvent.click(header);
    expect(screen.getByText('Body A')).toBeTruthy();
    expect(screen.getByTestId('accordion-item-a-body')).toBeTruthy();

    fireEvent.click(header);
    expect(screen.queryByText('Body A')).toBeNull();
  });

  it('starts open from defaultOpenIds (uncontrolled)', () => {
    renderTwoItems({ defaultOpenIds: ['b'] });
    expect(screen.getByText('Body B')).toBeTruthy();
    expect(screen.queryByText('Body A')).toBeNull();
  });

  it('respects a per-item defaultOpen flag', () => {
    render(
      <Accordion>
        <AccordionItem id="a" title="First" defaultOpen>
          <span>Body A</span>
        </AccordionItem>
      </Accordion>,
    );
    expect(screen.getByText('Body A')).toBeTruthy();
  });

  it('keeps several items open when allowMultiple (default)', () => {
    renderTwoItems();
    fireEvent.click(screen.getByTestId('accordion-item-a'));
    fireEvent.click(screen.getByTestId('accordion-item-b'));
    expect(screen.getByText('Body A')).toBeTruthy();
    expect(screen.getByText('Body B')).toBeTruthy();
  });

  it('closes the previous item in single-open mode (allowMultiple=false)', () => {
    renderTwoItems({ allowMultiple: false });
    fireEvent.click(screen.getByTestId('accordion-item-a'));
    expect(screen.getByText('Body A')).toBeTruthy();

    fireEvent.click(screen.getByTestId('accordion-item-b'));
    expect(screen.getByText('Body B')).toBeTruthy();
    expect(screen.queryByText('Body A')).toBeNull();
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
    expect(screen.queryByText('Body A')).toBeNull();
    fireEvent.click(screen.getByTestId('accordion-item-a'));
    expect(onOpenChange).toHaveBeenCalledWith(['a']);
    expect(screen.queryByText('Body A')).toBeNull();

    // Parent applies the change -> body shows.
    rerender(
      <Accordion openIds={['a']} onOpenChange={onOpenChange}>
        <AccordionItem id="a" title="First">
          <span>Body A</span>
        </AccordionItem>
      </Accordion>,
    );
    expect(screen.getByText('Body A')).toBeTruthy();
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
    expect(screen.getByText('Body A')).toBeTruthy();

    fireEvent.keyDown(header, { key: ' ' });
    expect(screen.queryByText('Body A')).toBeNull();
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
    expect(screen.queryByText('Body A')).toBeNull();
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
    expect(screen.getByText('Body A')).toBeTruthy();
    expect(screen.getByTestId('accordion-item-a-body')).toBeTruthy();

    fireEvent.click(header);
    expect(screen.queryByText('Body A')).toBeNull();
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
    expect(screen.getByText('Body A')).toBeTruthy();
    fireEvent.click(screen.getByTestId('accordion-item-b'));
    expect(screen.getByText('Body B')).toBeTruthy();
    expect(screen.queryByText('Body A')).toBeNull();
  });
});
