import { render, screen } from '@testing-library/react';

import { StatusBadge } from './StatusBadge';

const TEST_ID = 'badge';

describe('StatusBadge wrapping', () => {
  it('in a squeezed row, never shrinks below its longest word', () => {
    render(<StatusBadge backgroundColor="#eef0f4" color="#3c4452" label="Review" testID={TEST_ID} />);

    const style = getComputedStyle(screen.getByTestId(TEST_ID));

    expect(style.minWidth).toBe('auto');
  });
});
