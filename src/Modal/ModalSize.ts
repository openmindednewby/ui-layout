/**
 * Max-width preset for {@link Modal}.
 *
 * A plain string union (NOT a const enum), matching the kit's convention — see
 * `@dloizides/ui-buttons`' `ButtonSize`. Call sites stay ergonomic (`size="md"`) and no
 * const enum crosses the package boundary, where tsup/esbuild inline them unreliably.
 *
 *  - `sm` — compact confirmations / short forms.
 *  - `md` (default) — the general dialog.
 *  - `lg` — wide editors.
 */
export type ModalSize = 'sm' | 'md' | 'lg';
