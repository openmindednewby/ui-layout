import { A4_PAGE, pageScale, scaledFrame } from './pageScale';

describe('pageScale', () => {
  it('with a container narrower than the page, returns the width ratio', () => {
    const containerWidth = 397;

    const scale = pageScale(containerWidth, A4_PAGE.width);

    expect(scale).toBe(0.5);
  });

  it('with a container wider than the page, never scales up', () => {
    const containerWidth = 1600;

    const scale = pageScale(containerWidth, 794);

    expect(scale).toBe(1);
  });

  it('with an unmeasured container, keeps the page at full size', () => {
    const containerWidth = 0;

    const scale = pageScale(containerWidth, 794);

    expect(scale).toBe(1);
  });
});

describe('scaledFrame', () => {
  it('with half the page width, halves the outer height and pins the page top-left', () => {
    const page = { width: 800, height: 1200 };

    const frame = scaledFrame(400, page);

    expect(frame).toEqual({ scale: 0.5, height: 600, offsetX: -200, offsetY: -300 });
  });

  it('with a container wider than the page, keeps the page height and no offset', () => {
    const page = { width: 794, height: 1123 };

    const frame = scaledFrame(1200, page);

    expect(frame).toEqual({ scale: 1, height: 1123, offsetX: 0, offsetY: 0 });
  });
});
