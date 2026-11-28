import { render, screen } from '@testing-library/react';

import { ThumbnailSlot } from './ThumbnailSlot';

describe('ThumbnailSlot', () => {
  it('with colours, paints the dashed frame with them', () => {
    render(<ThumbnailSlot caption="Selfie" colors={{ border: 'rgb(1, 2, 3)', fill: 'rgb(4, 5, 6)', text: 'rgb(7, 8, 9)', caption: 'rgb(10, 11, 12)' }} mark="IMG" testID="thumb" />);

    const box = getComputedStyle(screen.getByTestId('thumb-box'));

    expect({ fill: box.backgroundColor, style: box.borderTopStyle }).toEqual({ fill: 'rgb(4, 5, 6)', style: 'dashed' });
  });
});
