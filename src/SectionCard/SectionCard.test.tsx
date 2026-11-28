import { render, screen } from '@testing-library/react';

import { SectionCard } from './SectionCard';
import { SectionLabel } from './SectionLabel';

describe('SectionCard', () => {
  it('with a count and an aside, shows both beside the title', () => {
    render(<SectionCard aside="Updated today" count="3" testID="card" title="Matches"><span /></SectionCard>);

    const parts = [screen.getByTestId('card-count').textContent, screen.getByTestId('card-aside').textContent];

    expect(parts).toEqual(['3', 'Updated today']);
  });

  it('without a count, renders no pill', () => {
    render(<SectionCard testID="card" title="Matches"><span /></SectionCard>);

    const pill = screen.queryByTestId('card-count');

    expect(pill).toBeNull();
  });
});

describe('SectionLabel', () => {
  it('with a glyph, keeps the glyph out of the heading text', () => {
    render(<SectionLabel glyph="#" label="Documents" testID="label" />);

    const heading = screen.getByRole('heading');

    expect(heading.textContent).toBe('Documents');
  });
});
