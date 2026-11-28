import { nextTabIndex } from './tabKeyNav';

describe('nextTabIndex', () => {
  it('with ArrowRight on the last tab, wraps to the first', () => {
    const key = 'ArrowRight';

    const next = nextTabIndex(key, 4, 5);

    expect(next).toBe(0);
  });

  it('with ArrowLeft on the first tab, wraps to the last', () => {
    const key = 'ArrowLeft';

    const next = nextTabIndex(key, 0, 5);

    expect(next).toBe(4);
  });

  it('with Home and End, jumps to the first and last tab', () => {
    const keys = ['Home', 'End'];

    const next = keys.map((key) => nextTabIndex(key, 2, 5));

    expect(next).toEqual([0, 4]);
  });

  it('with a key that is not a tab key, returns undefined', () => {
    const key = 'Enter';

    const next = nextTabIndex(key, 2, 5);

    expect(next).toBeUndefined();
  });
});
