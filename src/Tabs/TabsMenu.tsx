/**
 * TabsMenu — the COLLAPSED (mobile) form of {@link Tabs}.
 *
 * Below the collapse breakpoint the horizontal tab strip becomes a genuine menu:
 * a single trigger button that shows the active section's label and opens a
 * vertical list of every section. It is a thin adapter over the kit's existing
 * {@link ModalDropdown} select primitive, so it inherits the menu/listbox
 * semantics, the focus trap, the dismiss backdrop and the dual-platform a11y
 * contract for free — no new dropdown behaviour is reimplemented here.
 *
 * It opts into `ModalDropdown`'s `showCaret` so the trigger reads unmistakably as
 * a section SWITCHER — a bordered field with a rotating ▾ caret and a ≥44dp tap
 * target — rather than a static chip that gives no hint it is tappable. That was
 * the live defect on the collapsed organizer nav: the trigger looked like a pill.
 *
 * E2E survival: each option row's `testID` is the tab descriptor's own `testID`
 * when supplied, otherwise the `{idPrefix}-tab-{key}` pattern the wide strip uses
 * for its tab element ids — so a selector that targets a tab keeps resolving the
 * same tab in the collapsed menu (the menu must be opened first, as with any
 * select).
 */
import React, { useCallback, useMemo } from 'react';

import { useUi } from '@dloizides/ui-feedback';

import type { TabDescriptor } from './Tabs';
import { LAYOUT_I18N } from '../constants';
import type { DropdownOption } from '../ModalDropdown/dropdownTypes';
import { ModalDropdown } from '../ModalDropdown/ModalDropdown';

export interface TabsMenuProps {
  /** The tabs to list, in order. */
  tabs: ReadonlyArray<TabDescriptor>;
  /** The currently-active tab `key` — shown on the trigger and marked selected. */
  activeKey: string;
  /** Fired with a tab's `key` when its menu row is chosen. */
  onChange: (key: string) => void;
  /** Accessible name for the menu (the tablist's name in collapsed form). */
  accessibilityLabel: string;
  /** Prefix used to derive per-option testIDs when a descriptor supplies none. */
  idPrefix: string;
  /** testID for the menu trigger. */
  testID: string;
}

/** The collapsed tab menu. Renders the kit's `ModalDropdown` seeded from the tabs. */
export const TabsMenu = ({
  tabs,
  activeKey,
  onChange,
  accessibilityLabel,
  idPrefix,
  testID,
}: TabsMenuProps): React.ReactElement => {
  const { t } = useUi();

  const options = useMemo<ReadonlyArray<DropdownOption<string>>>(
    () => tabs.map((tab) => ({ label: tab.label, value: tab.key })),
    [tabs],
  );

  const optionTestID = useCallback(
    (key: string): string => {
      const found = tabs.find((tab) => tab.key === key);
      return found?.testID ?? `${idPrefix}-tab-${key}`;
    },
    [tabs, idPrefix],
  );

  return (
    <ModalDropdown
      accessibilityHint={t(LAYOUT_I18N.tabsMenuHint)}
      accessibilityLabel={accessibilityLabel}
      optionTestID={optionTestID}
      options={options}
      showCaret
      testID={testID}
      value={activeKey}
      onChange={onChange}
    />
  );
};

export default TabsMenu;
