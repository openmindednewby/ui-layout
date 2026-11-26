import type { TextStyle, ViewStyle } from 'react-native';

/** Title text style: wraps at word boundaries, breaks inside a word only for one unbreakable token, and never shrinks below its longest word. */
export const TITLE_WRAP = {
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: 0,
  minWidth: 'auto',
  maxWidth: '100%',
  wordBreak: 'normal',
  overflowWrap: 'break-word',
  hyphens: 'manual',
} as unknown as TextStyle;

/** Title line style: drops the trailing slot below the title when the title's longest word cannot sit beside it. */
export const TITLE_LINE = { flexWrap: 'wrap' } as const satisfies ViewStyle;

/** Trailing slot style: stays at the end of the line, also after it wraps below the title. */
export const TRAILING_END = { marginLeft: 'auto' } as const satisfies ViewStyle;
