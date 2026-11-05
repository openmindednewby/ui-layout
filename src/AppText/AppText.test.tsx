import { render, screen } from '@testing-library/react';

import { useUi } from '@dloizides/ui-feedback';

import { AppText } from './AppText';
import { TextKind } from './TextKind';

const inkOf = (testID: string): string => getComputedStyle(screen.getByTestId(testID)).color;

const Ink = ({ ink }: { ink: 'text' | 'textSecondary' }): React.ReactElement => {
  const { theme } = useUi();
  return <span data-testid="expected" style={{ color: theme.colors[ink] }} />;
};

describe('AppText', () => {
  it('with the muted kind, uses the secondary ink', () => {
    render(<><AppText kind={TextKind.Muted} testID="actual">x</AppText><Ink ink="textSecondary" /></>);

    const actual = inkOf('actual');

    expect(actual).toBe(inkOf('expected'));
  });

  it('with no kind, uses the primary ink', () => {
    render(<><AppText testID="actual">x</AppText><Ink ink="text" /></>);

    const actual = inkOf('actual');

    expect(actual).toBe(inkOf('expected'));
  });

  it('with an explicit colour, uses that colour over the kind ink', () => {
    render(<AppText color="rgb(1, 2, 3)" kind={TextKind.Small} testID="actual">x</AppText>);

    const actual = inkOf('actual');

    expect(actual).toBe('rgb(1, 2, 3)');
  });
});
