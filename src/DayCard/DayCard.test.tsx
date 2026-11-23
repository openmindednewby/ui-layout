import { render, screen } from '@testing-library/react';

import { UiProvider, type UiTheme } from '@dloizides/ui-feedback';

import { LIGHT_THEME } from '../__testing__/badgeThemes';
import { DayBadgeFill } from './DayBadgeFill';
import { DayCard } from './DayCard';

jest.mock('@dloizides/ui-icons', () => ({ SvgIcon: () => null }));

describe('DayCard', () => {
  it('with three items, shows the count beside the day label and badge', () => {
    render(<DayCard accessibilityHint="Items opened that day" accessibilityLabel="Opened Nov 8" badge="waiting 10 days" count={3} label="Opened Nov 8" testID="day"><span>row</span></DayCard>);

    const text = screen.getByTestId('day').textContent ?? '';

    expect(text).toContain('Opened Nov 8');
    expect(text).toContain('waiting 10 days');
    expect(text).toContain('3');
  });
});

const TINTED: UiTheme = { ...LIGHT_THEME, semantic: { ...LIGHT_THEME.semantic, warning: { '100': '#fef3c7', '500': '#d97706', '700': '#92400e' } } };
const t = (key: string): string => key;

describe('DayCard badgeFill', () => {
  it('with a tint fill, paints the badge with the tone tint step', () => {
    const fill = DayBadgeFill.Tint;

    render(<UiProvider t={t} theme={TINTED}><DayCard accessibilityHint="Items opened that day" accessibilityLabel="Opened Nov 8" badge="waiting 10 days" badgeFill={fill} count={3} label="Opened Nov 8" testID="day"><span>row</span></DayCard></UiProvider>);

    expect(window.getComputedStyle(screen.getByTestId('day-badge')).backgroundColor).toBe('rgb(254, 243, 199)');
  });
});
