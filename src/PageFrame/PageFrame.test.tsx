import { act, fireEvent, render, screen } from '@testing-library/react';

import { PageFrame } from './PageFrame';

jest.mock('@dloizides/ui-icons', () => ({ SvgIcon: () => null }));

const PAGE = { width: 794, height: 1123 };

describe('PageFrame', () => {
  it('without enlargeable, offers no enlarge control', () => {
    render(
      <PageFrame pageSize={PAGE} testID="pf">
        <span>Page</span>
      </PageFrame>,
    );

    const trigger = screen.queryByTestId('pf-enlarge');

    expect(trigger).toBeNull();
  });

  it('with enlargeable, a press opens the overlay with the page at full size', () => {
    render(
      <PageFrame enlargeable pageSize={PAGE} testID="pf">
        <span>Page</span>
      </PageFrame>,
    );

    fireEvent.click(screen.getByTestId('pf-enlarge'));

    const page = screen.getByTestId('pf-overlay-page');
    expect(page.style.width).toBe(`${PAGE.width}px`);
    expect(page.style.height).toBe(`${PAGE.height}px`);
    expect(page.style.transform).toBe('');
  });

  it('with enlargeable, the preview is a focusable native button, so Enter opens it', () => {
    render(
      <PageFrame enlargeable pageSize={PAGE} testID="pf">
        <span>Page</span>
      </PageFrame>,
    );

    const trigger = screen.getByTestId('pf-enlarge');

    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger.getAttribute('tabindex')).toBe('0');
  });

  it('with the overlay open, Escape closes it and returns focus to the preview', () => {
    jest.useFakeTimers();
    render(
      <PageFrame enlargeable pageSize={PAGE} testID="pf">
        <span>Page</span>
      </PageFrame>,
    );
    const trigger = screen.getByTestId('pf-enlarge');
    trigger.focus();
    fireEvent.click(trigger);

    fireEvent.keyDown(document, { key: 'Escape' });
    act(() => {
      jest.runAllTimers();
    });

    expect(screen.queryByTestId('pf-overlay-page')).toBeNull();
    expect(document.activeElement).toBe(trigger);
    jest.useRealTimers();
  });
});
