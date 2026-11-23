import { render, screen } from '@testing-library/react';

import { Section } from './Section';
import { SectionVariant } from './SectionVariant';

describe('Section padding', () => {
  it('with a 20 by 22 padding pair, pads the card 20 px vertically and 22 px horizontally', () => {
    const padding = { vertical: 20, horizontal: 22 };

    render(<Section padding={padding} testID="card" variant={SectionVariant.Card}><span>body</span></Section>);

    const card = window.getComputedStyle(screen.getByTestId('card'));
    expect(card.paddingTop).toBe('20px');
    expect(card.paddingLeft).toBe('22px');
  });

  it('without padding, keeps the 16 px default', () => {
    render(<Section testID="card" variant={SectionVariant.Card}><span>body</span></Section>);

    const card = window.getComputedStyle(screen.getByTestId('card'));

    expect(card.paddingTop).toBe('16px');
  });
});
