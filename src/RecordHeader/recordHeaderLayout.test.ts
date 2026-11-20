import { isRecordHeaderCompact } from './recordHeaderLayout';

const PHONE = 360;
const DESKTOP = 1280;
const CUSTOM_BREAKPOINT = 400;

describe('isRecordHeaderCompact', () => {
  it('with a phone width, returns true', () => {
    const width = PHONE;

    const compact = isRecordHeaderCompact(width);

    expect(compact).toBe(true);
  });

  it('with a desktop width, returns false', () => {
    const width = DESKTOP;

    const compact = isRecordHeaderCompact(width);

    expect(compact).toBe(false);
  });

  it('with a custom breakpoint below the width, returns false', () => {
    const width = PHONE + CUSTOM_BREAKPOINT;

    const compact = isRecordHeaderCompact(width, CUSTOM_BREAKPOINT);

    expect(compact).toBe(false);
  });
});
