/**
 * How a {@link ModalDropdown} renders its list of options.
 *
 * Exported as a regular (non-`const`) enum on purpose: `const enum` values are
 * inlined at compile time and cannot cross a published-package boundary when the
 * consumer bundles with `isolatedModules` (esbuild / vite / babel — i.e. every
 * app that consumes this package). A regular enum emits a runtime object that is
 * safe to import and compare in any consumer.
 */
export enum DropdownVariant {
  /** Inline popover anchored directly under the trigger — the native `<select>` feel. */
  Menu = 'menu',
  /** Full modal / bottom-sheet overlay with a scrim (the original behaviour). */
  Modal = 'modal',
}
