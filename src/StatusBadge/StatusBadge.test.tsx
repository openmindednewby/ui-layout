import { render, screen } from '@testing-library/react';

import { UiProvider } from '@dloizides/ui-feedback';
import type { UiTheme } from '@dloizides/ui-feedback';

import { BadgeTone } from './BadgeTone';
import { StatusBadge } from './StatusBadge';

const TEST_ID = 'badge';

describe('StatusBadge', () => {
  it('with an icon, keeps the icon out of the accessibility tree', () => {
    render(<StatusBadge backgroundColor="#efe" color="#0a0" icon={<span data-testid="glyph" />} label="Active" testID={TEST_ID} />);

    const wrapper = screen.getByTestId('glyph').parentElement;

    expect(wrapper?.getAttribute('aria-hidden')).toBe('true');
  });

  it('with an icon, lays the icon and label out in a row', () => {
    render(<StatusBadge backgroundColor="#efe" color="#0a0" icon={<span />} label="Active" testID={TEST_ID} />);

    const badge = screen.getByTestId(TEST_ID);

    expect(getComputedStyle(badge).flexDirection).toBe('row');
  });

  it('without an icon, renders only the label', () => {
    render(<StatusBadge backgroundColor="#efe" color="#0a0" label="Active" testID={TEST_ID} />);

    const badge = screen.getByTestId(TEST_ID);

    expect(badge.children).toHaveLength(1);
  });

  it('when dashed, draws a dashed border in the label colour', () => {
    render(<StatusBadge backgroundColor="transparent" color="rgb(0, 170, 0)" dashed label="Draft" testID={TEST_ID} />);

    const style = getComputedStyle(screen.getByTestId(TEST_ID));

    expect([style.borderTopStyle, style.borderTopColor]).toEqual(['dashed', 'rgba(0,170,0,1.00)']);
  });

  it('by default, draws no border', () => {
    render(<StatusBadge backgroundColor="transparent" color="rgb(0, 170, 0)" label="Active" testID={TEST_ID} />);

    const style = getComputedStyle(screen.getByTestId(TEST_ID));

    expect(style.borderTopStyle).not.toBe('dashed');
  });
});

describe('StatusBadge tone', () => {
  it('with raw colours and a tone, keeps the raw colours', () => {
    render(<StatusBadge backgroundColor="rgb(1, 2, 3)" color="rgb(4, 5, 6)" label="Active" testID={TEST_ID} tone={BadgeTone.Danger} />);

    const style = getComputedStyle(screen.getByTestId(TEST_ID));

    expect(style.backgroundColor).toBe('rgb(1, 2, 3)');
  });

  it('with only a tone, fills with that tone from the theme', () => {
    const errorFill = '#dc2626';
    const errorFillRgb = 'rgb(220, 38, 38)';
    const whiteInkRgb = 'rgb(255, 255, 255)';
    const theme: UiTheme = {
      colors: { background: '#fff', surface: '#fff', surfaceElevated: '#f4f4f5', text: '#18181b', textSecondary: '#52525b', border: '#d4d4d8' },
      palette: { primary: { '500': '#2563eb' } },
      semantic: { error: { '500': errorFill } },
    };
    render(
      <UiProvider t={(key) => key} theme={theme}>
        <StatusBadge label="Active" testID={TEST_ID} tone={BadgeTone.Danger} />
      </UiProvider>,
    );

    const badge = screen.getByTestId(TEST_ID);

    const colors = [getComputedStyle(badge).backgroundColor, getComputedStyle(screen.getByText('Active')).color];

    expect(colors).toEqual([errorFillRgb, whiteInkRgb]);
  });
});
