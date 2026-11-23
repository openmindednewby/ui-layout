import type React from 'react';

export interface UnderlineTab {
  key: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
  testID?: string;
  accessibilityHint?: string;
}
