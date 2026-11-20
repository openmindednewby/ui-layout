import { readableTone } from './readableTone';

describe('readableTone', () => {
  it('with a pale brand tone under 4.5:1 on white, returns the body ink', () => {
    const backgrounds = ['#ffffff'];

    const tone = readableTone('#8ab4ff', backgrounds, '#111827');

    expect(tone).toBe('#111827');
  });

  it('with a deep brand tone over 4.5:1 on white, keeps the brand tone', () => {
    const backgrounds = ['#ffffff'];

    const tone = readableTone('#1d4ed8', backgrounds, '#111827');

    expect(tone).toBe('#1d4ed8');
  });

  it('with a tone readable on one background but not the other, returns the body ink', () => {
    const backgrounds = ['#ffffff', '#1d4ed8'];

    const tone = readableTone('#1e40af', backgrounds, '#111827');

    expect(tone).toBe('#111827');
  });

  it('with a non-hex tone it cannot measure, keeps the tone', () => {
    const backgrounds = ['#ffffff'];

    const tone = readableTone('rgb(0, 0, 0)', backgrounds, '#111827');

    expect(tone).toBe('rgb(0, 0, 0)');
  });
});
