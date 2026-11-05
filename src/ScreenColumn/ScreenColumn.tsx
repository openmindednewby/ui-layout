import React from 'react';

import { StyleSheet, View } from 'react-native';

import { useIsWideViewport } from '../hooks/useIsWideViewport';

const styles = StyleSheet.create({
  outer: { alignItems: 'center', width: '100%' },
  column: { width: '100%', gap: 16 },
  desktop: { paddingHorizontal: 32, paddingVertical: 24 },
  mobile: { paddingHorizontal: 16, paddingVertical: 16 },
  wide: { maxWidth: 1200 },
  narrow: { maxWidth: 720 },
});

export interface ScreenColumnProps {
  children: React.ReactNode;
  narrow?: boolean;
}

export const ScreenColumn = ({ children, narrow = false }: ScreenColumnProps): React.ReactElement => {
  const isWide = useIsWideViewport();
  return (
    <View style={styles.outer}>
      <View style={[styles.column, isWide ? styles.desktop : styles.mobile, narrow ? styles.narrow : styles.wide]}>
        {children}
      </View>
    </View>
  );
};
