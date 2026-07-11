/**
 * AccordionContext — shares the open-item set + toggle between the `Accordion`
 * container (which owns the state) and its `AccordionItem` children.
 */
import { createContext, useContext } from 'react';

import type { AccordionVariant } from './AccordionVariant';

export interface AccordionContextValue {
  /** Ids of the currently-open items. */
  openIds: ReadonlySet<string>;
  /** Toggle an item open/closed by id (respects `allowMultiple`). */
  toggle: (id: string) => void;
  /** When false, opening an item closes the others. */
  allowMultiple: boolean;
  /** Visual treatment shared with every item (`plain` default, or `boxed`). */
  variant: AccordionVariant;
}

export const AccordionContext = createContext<AccordionContextValue | null>(null);

/** Reads the accordion context; throws if an item is rendered outside an `<Accordion>`. */
export function useAccordionContext(): AccordionContextValue {
  const value = useContext(AccordionContext);
  if (value === null) {
    throw new Error('AccordionItem must be rendered inside an <Accordion>.');
  }
  return value;
}
