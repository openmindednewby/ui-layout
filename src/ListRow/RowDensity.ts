import { createContext, useContext } from 'react';

export enum RowDensity {
  Comfortable = 'comfortable',
  Compact = 'compact',
}

export const ListRowDensityContext = createContext<RowDensity>(RowDensity.Comfortable);

/** The row density set by the nearest ListRowDensityContext provider. */
export const useRowDensity = (): RowDensity => useContext(ListRowDensityContext);
