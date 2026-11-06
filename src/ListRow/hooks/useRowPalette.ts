import { useUi } from '@dloizides/ui-feedback';

import type { RowPalette } from '../utils/rowLook';

/** Maps the host theme onto the colours a `ListRow` draws with. */
export function useRowPalette(): RowPalette {
  const { colors, palette, semantic } = useUi().theme;
  const accent = palette.primary['500'];
  const tint = palette.primary['50'] ?? colors.surface;
  return {
    accent,
    accentTint: tint,
    background: colors.background,
    surface: colors.surface,
    border: colors.border,
    text: colors.text,
    hover: tint,
    pressed: palette.primary['100'] ?? colors.surfaceElevated,
    focus: semantic.info?.['500'] ?? accent,
  };
}
