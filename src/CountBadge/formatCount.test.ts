import { formatCount } from './formatCount';

describe('formatCount', () => {
  it('with a count at or below max, returns the count', () => {
    const count = 99;

    const result = formatCount(count, 99);

    expect(result).toBe('99');
  });

  it('with a count above max, returns max followed by a plus', () => {
    const count = 150;

    const result = formatCount(count, 99);

    expect(result).toBe('99+');
  });

  it('with a negative or fractional count, returns the whole non-negative part', () => {
    const counts = [-3, 4.7];

    const result = counts.map((c) => formatCount(c, 99));

    expect(result).toEqual(['0', '4']);
  });
});
