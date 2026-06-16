/**
 * UpgradePrompt — shown when a free-tier user hits a feature limit. CTA navigates to the
 * billing route via the injected navigate (default route overridable).
 */
import React from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { LAYOUT_TEST_IDS, DEFAULT_BILLING_ROUTE } from '../constants';

const PROMPT_PADDING = 20;
const PROMPT_BORDER_RADIUS = 12;
const PROMPT_BORDER_WIDTH = 1;
const TITLE_FONT_SIZE = 16;
const MESSAGE_FONT_SIZE = 14;
const BUTTON_PADDING_V = 12;
const BUTTON_BORDER_RADIUS = 8;
const BUTTON_FONT_SIZE = 14;
const DISMISS_FONT_SIZE = 13;
const TITLE_MARGIN_BOTTOM = 8;
const MESSAGE_MARGIN_BOTTOM = 16;
const CTA_MARGIN_BOTTOM = 8;

const styles = StyleSheet.create({
  container: {
    padding: PROMPT_PADDING,
    borderRadius: PROMPT_BORDER_RADIUS,
    borderWidth: PROMPT_BORDER_WIDTH,
  },
  title: { fontSize: TITLE_FONT_SIZE, fontWeight: '700', marginBottom: TITLE_MARGIN_BOTTOM },
  message: { fontSize: MESSAGE_FONT_SIZE, marginBottom: MESSAGE_MARGIN_BOTTOM },
  cta: { paddingVertical: BUTTON_PADDING_V, borderRadius: BUTTON_BORDER_RADIUS, alignItems: 'center', marginBottom: CTA_MARGIN_BOTTOM },
  ctaText: { fontSize: BUTTON_FONT_SIZE, fontWeight: '700' },
  dismiss: { alignItems: 'center', paddingVertical: BUTTON_PADDING_V },
  dismissText: { fontSize: DISMISS_FONT_SIZE },
});

export interface UpgradePromptProps {
  /** Human-readable name of the required tier (e.g. "Pro"). */
  requiredTier: string;
  /** Current tier name (e.g. "Free"). */
  currentTier: string;
  /** Called when the user dismisses the prompt. */
  onDismiss?: () => void;
  /** Route the CTA navigates to (defaults to the billing settings path). */
  billingRoute?: string;
}

export const UpgradePrompt = ({
  requiredTier,
  currentTier,
  onDismiss,
  billingRoute = DEFAULT_BILLING_ROUTE,
}: UpgradePromptProps): React.ReactElement => {
  const { theme, t, navigate } = useUi();
  const colors = theme.colors;
  const primary = theme.palette.primary['500'];

  function handleUpgradePress(): void {
    if (typeof navigate === 'function') navigate(billingRoute);
  }

  return (
    <View
      style={[styles.container, { borderColor: primary, backgroundColor: colors.surface }]}
      testID={LAYOUT_TEST_IDS.upgradePrompt}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        {t('settings.billing.upgradePrompt.title')}
      </Text>

      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {t('settings.billing.upgradePrompt.message', requiredTier, currentTier)}
      </Text>

      <TouchableOpacity
        accessibilityHint={t('settings.billing.upgradePrompt.ctaHint')}
        accessibilityLabel={t('settings.billing.upgradePrompt.cta')}
        accessibilityRole="button"
        style={[styles.cta, { backgroundColor: primary }]}
        testID={LAYOUT_TEST_IDS.upgradePromptCta}
        onPress={handleUpgradePress}
      >
        <Text style={[styles.ctaText, { color: colors.surface }]}>
          {t('settings.billing.upgradePrompt.cta')}
        </Text>
      </TouchableOpacity>

      {onDismiss ? (
        <TouchableOpacity
          accessibilityHint={t('settings.billing.upgradePrompt.dismissHint')}
          accessibilityLabel={t('settings.billing.upgradePrompt.dismiss')}
          accessibilityRole="button"
          style={styles.dismiss}
          testID={LAYOUT_TEST_IDS.upgradePromptDismiss}
          onPress={onDismiss}
        >
          <Text style={[styles.dismissText, { color: colors.textSecondary }]}>
            {t('settings.billing.upgradePrompt.dismiss')}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default UpgradePrompt;
