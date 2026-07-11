# Changelog

## 1.3.0

- Add **`Accordion`** + **`AccordionItem`** — a themed expand/collapse disclosure group that
  replaces per-app hand-rolled `<details>` / expanders (AML "More options" + expandable
  matched-candidate rows, Erevna survey groups, Katalogos menu sections…).
- Compound API: an `Accordion` container owns the open state and shares it with `AccordionItem`
  children via context. Each item = a pressable header (title left, optional `right`
  adornment/badge slot, a rotating chevron) over a collapsible body `region`.
- **Controlled** (`openIds` + `onOpenChange`) **and uncontrolled** (`defaultOpenIds`, plus
  per-item `defaultOpen`). `allowMultiple` (default `true`) vs single-open. Per-item `disabled`.
- **a11y**: header is an accessible `button` (`accessibilityRole="button"`,
  `accessibilityState={{ expanded }}`, web `aria-expanded` + `aria-controls`); body is a
  `role="region"`. Renders as a native `<button>`, so **Enter / Space toggle** it.
- **Themed** entirely from the `@dloizides/ui-feedback` theme (border / surface / text colours),
  no hardcoded palette; renders borderless so it nests inside a `Section` / `Card`.
- **Animated** open/close via a guarded `LayoutAnimation` (web- and native-safe no-op fallback,
  never throws) + an `Animated` chevron rotation. Hook-safe (lazy `useState`, no ref reads in render).
- **Additive / backward-compatible**: purely new exports (`Accordion`, `AccordionItem`,
  `AccordionProps`, `AccordionItemProps`). Existing consumers (erevna / katalogos / aml-v2) are
  unaffected.

## 1.2.0

- `ModalDropdown` can now render as an **inline anchored menu** (native `<select>` feel), not only a
  modal. New `variant?: DropdownVariant` prop (`Menu` | `Modal`) selects the presentation per screen.
- **Responsive default** (when `variant` is omitted): inline `Menu` on wide/desktop web
  (viewport ≥ 768px), `Modal` on narrow/mobile and on any native platform. An explicit `variant`
  overrides the auto choice.
- The inline menu anchors under the trigger, is dismissible via click-outside / `Esc`, is
  keyboard-navigable (↑/↓, `Home`/`End`, `Enter`), scrolls when long, and does not push layout.
  The modal path is unchanged. Both variants share the same option-rendering/selection logic
  (`OptionRow`), so nothing is duplicated.
- **Additive / backward-compatible**: existing `ModalDropdown` callers (erevna / katalogos / aml-v2)
  keep their exact API and now get the inline-on-desktop menu automatically. New export:
  `DropdownVariant` (a runtime enum — deliberately not `const enum`, which cannot cross a published
  package boundary under `isolatedModules`).

## 1.1.0

- Add `ModalShell` — slide-up full-screen modal with a themed header (title + close) and scrollable body.
  Composes `Heading` (this package) + `SvgIcon` (`@dloizides/ui-icons`). This was the batch-1 deferred
  ModalShell, now landed (ui-icons + Heading both shared). Adds `@dloizides/ui-icons` + `react-native-svg`
  as peers.

## 1.0.0

Initial release (Capability Wave C1, batch 5 — the ui-layout pivot after full settings-hub proved
not cleanly extractable). Extracted the proven (erevna+katalogos identical) presentational primitives
that the settings screens (and others) reuse: `Section`, `Heading`, `StatusBadge`, `UpgradePrompt`,
`ModalDropdown` + `useFocusTrap`. Share the `@dloizides/ui-feedback` context (`useUi`). `Heading`
unblocks the deferred ModalShell. `Breadcrumb` deferred (couples to the app's router + breadcrumb map).
