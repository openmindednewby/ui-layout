import { render, screen } from '@testing-library/react';
import { Dimensions } from 'react-native';

import { PageHead } from './PageHead';

describe('PageHead', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

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

  it('at a 360 px window with no compact prop, draws the 22 px phone title', () => {
    jest.spyOn(Dimensions, 'get').mockReturnValue({ width: 360, height: 640, scale: 1, fontScale: 1 });

    render(<PageHead testID="head" title="Decision matrix" />);

    expect(getComputedStyle(screen.getByTestId('head-title')).fontSize).toBe('22px');
  });

  it('at a 1280 px window with no compact prop, keeps the 24 px title', () => {
    jest.spyOn(Dimensions, 'get').mockReturnValue({ width: 1280, height: 800, scale: 1, fontScale: 1 });

    render(<PageHead testID="head" title="Decision matrix" />);

    expect(getComputedStyle(screen.getByTestId('head-title')).fontSize).toBe('24px');
  });

  it('with compact false at a 360 px window, keeps the 24 px title', () => {
    jest.spyOn(Dimensions, 'get').mockReturnValue({ width: 360, height: 640, scale: 1, fontScale: 1 });

    render(<PageHead compact={false} testID="head" title="Decision matrix" />);

    expect(getComputedStyle(screen.getByTestId('head-title')).fontSize).toBe('24px');
  });

  it('with a string subtitle in compact mode, draws it as 12 px text', () => {
    const subtitle = 'One line about the page';

    render(<PageHead compact subtitle={subtitle} testID="head" title="Jobs" />);

    const node = screen.getByTestId('head-subtitle');
    expect(node.textContent).toBe(subtitle);
    expect(getComputedStyle(node).fontSize).toBe('12px');
  });
});
