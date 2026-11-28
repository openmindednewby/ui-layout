import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import type { UiTheme } from '@dloizides/ui-feedback';

const SIZE = 72;

const styles = StyleSheet.create({
  box: { alignItems: 'center', borderRadius: 6, borderStyle: 'dashed', borderWidth: 1, height: SIZE, justifyContent: 'center', width: SIZE },
  caption: { fontSize: 12 },
  mark: { fontSize: 11, fontWeight: '600' },
  root: { gap: 4, width: SIZE },
});

export interface ThumbnailSlotColors {
  border: string;
  fill: string;
  text: string;
  caption: string;
}

export interface ThumbnailSlotProps {
  mark: string;
  caption: string;
  testID: string;
  colors?: ThumbnailSlotColors;
}

/** The slot colours: the given ones, else the theme's border, background and text colours. */
export function thumbnailColorsOf(theme: UiTheme, colors?: ThumbnailSlotColors): ThumbnailSlotColors {
  return colors ?? { border: theme.colors.border, fill: theme.colors.background, text: theme.colors.text, caption: theme.colors.textSecondary };
}

/** A labelled thumbnail frame with a short mark inside, for an image that is named but not shown. */
export const ThumbnailSlot = ({ mark, caption, testID, colors }: ThumbnailSlotProps): React.ReactElement => {
  const paint = thumbnailColorsOf(useUi().theme, colors);
  return (
    <View style={styles.root} testID={testID}>
      <View style={[styles.box, { backgroundColor: paint.fill, borderColor: paint.border }]} testID={`${testID}-box`}>
        <Text style={[styles.mark, { color: paint.text }]}>{mark}</Text>
      </View>
      <Text numberOfLines={2} style={[styles.caption, { color: paint.caption }]}>{caption}</Text>
    </View>
  );
};
