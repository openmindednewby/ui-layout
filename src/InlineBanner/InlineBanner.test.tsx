import { render, screen } from '@testing-library/react';
import { Text } from 'react-native';

import { BannerTone } from './BannerTone';
import { InlineBanner } from './InlineBanner';

const TEST_ID = 'banner';

describe('InlineBanner', () => {
  it('with an icon slot, hands the tone ink to the icon', () => {
    const renderIcon = jest.fn(() => null);

    render(<InlineBanner renderIcon={renderIcon} testID={TEST_ID} tone={BannerTone.Info}>Imported 12 lines</InlineBanner>);

    expect(renderIcon).toHaveBeenCalledWith(expect.stringMatching(/^#|rgb/));
  });

  it('with a title and body text, reads as one sentence with the title first', () => {
    render(<InlineBanner testID={TEST_ID} title="Imported 12 lines.">Period 1 to 30 Nov</InlineBanner>);

    const text = screen.getByTestId(`${TEST_ID}-text`).textContent;
    expect(text).toBe('Imported 12 lines. Period 1 to 30 Nov');
  });

  it('with element children, renders them without the text wrapper', () => {
    render(<InlineBanner testID={TEST_ID}><Text testID="custom">Custom</Text></InlineBanner>);

    const wrapper = screen.queryByTestId(`${TEST_ID}-text`);
    expect([wrapper, screen.getByTestId('custom').textContent]).toEqual([null, 'Custom']);
  });
});
