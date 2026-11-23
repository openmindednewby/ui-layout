import { render, screen } from '@testing-library/react';

import { PageHead } from './PageHead';

describe('PageHead', () => {
  it('with actions, shows them beside the title', () => {
    render(<PageHead actions={<span>New profile</span>} testID="head" title="Policy" />);

    const actions = screen.getByTestId('head-actions');

    expect(actions.textContent).toBe('New profile');
    expect(screen.getByTestId('head-title').textContent).toBe('Policy');
  });

  it('with actions set to false, renders no actions slot', () => {
    const actions = false;

    render(<PageHead actions={actions} testID="head" title="Policy" />);

    expect(screen.queryByTestId('head-actions')).toBeNull();
  });

  it('with initialFocus, focuses the title and marks it as the menu default', () => {
    render(<PageHead initialFocus testID="head" title="Policy" />);

    const title = screen.getByTestId('head-title');

    expect(document.activeElement).toBe(title);
    expect(title.getAttribute('data-menu-default')).toBe('true');
  });

  it('without initialFocus, leaves focus where it was', () => {
    render(<PageHead testID="head" title="Policy" />);

    const title = screen.getByTestId('head-title');

    expect(document.activeElement).not.toBe(title);
    expect(title.getAttribute('data-menu-default')).toBeNull();
  });
});
