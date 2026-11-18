import { render, screen } from '@testing-library/react';
import React from 'react';

import { FactsStack } from './FactsStack';
import { FACTS_STACK_TWO_COLUMN_BREAKPOINT, isFactsStackTwoColumn } from './factsStackLayout';
import { FactsStrip } from './FactsStrip';

const FACTS = [
  { id: 'a', label: 'Alpha', value: '1' },
  { id: 'b', label: 'Beta', value: '2' },
  { id: 'c', label: 'Gamma', value: '3' },
];

describe('isFactsStackTwoColumn', () => {
  it('at the breakpoint on web with an aside, returns true', () => {
    const width = FACTS_STACK_TWO_COLUMN_BREAKPOINT;

    const result = isFactsStackTwoColumn(width, 'web', true);

    expect(result).toBe(true);
  });

  it('one pixel below the breakpoint, returns false', () => {
    const width = FACTS_STACK_TWO_COLUMN_BREAKPOINT - 1;

    const result = isFactsStackTwoColumn(width, 'web', true);

    expect(result).toBe(false);
  });

  it('without an aside, returns false', () => {
    const width = 1280;

    const result = isFactsStackTwoColumn(width, 'web', false);

    expect(result).toBe(false);
  });

  it('on native, returns false', () => {
    const width = 1280;

    const result = isFactsStackTwoColumn(width, 'ios', true);

    expect(result).toBe(false);
  });
});

describe('FactsStrip', () => {
  it('with three facts, renders one list item per fact in order', () => {
    render(<FactsStrip facts={FACTS} />);

    const items = screen.getAllByRole('listitem').map((item) => item.getAttribute('data-testid'));

    expect(items).toEqual(['facts-strip-a', 'facts-strip-b', 'facts-strip-c']);
  });
});

describe('FactsStack', () => {
  it('with an aside, places it after the sections', () => {
    render(
      <FactsStack aside={<span>side</span>} facts={FACTS}>
        <span>main</span>
      </FactsStack>,
    );

    const sections = screen.getByTestId('facts-stack-sections');
    const aside = screen.getByTestId('facts-stack-aside');

    expect(sections.compareDocumentPosition(aside) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
