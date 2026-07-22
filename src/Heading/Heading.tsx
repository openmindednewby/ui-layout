/**
 * Heading — themed section heading text, rendered as a REAL `<h1>`–`<h6>` on web.
 *
 * ## Why `level` exists
 *
 * `accessibilityRole="header"` maps to the ARIA `heading` role, which react-native-web turns
 * into a real heading element — but with no `aria-level` it always emits `<h1>`. A screen
 * having several `<h1>`s and no `<h2>` is a flat document: heading navigation, the primary way
 * assistive-tech users move around a long page, lists every section as a peer of the page title.
 *
 * `level` supplies `aria-level`, which RN-web uses to pick `h{level}`. It defaults to 2 rather
 * than 1 on purpose: a page has exactly ONE `<h1>` (its title) and many section headings, so the
 * common case must be the safe one. A second `<h1>` is a defect that renders identically to a
 * correct heading, so nothing about the page would reveal the mistake.
 *
 * The visual size is deliberately NOT derived from `level`. Heading level is document structure;
 * type scale is design. Tying them together is what pushes authors to pick a level for its font
 * size and break the outline to get the look they want.
 */
import React from 'react';

import { StyleSheet, Text } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { LAYOUT_TEST_IDS } from '../constants';

const styles = StyleSheet.create({
  heading: {
    fontWeight: '700',
    fontSize: 16,
  },
});

/** Section heading — the common case. A page's single `<h1>` must ask for level 1 explicitly. */
const DEFAULT_HEADING_LEVEL = 2;

/** `h1`–`h6`; HTML defines no `h7`. */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface HeadingProps {
  text?: string;
  children?: React.ReactNode;
  /**
   * Document outline depth → `<h1>`–`<h6>` on web, `aria-level` on native. Defaults to 2.
   * Pick it from the page's STRUCTURE, never from how large you want the text to look.
   */
  level?: HeadingLevel;
  /**
   * Merged AFTER the themed base, for the genuine one-off — a page title that needs to be
   * visibly larger than a section heading. Structure stays in `level`; size lives here.
   */
  style?: React.ComponentProps<typeof Text>['style'];
  testID?: string;
}

export const Heading = ({
  text,
  children,
  level = DEFAULT_HEADING_LEVEL,
  style,
  testID,
}: HeadingProps): React.ReactElement => {
  const { theme } = useUi();

  const headingStyle = React.useMemo(
    () => [styles.heading, { color: theme.colors.text }, style],
    [theme.colors.text, style],
  );

  return (
    <Text
      accessibilityRole="header"
      aria-level={level}
      style={headingStyle}
      testID={testID ?? LAYOUT_TEST_IDS.headingText}
    >
      {text ?? children}
    </Text>
  );
};

export default Heading;
