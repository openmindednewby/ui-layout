import { render, screen } from '@testing-library/react';
import { Text } from 'react-native';

import { BannerIconShape } from './BannerIconShape';
import { BannerTone } from './BannerTone';
import { InlineBanner } from './InlineBanner';

const TEST_ID = 'banner';

const mockIcon = jest.fn((_props: { shape: string; color: string; cutout: string }) => null);

jest.mock('./BannerIcon', () => ({ BannerIcon: (props: { shape: string; color: string; cutout: string }) => mockIcon(props) }));

beforeEach(() => mockIcon.mockClear());

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

  it('with no icon slot and the success tone, draws the filled check disk', () => {
    render(<InlineBanner testID={TEST_ID} tone={BannerTone.Success}>Saved</InlineBanner>);

    expect(mockIcon).toHaveBeenCalledWith(expect.objectContaining({ shape: BannerIconShape.CheckDisk }));
  });

  it('with no icon slot and the info tone, draws the circle-i', () => {
    render(<InlineBanner testID={TEST_ID} tone={BannerTone.Info}>Heads up</InlineBanner>);

    expect(mockIcon).toHaveBeenCalledWith(expect.objectContaining({ shape: BannerIconShape.InfoCircle }));
  });

  it('with an icon slot, draws the slot instead of the default icon', () => {
    render(<InlineBanner renderIcon={() => null} testID={TEST_ID} tone={BannerTone.Success}>Saved</InlineBanner>);

    expect(mockIcon).not.toHaveBeenCalled();
  });
});
