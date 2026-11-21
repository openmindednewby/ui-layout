import { CopyStatus } from '../CopyableId/CopyStatus';

/** The pre-localized labels a copy control shows in each state. */
export interface CopyValueLabels {
  copy: string;
  copied: string;
  failed: string;
  hint: string;
}

/** The label the copy control shows for a copy status. */
export function copyActionLabel(status: CopyStatus, labels: CopyValueLabels): string {
  if (status === CopyStatus.Copied) return labels.copied;
  if (status === CopyStatus.Failed) return labels.failed;
  return labels.copy;
}
