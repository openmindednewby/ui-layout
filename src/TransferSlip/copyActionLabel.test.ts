import { CopyStatus } from '../CopyableId/CopyStatus';

import { copyActionLabel } from './copyActionLabel';

const LABELS = { copy: 'Copy', copied: 'Copied', failed: 'Copy failed', hint: 'Copies the value' };

describe('copyActionLabel', () => {
  it('when idle, returns the copy label', () => {
    const status = CopyStatus.Idle;

    const label = copyActionLabel(status, LABELS);

    expect(label).toBe('Copy');
  });

  it('after a successful copy, returns the copied label', () => {
    const status = CopyStatus.Copied;

    const label = copyActionLabel(status, LABELS);

    expect(label).toBe('Copied');
  });

  it('after a failed copy, returns the failed label', () => {
    const status = CopyStatus.Failed;

    const label = copyActionLabel(status, LABELS);

    expect(label).toBe('Copy failed');
  });
});
