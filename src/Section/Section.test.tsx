import { render, screen } from '@testing-library/react';

import { useUi } from '@dloizides/ui-feedback';

import { Section } from './Section';
import { SectionVariant } from './SectionVariant';

const styleOf = (testID: string): CSSStyleDeclaration => getComputedStyle(screen.getByTestId(testID));

const Fill = ({ of }: { of: 'background' | 'surface' }): React.ReactElement => {
  const { theme } = useUi();
  return <span data-testid="expected" style={{ backgroundColor: theme.colors[of] }} />;
};

describe('Section', () => {
  it('with no variant, keeps the panel fill and radius', () => {
    render(<><Section testID="actual" /><Fill of="surface" /></>);

    const actual = styleOf('actual');

    expect(actual.backgroundColor).toBe(styleOf('expected').backgroundColor);
    expect(actual.borderTopLeftRadius).toBe('6px');
  });

  it('with the card variant, uses the page fill and a larger radius', () => {
    render(<><Section testID="actual" variant={SectionVariant.Card} /><Fill of="background" /></>);

    const actual = styleOf('actual');

    expect(actual.backgroundColor).toBe(styleOf('expected').backgroundColor);
    expect(actual.borderTopLeftRadius).toBe('12px');
  });

  it('with a title, heads the card with a heading at the given level', () => {
    render(<Section testID="actual" title="Requests" titleLevel={3} />);

    const heading = screen.getByRole('heading', { level: 3 });

    expect(heading.textContent).toBe('Requests');
  });

  it('with no title, renders no heading', () => {
    render(<Section testID="actual" />);

    const headings = screen.queryAllByRole('heading');

    expect(headings).toHaveLength(0);
  });
});
