import { render, screen } from '@testing-library/react';

import { KeyValueRows } from './KeyValueRows';
import { LabelValueLine } from './LabelValueLine';

describe('LabelValueLine', () => {
  it('with a label width, fixes the label column to it and lets the value wrap', () => {
    render(<LabelValueLine label="Country" labelWidth={90} testID="line"><span /></LabelValueLine>);

    const label = getComputedStyle(screen.getByTestId('line-label')).width;

    expect({ label, wrap: getComputedStyle(screen.getByTestId('line')).flexWrap }).toEqual({ label: '90px', wrap: 'wrap' });
  });
});

describe('KeyValueRows', () => {
  it('with two rows, renders one row per key in order', () => {
    render(<KeyValueRows rows={[{ key: 'a', label: 'A', value: '1' }, { key: 'b', label: 'B', value: '2' }]} testID="kv" />);

    const texts = [screen.getByTestId('kv-a').textContent, screen.getByTestId('kv-b').textContent];

    expect(texts).toEqual(['A1', 'B2']);
  });
});
