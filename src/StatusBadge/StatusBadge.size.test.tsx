import { render, screen } from '@testing-library/react';

import { BadgeSize } from './BadgeSize';
import { StatusBadge } from './StatusBadge';

const TEST_ID = 'badge';

describe('StatusBadge size', () => {
  it('with the compact size, draws a fully round 8x1 px chip', () => {
    render(<StatusBadge backgroundColor="#eef0f4" color="#3c4452" label="In use, locked" size={BadgeSize.Compact} testID={TEST_ID} />);

    const style = getComputedStyle(screen.getByTestId(TEST_ID));

    expect([style.paddingLeft, style.paddingTop, style.borderTopLeftRadius]).toEqual(['8px', '1px', '999px']);
  });

  it('without a size, keeps the regular 10x4 px pill', () => {
    render(<StatusBadge backgroundColor="#eef0f4" color="#3c4452" label="Active" testID={TEST_ID} />);

    const style = getComputedStyle(screen.getByTestId(TEST_ID));

    expect([style.paddingLeft, style.paddingTop, style.borderTopLeftRadius]).toEqual(['10px', '4px', '12px']);
  });
});
