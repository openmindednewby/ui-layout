import { render, screen } from '@testing-library/react';

import { CardTitle } from './CardTitle';

describe('CardTitle', () => {
  it('with a label, renders it as a heading', () => {
    const label = 'PEP leaders';

    render(<CardTitle label={label} testID="title" />);

    expect({ text: screen.getByTestId('title').textContent, role: screen.getByTestId('title').getAttribute('role') }).toEqual({ text: label, role: 'heading' });
  });
});
