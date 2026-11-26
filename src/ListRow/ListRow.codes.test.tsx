import { render, screen } from '@testing-library/react';

import { ListRow } from './ListRow';

function renderRow(title: string, meta?: string): void {
  render(<ListRow accessibilityHint="Shows the invoice" accessibilityLabel="Invoice" meta={meta} selected={false} title={title} onPress={jest.fn()} />);
}

describe('ListRow hyphenated codes', () => {
  it('with an invoice number in the title, keeps the number on one line', () => {
    renderRow('Invoice 2026-016 for quarterly maintenance');

    const code = screen.getByText('2026-016');

    expect(code.style.whiteSpace).toBe('nowrap');
  });

  it('with an invoice number in the meta, keeps the number on one line', () => {
    renderRow('Invoice', 'Ref INV-2026-014 due today');

    const code = screen.getByText('INV-2026-014');

    expect(code.style.whiteSpace).toBe('nowrap');
  });

  it('with a hyphenated word and no digit, leaves the word free to wrap', () => {
    renderRow('A well-known supplier');

    const title = screen.getByText('A well-known supplier');

    expect(title.style.whiteSpace).not.toBe('nowrap');
  });
});
