/**
 * How the COLLAPSED (mobile) {@link import('./Tabs').Tabs} menu trigger presents.
 *
 * Below the collapse breakpoint the tab strip becomes a single trigger that opens
 * the vertical section list. This selects that trigger's affordance:
 *
 *  - `Caret` — a bordered field showing the active section's label + a rotating ▾
 *    caret. The default, so every existing consumer is visually unchanged.
 *  - `Hamburger` — a ☰ menu icon (the universal mobile-nav affordance) leading the
 *    active section's label. Opt in for a phone-first nav that reads as a menu.
 *
 * Exported as a regular (non-`const`) enum on purpose — the SAME reason as
 * {@link import('../ModalDropdown/DropdownVariant').DropdownVariant}: a `const enum`
 * is inlined at compile time and cannot cross a published-package boundary when the
 * consumer bundles with `isolatedModules` (esbuild / vite / babel — i.e. every app
 * that consumes this package). A regular enum emits a runtime object safe to import
 * and compare in any consumer.
 */
export enum TabsCollapsedTrigger {
  /** Bordered field with the active label + a rotating ▾ caret (default, unchanged). */
  Caret = 'caret',
  /** A ☰ hamburger icon leading the active label — the mobile-nav affordance. */
  Hamburger = 'hamburger',
}
