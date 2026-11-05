import { render, screen } from '@testing-library/react';

import { StatusBadge } from './StatusBadge';

const TEST_ID = 'badge';

describe('StatusBadge', () => {
  it('with an icon, keeps the icon out of the accessibility tree', () => {
    render(<StatusBadge backgroundColor="#efe" color="#0a0" icon={<span data-testid="glyph" />} label="Active" testID={TEST_ID} />);

    const wrapper = screen.getByTestId('glyph').parentElement;

    expect(wrapper?.getAttribute('aria-hidden')).toBe('true');
  });

  it('with an icon, lays the icon and label out in a row', () => {
    render(<StatusBadge backgroundColor="#efe" color="#0a0" icon={<span />} label="Active" testID={TEST_ID} />);

    const badge = screen.getByTestId(TEST_ID);

    expect(getComputedStyle(badge).flexDirection).toBe('row');
  });

  it('without an icon, renders only the label', () => {
    render(<StatusBadge backgroundColor="#efe" color="#0a0" label="Active" testID={TEST_ID} />);

    const badge = screen.getByTestId(TEST_ID);

    expect(badge.children).toHaveLength(1);
  });

  it('when dashed, draws a dashed border in the label colour', () => {
    render(<StatusBadge backgroundColor="transparent" color="rgb(0, 170, 0)" dashed label="Draft" testID={TEST_ID} />);

    const style = getComputedStyle(screen.getByTestId(TEST_ID));

    expect([style.borderTopStyle, style.borderTopColor]).toEqual(['dashed', 'rgb(0, 170, 0)']);
  });

  it('by default, draws no border', () => {
    render(<StatusBadge backgroundColor="transparent" color="rgb(0, 170, 0)" label="Active" testID={TEST_ID} />);

    const style = getComputedStyle(screen.getByTestId(TEST_ID));

    expect(style.borderTopStyle).not.toBe('dashed');
  });
});
