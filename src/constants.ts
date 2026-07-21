/** Default testIDs — match the apps' existing values so Playwright selectors keep working. */
export const LAYOUT_TEST_IDS = {
  headingText: 'heading-text',
  statusLabel: 'status-label',
  upgradePrompt: 'upgrade-prompt',
  upgradePromptCta: 'upgrade-prompt-cta',
  upgradePromptDismiss: 'upgrade-prompt-dismiss',
  modalShell: 'template-modal',
  modalShellClose: 'cancel-button',
  accordion: 'accordion',
} as const;

/** Route the UpgradePrompt CTA navigates to by default (the apps' billing settings path). */
export const DEFAULT_BILLING_ROUTE = '/settings/billing';

/**
 * Every translation key this package resolves through `t(...)` — the host app's i18n contract.
 *
 * WHY THIS EXISTS: the kit is deliberately fallback-free. The neutral default `t` returns the key
 * itself, so a host that forgets a key does not silently show English — it shows the raw dotted
 * name to users, or announces it to screen readers. Without a machine-readable manifest each
 * portal had to hand-maintain its ui-layout key list, and hand-maintained lists rot: one app was
 * found missing 26 kit keys (rendering raw names to users), another had `accordionToggleHint`
 * undefined while `Accordion` was mounted, announcing the raw key to assistive tech.
 *
 * Bind a missing-key guard to this map (the same way apps already bind `TABLE_I18N` /
 * `FILTERS_I18N` from `@dloizides/ui-tables`) and an upgrade can never drift unnoticed. Every
 * `t(...)` call in this package references this map, so it cannot fall out of date.
 */
export const LAYOUT_I18N = {
  /** Placeholder shown by `ModalDropdown` when no option matches the current value. */
  selectPlaceholder: 'common.selectPlaceholder',
  /** Accessible name + hint of the modal-variant dropdown's dismiss backdrop. */
  dismissDropdown: 'common.dismissDropdown',
  dismissDropdownHint: 'common.dismissDropdownHint',
  /** Accessible hint on a single dropdown option row. */
  selectOptionHint: 'common.selectOptionHint',
  /** Default accessible hint on an `AccordionItem` header when the caller supplies none. */
  accordionToggleHint: 'common.accordionToggleHint',
  /** Default accessible hint on a `StatusBadge` when the caller supplies none. */
  statusBadgeHint: 'common.statusBadgeHint',
  /** `ModalShell`: accessible name of the dialog when its title is not a plain string. */
  dialog: 'common.dialog',
  /** `ModalShell`: accessible hint on the close button. */
  closeDialogHint: 'common.closeDialogHint',
  /** `ModalShell`: accessible name of the close button. */
  close: 'quizTemplates.cancel',
  /** `ModalShell`: heading fallback when no title is supplied. */
  closeHeading: 'close',
  upgradePromptTitle: 'settings.billing.upgradePrompt.title',
  /** Body copy, parameterised: "…requires {{p1}}, you are on {{p2}}." */
  upgradePromptMessage: 'settings.billing.upgradePrompt.message',
  upgradePromptCta: 'settings.billing.upgradePrompt.cta',
  upgradePromptCtaHint: 'settings.billing.upgradePrompt.ctaHint',
  upgradePromptDismiss: 'settings.billing.upgradePrompt.dismiss',
  upgradePromptDismissHint: 'settings.billing.upgradePrompt.dismissHint',
  /** `CopyableId`: the copy control's label in each of its three states, plus its hint. */
  copy: 'common.copy',
  copyHint: 'common.copyHint',
  copied: 'common.copied',
  /**
   * Shown when the clipboard write genuinely failed — non-secure context, denied permission.
   * This string reaching a user is CORRECT behaviour, not a defect: the alternative is them
   * believing they hold an identifier they do not.
   */
  copyFailed: 'common.copyFailed',
  /** `CopyableId`: hint on the value itself, explaining it is shortened for display. */
  copyableIdHint: 'common.copyableIdHint',
} as const;
