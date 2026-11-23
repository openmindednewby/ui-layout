import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { CopyControl } from './CopyControl';
import { CopyValueRow } from './CopyValueRow';

jest.mock('@dloizides/ui-icons', () => ({ SvgIcon: (): null => null }));

const LABELS = { copy: 'Copy', copied: 'Copied', failed: 'Copy failed', hint: 'Copies the value' };
const TAP_FLOOR = 44;

function px(value: string): number {
  return value === '' ? 0 : Number.parseFloat(value);
}

function renderIconRow(writer: jest.Mock = jest.fn()): HTMLElement {
  render(<CopyValueRow copyControl={CopyControl.Icon} label="IBAN" labels={LABELS} testID="iban" value="CY59 0020" writer={writer} />);
  return screen.getByTestId('iban-copy');
}

describe('CopyValueRow icon control', () => {
  it('with the icon control, names the button with the action and the field, shows no copy text', () => {
    const button = renderIconRow();

    const name = button.getAttribute('aria-label');

    expect(name).toBe('Copy: IBAN');
    expect(screen.getByTestId('iban').textContent).not.toContain('Copy');
  });

  it('with the icon control, the button box is at least 44 px on both axes', () => {
    const button = renderIconRow();

    const css = window.getComputedStyle(button);

    expect(px(css.minHeight) + px(css.paddingTop) + px(css.paddingBottom)).toBeGreaterThanOrEqual(TAP_FLOOR);
    expect(px(css.minWidth) + px(css.paddingLeft) + px(css.paddingRight)).toBeGreaterThanOrEqual(TAP_FLOOR);
  });

  it('with the icon control, a press copies the value and shows the copied word beside the icon', async () => {
    const writer = jest.fn();
    const button = renderIconRow(writer);

    fireEvent.click(button);

    await waitFor(() => expect(screen.getByTestId('iban-copy').getAttribute('aria-label')).toBe('Copied: IBAN'));
    expect(screen.getByTestId('iban-copy').textContent).toContain('Copied');
    expect(writer).toHaveBeenCalledWith('CY59 0020');
  });

  it('without a control choice, keeps the text button', () => {
    render(<CopyValueRow label="IBAN" labels={LABELS} testID="iban" value="CY59" writer={jest.fn()} />);

    const text = screen.getByTestId('iban-copy').textContent;

    expect(text).toContain('Copy');
  });
});
