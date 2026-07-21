/**
 * `CopyableId` behaviour: what it copies (the FULL value, never the truncated display string),
 * and that a failed clipboard write is surfaced rather than silently shown as success.
 *
 * The default `t` from ui-feedback's context returns the KEY, so the assertions below match on
 * `common.copied` / `common.copyFailed` — which is also what proves the three states resolve
 * through three DIFFERENT keys rather than sharing one.
 */
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';

import { CopyableId } from './CopyableId';
import { COPY_FEEDBACK_MS } from './useCopyToClipboard';

const GUID = '3f2a9c81-7b4e-4a10-9c3d-88f0a1b2d4e7';
const IDLE_KEY = 'common.copy';
const COPIED_KEY = 'common.copied';
const FAILED_KEY = 'common.copyFailed';

function setClipboard(value: unknown): void {
  Object.defineProperty(navigator, 'clipboard', { value, configurable: true, writable: true });
}

/** jsdom has no `document.execCommand` to spy on — see copyText.test.ts. Install one. */
function setExecCommand(result: boolean): void {
  Object.defineProperty(document, 'execCommand', {
    value: jest.fn(() => result),
    configurable: true,
    writable: true,
  });
}

function labelOf(testID: string): string | null {
  return screen.getByTestId(`${testID}-copy`).getAttribute('aria-label');
}

describe('CopyableId', () => {
  const originalClipboard = navigator.clipboard;

  afterEach(() => {
    setClipboard(originalClipboard);
    Reflect.deleteProperty(document, 'execCommand');
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('copies the FULL value, not the truncated display string', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    setClipboard({ writeText });

    render(<CopyableId value={GUID} testID="screening-id" />);
    fireEvent.click(screen.getByTestId('screening-id-copy'));

    await waitFor(() => { expect(writeText).toHaveBeenCalledWith(GUID); });
  });

  it('keeps the full value as the accessible name even when the display is shortened', () => {
    render(<CopyableId value={GUID} testID="screening-id" />);
    expect(screen.getByTestId('screening-id-value').getAttribute('aria-label')).toBe(GUID);
  });

  it('shows a distinct FAILURE state when the clipboard write fails', async () => {
    setClipboard(undefined);
    setExecCommand(false);

    render(<CopyableId value={GUID} testID="screening-id" />);
    expect(labelOf('screening-id')).toBe(IDLE_KEY);

    fireEvent.click(screen.getByTestId('screening-id-copy'));

    // The label must CHANGE, and change to something other than the success state — a failure
    // rendering like idle (or like success) leaves the analyst believing they hold the id.
    await waitFor(() => { expect(labelOf('screening-id')).toBe(FAILED_KEY); });
  });

  it('announces success and failure through DIFFERENT keys', async () => {
    setClipboard({ writeText: jest.fn().mockResolvedValue(undefined) });
    const { unmount } = render(<CopyableId value={GUID} testID="ok" />);
    fireEvent.click(screen.getByTestId('ok-copy'));
    await waitFor(() => { expect(labelOf('ok')).toBe(COPIED_KEY); });
    unmount();

    setClipboard(undefined);
    setExecCommand(false);
    render(<CopyableId value={GUID} testID="bad" />);
    fireEvent.click(screen.getByTestId('bad-copy'));
    await waitFor(() => { expect(labelOf('bad')).toBe(FAILED_KEY); });

    expect(COPIED_KEY).not.toBe(FAILED_KEY);
  });

  it('reverts to idle after the feedback window so the state cannot go stale', async () => {
    // Fake timers must be installed BEFORE the click: the reset is scheduled inside the copy, so
    // switching renderers afterwards would leave a REAL timer that advanceTimersByTime never fires
    // — the test would then pass or fail for reasons unrelated to the component.
    jest.useFakeTimers();
    setClipboard({ writeText: jest.fn().mockResolvedValue(undefined) });

    render(<CopyableId value={GUID} testID="screening-id" />);
    expect(labelOf('screening-id')).toBe(IDLE_KEY);

    fireEvent.click(screen.getByTestId('screening-id-copy'));
    // Flush the awaited clipboard promise without advancing the clock.
    await act(async () => { await Promise.resolve(); });
    expect(labelOf('screening-id')).toBe(COPIED_KEY);

    act(() => { jest.advanceTimersByTime(COPY_FEEDBACK_MS); });
    expect(labelOf('screening-id')).toBe(IDLE_KEY);
  });

  it('renders the optional label when one is supplied', () => {
    render(<CopyableId value={GUID} label="Screening ID" testID="screening-id" />);
    expect(screen.getByText('Screening ID')).toBeTruthy();
  });
});
