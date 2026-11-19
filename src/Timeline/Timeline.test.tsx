import { render, screen } from '@testing-library/react';

import { Timeline } from './Timeline';

import type { TimelineEntry } from './Timeline';

const entry = (key: string, extra: Partial<TimelineEntry> = {}): TimelineEntry => ({
  key, time: '19 Nov 10:00', title: `Title ${key}`, accessibilityLabel: `Entry ${key}`, accessibilityHint: 'One step of the case', ...extra,
});

describe('Timeline', () => {
  it('with a testID, gives each entry its own testID in the given order', () => {
    render(<Timeline accessibilityHint="Case history" accessibilityLabel="Timeline" entries={[entry('b'), entry('a')]} testID="tl" />);

    const items = screen.getAllByRole('listitem');

    expect(items.map((item) => item.getAttribute('data-testid'))).toEqual(['tl-b', 'tl-a']);
  });

  it('with a status, shows the status beside the title', () => {
    render(<Timeline accessibilityHint="Case history" accessibilityLabel="Timeline" entries={[entry('a', { status: 'Approved' })]} testID="tl" />);

    const text = screen.getByTestId('tl-a').textContent ?? '';

    expect(text).toContain('Title a');
    expect(text).toContain('Approved');
  });

  it('with an empty time and no status, shows only the title', () => {
    render(<Timeline accessibilityHint="Case history" accessibilityLabel="Timeline" entries={[entry('a', { time: '', status: '' })]} testID="tl" />);

    const text = screen.getByTestId('tl-a').textContent;

    expect(text).toBe('Title a');
  });
});
