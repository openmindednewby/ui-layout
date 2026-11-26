import React from 'react';

import { Text, type TextStyle } from 'react-native';

const HYPHENATED = /([\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)+)/u;
const DIGIT = /\d/;
const NO_WRAP = { whiteSpace: 'nowrap' } as unknown as TextStyle;

function isCode(part: string): boolean {
  return HYPHENATED.test(part) && DIGIT.test(part);
}

/** Splits text so a hyphenated code with a digit (2026-016, INV-2026-014) never breaks at its hyphen; other words still wrap. */
export function keepCodesWhole(text: string): React.ReactNode {
  const parts = text.split(HYPHENATED);
  if (!parts.some(isCode)) return text;
  return parts.map((part, index) => (isCode(part) ? <Text key={`${String(index)}-${part}`} style={NO_WRAP}>{part}</Text> : part));
}
