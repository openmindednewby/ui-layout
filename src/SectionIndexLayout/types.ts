import type React from 'react';

export interface SectionIndexEntry {
  key: string;
  title: string;
  content: React.ReactNode;
}

/** Fold widths: from `wide` the index rail shows; from `stackFrom` up to `wide` every section shows stacked, below it chips. */
export interface SectionFold {
  wide: number;
  stackFrom: number;
}
