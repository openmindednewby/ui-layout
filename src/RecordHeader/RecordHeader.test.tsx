import { fireEvent, render, screen } from '@testing-library/react';

import { Breadcrumb } from './Breadcrumb';
import { RecordActionButton } from './RecordActionButton';

const REASON = 'Not available yet';

describe('RecordActionButton', () => {
  it('with no onPress, shows the disabled reason as the title', () => {
    render(<RecordActionButton disabledReason={REASON} hint="hint" label="Assign" testID="assign" />);

    const button = screen.getByTestId('assign');

    expect(button.getAttribute('title')).toBe(REASON);
  });

  it('with iconOnly and an icon, keeps the label as the accessible name only', () => {
    render(<RecordActionButton iconOnly hint="hint" icon={<span />} label="Notes" testID="notes" onPress={jest.fn()} />);

    const button = screen.getByTestId('notes');

    expect({ name: button.getAttribute('aria-label'), text: button.textContent }).toEqual({ name: 'Notes', text: '' });
  });

  it('when pressed, calls onPress', () => {
    const onPress = jest.fn();
    render(<RecordActionButton hint="hint" label="Notes" testID="notes" onPress={onPress} />);

    fireEvent.click(screen.getByTestId('notes'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('Breadcrumb', () => {
  it('when a linked step is pressed, calls its onPress', () => {
    const onPress = jest.fn();
    render(<Breadcrumb accessibilityLabel="trail" items={[{ key: 'list', label: 'Applicants', onPress, testID: 'crumb' }, { key: 'here', label: 'Individuals' }]} />);

    fireEvent.click(screen.getByTestId('crumb'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
