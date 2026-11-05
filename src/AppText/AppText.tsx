import React from 'react';

import { Text, type StyleProp, type TextStyle } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { TextKind } from './TextKind';

export interface AppTextProps {
  kind?: TextKind;
  color?: string;
  style?: StyleProp<TextStyle>;
  testID?: string;
  children: React.ReactNode;
}

const SIZES: Record<TextKind, TextStyle> = {
  [TextKind.Title]: { fontSize: 24, fontWeight: '700', lineHeight: 30 },
  [TextKind.Heading]: { fontSize: 17, fontWeight: '700', lineHeight: 24 },
  [TextKind.Body]: { fontSize: 15, lineHeight: 22 },
  [TextKind.Strong]: { fontSize: 15, fontWeight: '700', lineHeight: 22 },
  [TextKind.Muted]: { fontSize: 14, lineHeight: 20 },
  [TextKind.Small]: { fontSize: 12, lineHeight: 16 },
};

export const AppText = ({
  kind = TextKind.Body,
  color,
  style,
  testID,
  children,
}: AppTextProps): React.ReactElement => {
  const { theme } = useUi();
  const quiet = kind === TextKind.Muted || kind === TextKind.Small;
  return (
    <Text
      style={[
        SIZES[kind],
        { color: color ?? (quiet ? theme.colors.textSecondary : theme.colors.text) },
        style,
      ]}
      testID={testID}
    >
      {children}
    </Text>
  );
};
