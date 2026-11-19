import { fireEvent, render, screen } from '@testing-library/react';

import { ToggleSection } from './ToggleSection';

const CONTENT = 'filter fields';

function renderSection(wide: boolean, forceOpen = false): void {
  render(<ToggleSection forceOpen={forceOpen} testID="filters" title="Filters" toggleHint="Shows the filters" toggleLabel="Filters" wide={wide}><span>{CONTENT}</span></ToggleSection>);
}

describe('ToggleSection', () => {
  it('when wide, shows the content in a titled card without a toggle', () => {
    renderSection(true);

    const card = screen.getByTestId('filters-card');

    expect(card.textContent).toContain(CONTENT);
    expect(screen.queryByTestId('filters-toggle')).toBeNull();
  });

  it('when narrow, shows the content after the toggle is pressed', () => {
    renderSection(false);

    fireEvent.click(screen.getByTestId('filters-toggle'));

    expect(screen.getByText(CONTENT)).toBeTruthy();
  });

  it('when narrow and not pressed, hides the content', () => {
    const wide = false;

    renderSection(wide);

    expect(screen.queryByText(CONTENT)).toBeNull();
  });

  it('when narrow and pressed twice, hides the content again', () => {
    renderSection(false);
    fireEvent.click(screen.getByTestId('filters-toggle'));

    fireEvent.click(screen.getByTestId('filters-toggle'));

    expect(screen.queryByText(CONTENT)).toBeNull();
  });

  it('when narrow and forced open, shows the content without a press', () => {
    const forced = true;

    renderSection(false, forced);

    expect(screen.getByText(CONTENT)).toBeTruthy();
  });
});
