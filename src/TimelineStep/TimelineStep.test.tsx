import { render, screen } from '@testing-library/react';
import { Text } from 'react-native';

import { StepMarkerState } from './StepMarkerState';
import { TimelineStep } from './TimelineStep';

import type { TimelineStepProps } from './TimelineStep';

jest.mock('@dloizides/ui-icons', () => ({ SvgIcon: () => null }));

const renderStep = (extra: Partial<TimelineStepProps> = {}): void => {
  render(
    <TimelineStep isLast={false} number={2} state={StepMarkerState.Current} testID="st" {...extra}>
      <Text>Body</Text>
    </TimelineStep>,
  );
};

describe('TimelineStep', () => {
  it('with a current state, shows the step number in the marker', () => {
    renderStep();

    const marker = screen.getByTestId('st-marker');

    expect(marker.textContent).toBe('2');
  });

  it('with a done state, shows a check instead of the step number', () => {
    renderStep({ state: StepMarkerState.Done });

    const marker = screen.getByTestId('st-marker');

    expect(marker.textContent).toBe('');
  });

  it('as the last step, draws no line to the next step', () => {
    renderStep({ isLast: true });

    const line = screen.queryByTestId('st-line');

    expect(line).toBeNull();
  });

  it('with marker and line test ids, uses them in place of the derived ones', () => {
    renderStep({ markerTestID: 'm-1', lineTestID: 'l-1' });

    const ids = [screen.queryByTestId('m-1'), screen.queryByTestId('l-1')];

    expect(ids.every((node) => node !== null)).toBe(true);
  });

  it('with a body, renders it beside the rail', () => {
    renderStep({ accessibilityLabel: 'Step 2', accessibilityHint: 'In progress' });

    const step = screen.getByTestId('st');

    expect(step.textContent).toBe('2Body');
  });
});
