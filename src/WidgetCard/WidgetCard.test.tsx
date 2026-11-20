import { render, screen } from '@testing-library/react';

import { WidgetCard } from './WidgetCard';

describe('WidgetCard', () => {
  it('with a footer, renders the footer inside the card', () => {
    render(<WidgetCard footer={<span data-testid="bar" />} testID="card" title="Verification"><span /></WidgetCard>);

    const card = screen.getByTestId('card');

    expect(card.contains(screen.getByTestId('bar'))).toBe(true);
  });

  it('with a title, exposes it as the card heading', () => {
    render(<WidgetCard title="Summary"><span /></WidgetCard>);

    const heading = screen.getByRole('heading');

    expect(heading.textContent).toBe('Summary');
  });
});
