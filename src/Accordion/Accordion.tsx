/**
 * Accordion — a themed expand/collapse disclosure group.
 *
 * Owns the open-item state and shares it with its {@link AccordionItem} children via
 * context. Works controlled (`openIds` + `onOpenChange`) or uncontrolled
 * (`defaultOpenIds`, plus per-item `defaultOpen`). `allowMultiple` (default) lets any
 * number of items be open at once; set it false for single-open (radio-like) behaviour.
 *
 * `variant` picks the look: `plain` (default) renders borderless so it drops cleanly inside a
 * `Section` / `Card`; `boxed` renders each item as its own bordered, rounded box with a leading
 * ▸ marker (the AML v1 console `<details>` look).
 */
import React, { useCallback, useMemo, useState } from 'react';

import { StyleSheet, View, type ViewStyle } from 'react-native';

import { AccordionContext, type AccordionContextValue } from './AccordionContext';
import type { AccordionItemProps } from './AccordionItem';
import type { AccordionVariant } from './AccordionVariant';
import { animateNextLayout } from './accordionAnimation';

const BOXED_GAP = 12;

const styles = StyleSheet.create({
  container: { alignSelf: 'stretch' },
  boxed: { gap: BOXED_GAP },
});

export interface AccordionProps {
  /** `AccordionItem` children. */
  children?: React.ReactNode;
  /** Controlled open ids. When provided, the accordion is controlled. */
  openIds?: readonly string[];
  /** Initial open ids in uncontrolled mode. */
  defaultOpenIds?: readonly string[];
  /** Fired with the next open-id set whenever an item toggles. */
  onOpenChange?: (openIds: string[]) => void;
  /** Allow several items open at once (default true). False = single-open. */
  allowMultiple?: boolean;
  /** Visual treatment: `plain` (default, borderless) or `boxed` (bordered ▸ boxes). */
  variant?: AccordionVariant;
  testID?: string;
  style?: ViewStyle | ViewStyle[];
}

/** Read the initial open set from `defaultOpenIds` + any child `defaultOpen` flags. */
function computeInitialOpen(
  children: React.ReactNode,
  defaultOpenIds: readonly string[] | undefined,
  allowMultiple: boolean,
): Set<string> {
  const ids = new Set<string>(defaultOpenIds ?? []);
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const props = child.props as Partial<AccordionItemProps>;
    if (props.defaultOpen === true && typeof props.id === 'string') {
      ids.add(props.id);
    }
  });
  if (!allowMultiple && ids.size > 1) {
    const first = ids.values().next().value;
    return new Set(first === undefined ? [] : [first]);
  }
  return ids;
}

export const Accordion = ({
  children,
  openIds,
  defaultOpenIds,
  onOpenChange,
  allowMultiple = true,
  variant = 'plain',
  testID = 'accordion',
  style,
}: AccordionProps): React.ReactElement => {
  const isControlled = openIds !== undefined;

  const [internalOpen, setInternalOpen] = useState<Set<string>>(() =>
    computeInitialOpen(children, defaultOpenIds, allowMultiple),
  );

  const openSet = useMemo<Set<string>>(
    () => (isControlled ? new Set(openIds) : internalOpen),
    [isControlled, openIds, internalOpen],
  );

  const toggle = useCallback(
    (id: string) => {
      animateNextLayout();
      const next = new Set(openSet);
      const willOpen = !next.has(id);
      if (!allowMultiple) next.clear();
      if (willOpen) {
        next.add(id);
      } else {
        next.delete(id);
      }
      if (!isControlled) setInternalOpen(next);
      if (onOpenChange !== undefined) onOpenChange(Array.from(next));
    },
    [allowMultiple, isControlled, onOpenChange, openSet],
  );

  const contextValue = useMemo<AccordionContextValue>(
    () => ({ openIds: openSet, toggle, allowMultiple, variant }),
    [openSet, toggle, allowMultiple, variant],
  );

  const containerStyle = useMemo<ViewStyle[]>(() => {
    const base = variant === 'boxed' ? [styles.container, styles.boxed] : [styles.container];
    if (style === undefined) return base;
    return [...base, ...(Array.isArray(style) ? style : [style])];
  }, [style, variant]);

  return (
    <AccordionContext.Provider value={contextValue}>
      <View style={containerStyle} testID={testID}>
        {children}
      </View>
    </AccordionContext.Provider>
  );
};

export default Accordion;
