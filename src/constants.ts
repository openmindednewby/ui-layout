/** Default testIDs — match the apps' existing values so Playwright selectors keep working. */
export const LAYOUT_TEST_IDS = {
  headingText: 'heading-text',
  statusLabel: 'status-label',
  upgradePrompt: 'upgrade-prompt',
  upgradePromptCta: 'upgrade-prompt-cta',
  upgradePromptDismiss: 'upgrade-prompt-dismiss',
  modalShell: 'template-modal',
  modalShellClose: 'cancel-button',
} as const;

/** Route the UpgradePrompt CTA navigates to by default (the apps' billing settings path). */
export const DEFAULT_BILLING_ROUTE = '/settings/billing';
