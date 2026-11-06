import { createContext, useContext } from 'react';

export interface ListRowTone {
  textColor: string;
  inverse: boolean;
}

export const ListRowToneContext = createContext<ListRowTone | null>(null);

/** Reads the enclosing `ListRow` text tone so custom slot content follows a filled row; `null` outside a row. */
export function useListRowTone(): ListRowTone | null {
  return useContext(ListRowToneContext);
}
