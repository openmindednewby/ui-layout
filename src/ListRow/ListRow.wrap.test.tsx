import { render, screen } from '@testing-library/react';

import { ListRow } from './ListRow';

const LONG_TITLE = 'Invoice 2026-016 for quarterly maintenance, hosting and support';

function titleElement(): HTMLElement {
  render(<ListRow accessibilityHint="Shows the invoice" accessibilityLabel="2026-016" selected={false} title={LONG_TITLE} trailing="€12,875.50" onPress={jest.fn()} />);
  return screen.getByText((_, element) => element?.tagName === 'DIV' && element.textContent === LONG_TITLE);
}

describe('ListRow title wrapping', () => {
  it('with a long title, wraps at word boundaries and never breaks every character', () => {
    const title = titleElement();

    expect(title.style.wordBreak).toBe('normal');
  });

  it('with a long title, breaks inside a word only for a single unbreakable token', () => {
    const title = titleElement();

    expect(title.style.overflowWrap).toBe('break-word');
  });

  it('with a long title, keeps the box at least its longest word wide instead of shrinking to zero', () => {
    const title = titleElement();

    expect({ minWidth: title.style.minWidth, maxWidth: title.style.maxWidth, flexBasis: title.style.flexBasis }).toEqual({ minWidth: 'auto', maxWidth: '100%', flexBasis: '0px' });
  });
});
