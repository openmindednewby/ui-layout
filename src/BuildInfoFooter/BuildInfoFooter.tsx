/**
 * BuildInfoFooter — a small, unobtrusive caption that shows which build the app is running:
 * `v<buildVersion>`, optionally `· api <sha7>` when an API base (or an explicit commit) is given.
 *
 * The FE half of "know what's deployed": each portal reads its stamped build id (an
 * `EXPO_PUBLIC_BUILD_VERSION` inlined at build time — the same git sha CI hands `@dloizides/pwa-sw`'s
 * `PWA_BUILD_VERSION`) and passes it in. The API commit is OPTIONAL and prop-driven, so apps with no
 * `/version` endpoint still get a version caption.
 *
 * Themable, no raw colours: the muted text uses the app theme's `textSecondary` via `useUi()`.
 */
import React, { useMemo } from 'react';

import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { LAYOUT_I18N, LAYOUT_TEST_IDS } from '../constants';
import { formatBuildInfo } from './formatBuildInfo';
import { useApiCommit } from './useApiCommit';

const FOOTER_PADDING_V = 6;
const FOOTER_PADDING_H = 12;
const FOOTER_FONT_SIZE = 11;
const FOOTER_OPACITY = 0.75;

const styles = StyleSheet.create({
  footer: {
    paddingVertical: FOOTER_PADDING_V,
    paddingHorizontal: FOOTER_PADDING_H,
    alignItems: 'center',
  },
  text: {
    fontSize: FOOTER_FONT_SIZE,
    opacity: FOOTER_OPACITY,
  },
});

export interface BuildInfoFooterProps {
  /** The app's stamped build id (git sha or timestamp), inlined at build time. */
  buildVersion: string;
  /**
   * Optional API base; when set (and no explicit `apiCommit` is given) the footer GETs
   * `${apiBaseUrl}/version` best-effort and appends `· api <sha7>`. Failures are silent.
   */
  apiBaseUrl?: string;
  /** Optional explicit API commit — supply it to skip the `/version` fetch entirely. */
  apiCommit?: string;
  /** Injectable `fetch` for tests; defaults to the global. */
  fetchImpl?: typeof fetch;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

export const BuildInfoFooter = ({
  buildVersion,
  apiBaseUrl,
  apiCommit,
  fetchImpl,
  testID = LAYOUT_TEST_IDS.buildInfoFooter,
  accessibilityLabel,
  accessibilityHint,
  style,
}: BuildInfoFooterProps): React.ReactElement => {
  const { theme, t } = useUi();

  // Only fetch when the app has not already supplied the commit — an explicit prop wins.
  const fetchedCommit = useApiCommit(apiCommit === undefined ? apiBaseUrl : undefined, fetchImpl);
  const commit = apiCommit ?? fetchedCommit;
  const label = formatBuildInfo(buildVersion, commit);

  const textStyle = useMemo(
    () => [styles.text, { color: theme.colors.textSecondary }],
    [theme.colors.textSecondary],
  );

  return (
    <View
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint ?? t(LAYOUT_I18N.buildInfoHint)}
      style={[styles.footer, style]}
      testID={testID}
    >
      <Text style={textStyle}>{label}</Text>
    </View>
  );
};

export default BuildInfoFooter;
