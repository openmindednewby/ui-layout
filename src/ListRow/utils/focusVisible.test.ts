import { isFocusVisible } from './focusVisible';

function target(matchesFocusVisible: boolean): { matches: (selector: string) => boolean } {
  return { matches: (selector: string) => selector === ':focus-visible' && matchesFocusVisible };
}

describe('isFocusVisible', () => {
  it('with focus from a mouse or touch press, returns false so no ring is drawn', () => {
    const element = target(false);

    const visible = isFocusVisible(element);

    expect(visible).toBe(false);
  });

  it('with focus from the keyboard, returns true so the ring is drawn', () => {
    const element = target(true);

    const visible = isFocusVisible(element);

    expect(visible).toBe(true);
  });

  it('with a native target that cannot match selectors, returns true', () => {
    const nativeTag = 42;

    const visible = isFocusVisible(nativeTag);

    expect(visible).toBe(true);
  });

  it('with a browser that rejects the focus-visible selector, returns true', () => {
    const element = { matches: (): boolean => { throw new SyntaxError('unknown selector'); } };

    const visible = isFocusVisible(element);

    expect(visible).toBe(true);
  });
});
