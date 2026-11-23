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

describe('Section narrowPadding', () => {
  it('below the breakpoint with a 14 px narrow padding, pads the card 14 px', () => {
    const narrowPadding = 14;

    render(<Section breakpoint={100000} narrowPadding={narrowPadding} padding={{ vertical: 18, horizontal: 20 }} testID="card"><span>body</span></Section>);

    const card = window.getComputedStyle(screen.getByTestId('card'));

    expect(card.paddingTop).toBe('14px');
  });

  it('at or above the breakpoint, keeps the wide padding pair', () => {
    const padding = { vertical: 18, horizontal: 20 };

    render(<Section breakpoint={0} narrowPadding={14} padding={padding} testID="card"><span>body</span></Section>);

    const card = window.getComputedStyle(screen.getByTestId('card'));
    expect(card.paddingTop).toBe('18px');
    expect(card.paddingLeft).toBe('20px');
  });
});
