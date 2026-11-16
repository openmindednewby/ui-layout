import { render, screen } from '@testing-library/react';

import { CountBadge } from './CountBadge';

const TEST_ID = 'count';

describe('CountBadge', () => {
  it('with a zero count, renders nothing', () => {
    const { container } = render(<CountBadge count={0} testID={TEST_ID} />);

    const html = container.innerHTML;

    expect(html).toBe('');
  });

  it('with a zero count and showZero, renders the zero', () => {
    render(<CountBadge count={0} showZero testID={TEST_ID} />);

    const badge = screen.getByTestId(TEST_ID);

    expect(badge.textContent).toBe('0');
  });

  it('with a count above max, shows the capped text', () => {
    render(<CountBadge count={250} max={9} testID={TEST_ID} />);

    const badge = screen.getByTestId(TEST_ID);

    expect(badge.textContent).toBe('9+');
  });

  it('with a given accessibility label, exposes it', () => {
    render(<CountBadge accessibilityLabel="3 open" count={3} testID={TEST_ID} />);

    const badge = screen.getByTestId(TEST_ID);

    expect(badge.getAttribute('aria-label')).toBe('3 open');
  });
});
