import React from 'react';

import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { Button } from '@dloizides/ui-buttons';
import { useUi } from '@dloizides/ui-feedback';

import { LAYOUT_I18N, LAYOUT_TEST_IDS } from '../constants';
import { fullPageContentWidth } from './fullPageContentWidth';

const styles = StyleSheet.create({
  page: { flex: 1 },
  bar: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 8, padding: 16 },
  body: { alignItems: 'center', paddingBottom: 32 },
});

export interface FullPageSheetPanelProps {
  onClose: () => void;
  children: React.ReactNode | ((contentWidth: number) => React.ReactNode);
  closeLabel?: string;
  closeHint?: string;
  actions?: React.ReactNode;
  maxContentWidth?: number;
  testID?: string;
}

/** The page drawn by `FullPageSheet`: a top bar with Close and a centred, width-bounded scroll body. */
export const FullPageSheetPanel = ({
  onClose,
  children,
  closeLabel,
  closeHint,
  actions,
  maxContentWidth,
  testID = LAYOUT_TEST_IDS.fullPageSheet,
}: FullPageSheetPanelProps): React.ReactElement => {
  const { theme, t } = useUi();
  const { width } = useWindowDimensions();
  const label = closeLabel ?? t(LAYOUT_I18N.dialogClose);
  const contentWidth = fullPageContentWidth(width, maxContentWidth);
  const body = typeof children === 'function' ? children(contentWidth) : children;

  return (
    <View style={[styles.page, { backgroundColor: theme.colors.background }]} testID={testID}>
      <View style={styles.bar}>
        {actions}
        <Button
          accessibilityHint={closeHint ?? t(LAYOUT_I18N.closeDialogHint)}
          accessibilityLabel={label}
          label={label}
          testID={`${testID}-close`}
          onPress={onClose}
        />
      </View>
      <ScrollView contentContainerStyle={styles.body} testID={`${testID}-body`}>
        <View style={{ width: contentWidth }}>{body}</View>
      </ScrollView>
    </View>
  );
};
