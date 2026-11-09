import { render, screen, fireEvent, act } from '@testing-library/react';
import { Text } from 'react-native';

import { ModalDropdown } from './ModalDropdown';
import { DropdownVariant } from './DropdownVariant';

const OPTIONS = [
  { label: 'Negotiation', value: 'negotiation' },
  { label: 'Proposal', value: 'proposal' },
];

const COMPACT_TRIGGER_WIDTH = 67;
const TRIGGER_LEFT = 100;
const TRIGGER_TOP = 50;
const TRIGGER_HEIGHT = 32;

function stubCompactAnchor(anchor: HTMLElement): void {
  anchor.getBoundingClientRect = () =>
    ({
      top: TRIGGER_TOP,
      left: TRIGGER_LEFT,
      width: COMPACT_TRIGGER_WIDTH,
      height: TRIGGER_HEIGHT,
      bottom: TRIGGER_TOP + TRIGGER_HEIGHT,
      right: TRIGGER_LEFT + COMPACT_TRIGGER_WIDTH,
      x: TRIGGER_LEFT,
      y: TRIGGER_TOP,
      toJSON: () => ({}),
    }) as DOMRect;
}

function renderChip(): React.ReactElement {
  return <Text>Move</Text>;
}

async function openMenuAndReadWidth(element: React.ReactElement): Promise<number> {
  render(element);
  const trigger = screen.getByTestId('d');
  stubCompactAnchor(trigger.parentElement as HTMLElement);
  fireEvent.click(trigger);
  await act(async () => {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  });
  const style = screen.getByTestId('d-menu').getAttribute('style') ?? '';
  const match = /(?:^|[; ])width:\s*(-?[\d.]+)px/.exec(style);
  return match === null ? Number.NaN : Number(match[1]);
}

function dropdown(extra: {
  renderTrigger?: () => React.ReactNode;
  menuMinWidth?: number;
}): React.ReactElement {
  return (
    <ModalDropdown
      accessibilityHint="Moves the deal to another stage"
      accessibilityLabel="Move"
      options={OPTIONS}
      testID="d"
      value="proposal"
      variant={DropdownVariant.Menu}
      onChange={jest.fn()}
      {...extra}
    />
  );
}

describe('ModalDropdown inline menu width', () => {
  beforeEach(() => {
    window.innerHeight = 800;
    window.innerWidth = 1280;
  });

  it('with a custom trigger and no menuMinWidth, floors the menu at 160', async () => {
    const element = dropdown({ renderTrigger: renderChip });

    const width = await openMenuAndReadWidth(element);

    expect(width).toBe(160);
  });

  it('with a custom trigger and a menuMinWidth below the default, uses the caller value', async () => {
    const element = dropdown({ renderTrigger: renderChip, menuMinWidth: 100 });

    const width = await openMenuAndReadWidth(element);

    expect(width).toBe(100);
  });

  it('with the default trigger and no menuMinWidth, keeps the trigger width', async () => {
    const element = dropdown({});

    const width = await openMenuAndReadWidth(element);

    expect(width).toBe(COMPACT_TRIGGER_WIDTH);
  });
});
