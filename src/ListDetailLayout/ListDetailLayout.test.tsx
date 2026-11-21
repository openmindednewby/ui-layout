import { act, render, screen } from '@testing-library/react';

import { ListDetailLayout } from './ListDetailLayout';
import { ListDetailPane } from './ListDetailPane';

const NARROW = 390;
const WIDE = 1280;

function setWidth(width: number): void {
  Object.defineProperty(window, 'innerWidth', { value: width, configurable: true, writable: true });
  Object.defineProperty(document.documentElement, 'clientWidth', { value: width, configurable: true });
  act(() => {
    window.dispatchEvent(new Event('resize'));
  });
}

describe('ListDetailLayout', () => {
  it('when wide with no detail, shows the list and the placeholder side by side', () => {
    setWidth(WIDE);

    render(<ListDetailLayout list={<span data-testid="l" />} placeholder={<span data-testid="p" />} testID="ld" />);

    expect([screen.queryByTestId('l') !== null, screen.queryByTestId('p') !== null]).toEqual([true, true]);
  });

  it('when narrow with the detail asked for, shows only the detail', () => {
    setWidth(NARROW);

    render(<ListDetailLayout detail={<span data-testid="d" />} list={<span data-testid="l" />} narrowPane={ListDetailPane.Detail} testID="ld" />);

    expect([screen.queryByTestId('l'), screen.queryByTestId('d') !== null]).toEqual([null, true]);
  });
});
