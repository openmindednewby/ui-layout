/**
 * Component-level proof that the responsive default picks the inline menu on a
 * WIDE viewport — the viewport width is mocked via `useWindowDimensions`.
 */
jest.mock('react-native', () => {
  const actual = jest.requireActual('react-native');
  return {
    ...actual,
    useWindowDimensions: () => ({ width: 1280, height: 800, scale: 1, fontScale: 1 }),
  };
});

import { render, screen, fireEvent } from '@testing-library/react';

import { ModalDropdown } from './ModalDropdown';

describe('ModalDropdown responsive default (wide viewport mocked)', () => {
  it('renders the inline menu (not a modal) when no variant is given on wide web', () => {
    render(
      <ModalDropdown
        testID="wide-select"
        accessibilityLabel="Wide"
        accessibilityHint="Pick"
        value="a"
        options={[{ label: 'Alpha', value: 'a' }, { label: 'Beta', value: 'b' }]}
        onChange={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByTestId('wide-select'));
    expect(screen.getByTestId('wide-select-menu')).toBeTruthy();
    expect(screen.queryByTestId('wide-select-backdrop')).toBeNull();
  });
});
