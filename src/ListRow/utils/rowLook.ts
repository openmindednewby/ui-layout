import type { ViewStyle } from 'react-native';

import { RowSelectedStyle } from '../RowSelectedStyle';

const BAR_WIDTH = 4;
const OUTLINE_WIDTH = 2;
const FOCUS_GAP = 2;
const FOCUS_WIDTH = 4;
const CARD_RADIUS = 8;
const CARD_INSET_V = 4;
const CARD_INSET_H = 8;
const CARD_SHADOW = '0px 2px 8px rgba(20, 30, 50, 0.16)';
const TRANSPARENT = 'transparent';

export interface RowPalette {
  accent: string;
  accentTint: string;
  background: string;
  surface: string;
  border: string;
  text: string;
  hover: string;
  pressed: string;
  focus: string;
}

export interface RowState {
  selected: boolean;
  hovered: boolean;
  pressed: boolean;
  focused: boolean;
}

export interface RowLook {
  container: ViewStyle;
  titleColor: string;
  textColor: string;
  inverse: boolean;
  showCheck: boolean;
  checkFilled: boolean;
}

function inset(width: number, color: string): string {
  return `inset 0px 0px 0px ${String(width)}px ${color}`;
}

function interactionFill(state: RowState, palette: RowPalette): string | undefined {
  if (state.pressed) return palette.pressed;
  if (state.hovered) return palette.hover;
  return undefined;
}

function selectedContainer(style: RowSelectedStyle, palette: RowPalette): ViewStyle {
  switch (style) {
    case RowSelectedStyle.AccentBar:
      return { backgroundColor: palette.accentTint, borderLeftColor: palette.accent };
    case RowSelectedStyle.Filled:
      return { backgroundColor: palette.accent };
    case RowSelectedStyle.Raised:
      return { backgroundColor: palette.background, borderColor: palette.accent, boxShadow: CARD_SHADOW };
    case RowSelectedStyle.Outline:
      return { backgroundColor: palette.background, boxShadow: inset(OUTLINE_WIDTH, palette.accent) };
    case RowSelectedStyle.Check:
      return { backgroundColor: palette.background };
    default:
      return { backgroundColor: palette.surface };
  }
}

function baseContainer(style: RowSelectedStyle): ViewStyle {
  if (style === RowSelectedStyle.AccentBar) return { borderLeftWidth: BAR_WIDTH, borderLeftColor: TRANSPARENT };
  if (style !== RowSelectedStyle.Raised) return {};
  return {
    borderWidth: 1,
    borderColor: TRANSPARENT,
    borderRadius: CARD_RADIUS,
    marginVertical: CARD_INSET_V,
    marginHorizontal: CARD_INSET_H,
  };
}

function withFocus(container: ViewStyle, focused: boolean, palette: RowPalette): ViewStyle {
  if (!focused) return container;
  const ring = `${inset(FOCUS_GAP, palette.background)}, ${inset(FOCUS_WIDTH, palette.focus)}`;
  const existing = typeof container.boxShadow === 'string' ? container.boxShadow : undefined;
  const keepsInset = existing?.startsWith('inset') === true;
  return { ...container, boxShadow: keepsInset ? `${ring}, ${String(existing)}` : ring };
}

/** Resolves a row's container style and text colours from its selected style and state. */
export function resolveRowLook(style: RowSelectedStyle, state: RowState, palette: RowPalette): RowLook {
  const inverse = state.selected && style === RowSelectedStyle.Filled;
  const selected = state.selected ? selectedContainer(style, palette) : {};
  const fill = inverse ? undefined : interactionFill(state, palette);
  const fillStyle: ViewStyle = fill === undefined ? {} : { backgroundColor: fill };
  const container = { ...baseContainer(style), ...selected, ...fillStyle };
  const accentsTitle = state.selected && style === RowSelectedStyle.AccentBar;
  const textColor = inverse ? palette.background : palette.text;
  return {
    container: withFocus(container, state.focused, palette),
    titleColor: accentsTitle ? palette.accent : textColor,
    textColor,
    inverse,
    showCheck: style === RowSelectedStyle.Check,
    checkFilled: style === RowSelectedStyle.Check && state.selected,
  };
}
