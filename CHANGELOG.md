# Changelog

## 1.8.0

- **`ModalDropdown`: `renderTrigger` — a custom ANCHOR slot (additive, optional).** The dropdown's
  default trigger is a bordered field box, which is wrong for a *menu* anchored to a compact chip
  (a locale pill, an avatar/user chip, an icon button). Callers can now supply
  `renderTrigger={({ label, isOpen }) => …}` and own the anchor's visuals entirely; the default box
  is then not rendered. The a11y wrapper stays with the dropdown — `role=button`, `aria-expanded`,
  the accessible label + hint, and the `testID` are still applied — so a custom trigger *cannot*
  drop the accessible contract, and the portalled, keyboard-navigable (↑/↓/Home/End/Enter/Escape),
  never-clipped menu comes along for free.
- **`ModalDropdown`: `optionTestID` — custom per-option testIDs (additive, optional).** Options
  still default to `` `${testID}-option-${value}` ``; a caller turning an existing flat control into
  a dropdown can now keep its established selectors stable
  (`optionTestID={(code) => `lang-${code}`}`).
- **Backward-compatible:** both props are optional and, when omitted, the render tree is unchanged —
  erevna / katalogos / kefi / agora are unaffected and need no markup changes.

## 1.7.1

Fix: the modal-variant dismiss backdrop was a pressable WRAPPING the option buttons,
producing invalid DOM on web ("<button> cannot contain a nested <button>") + a React
console.error. The backdrop is now an absolute-fill SIBLING behind the dialog — same
tap-to-dismiss behaviour, no nesting. No API change.


## 1.7.0

- **`ModalDropdown` inline-menu (`variant={DropdownVariant.Menu}`) z-index / clipping fix.** On
  wide/desktop web the open inline menu painted UNDERNEATH later content (adjacent filter fields,
  the results table, cards) so options were hidden/clipped. Root cause: react-native-web renders
  **every `View`** with `position: relative; z-index: 0`, making each View its own stacking context —
  so the popover's `zIndex: 1000` was trapped inside its anchor / the app's field wrapper and could
  never rise above later-painting siblings.
- **Fix:** on web the menu is now rendered in a **portal to `document.body`** with `position: fixed`
  at the trigger's measured viewport rect (recomputed on scroll/resize) and a high `zIndex`. A portal
  escapes every ancestor stacking context AND every ancestor `overflow: hidden`, so the menu always
  paints on top and is never clipped — the same "menu above the table" outcome as
  `@dloizides/ui-tables` `SizeDropdown`. The anchor wrapper is also lifted to a raised `zIndex` while
  open (defence-in-depth; the primary lift on native).
- **Native-safe:** the portal + `document`/`window` listeners are all behind `Platform.OS === 'web'`;
  native keeps the in-tree `position:absolute` popover + `elevation`. `react-dom` is added as an
  **optional** peer (already present in every react-native-web consumer).
- Outside-click dismissal now consults the portalled popover's own node too, so clicking an option
  still selects (a portalled option is no longer a DOM descendant of the anchor). Keyboard nav
  (↑/↓, Home/End, Enter, Escape), `role="menu"`/`menuitem`, `aria-expanded`/`aria-selected`, and the
  modal variant on narrow/native are all unchanged.
- **Additive / backward-compatible:** the `ModalDropdown` API is unchanged; erevna / katalogos / kefi
  are unaffected.

## 1.6.0

- **Accessibility (WCAG 2.1 AA) hardening — additive + backward-compatible.**
  - `AccordionItem`: the rotating chevron (plain) and leading ▸ marker (boxed) are purely
    decorative — the open/closed state is already on the header via `aria-expanded` — so they are
    now `aria-hidden` / `accessibilityElementsHidden` to keep them out of the screen-reader tree.
  - `Accordion`: the expand/collapse `LayoutAnimation` and the chevron rotation now honour
    `prefers-reduced-motion: reduce`, snapping instantly for users who request reduced motion
    (WCAG 2.3.3, web only).
  - `ModalDropdown`: the trigger now also emits `accessibilityState.expanded` (native parity for
    the existing web `aria-expanded`).

## 1.5.0

- `Accordion` / `AccordionItem` gain a `variant` prop (`'plain' | 'boxed'`, default `'plain'`).
  `plain` is the original borderless look (hairline dividers, right-hand chevron flipping 180° on
  open) — existing consumers render **identically**, no change. `boxed` is the AML v1 console
  `<details>` look: each item is its own bordered, rounded box (spaced by a gap) with a **leading
  ▸ marker** that rotates 90° on open and a muted, 600-weight summary. The full API is preserved
  (controlled/uncontrolled, `allowMultiple`, `defaultOpen`, a11y `aria-expanded`/region, the
  open/close LayoutAnimation + chevron rotation). Additive + backward-compatible.

## 1.4.0

- Add **`SegmentedControl`** — a single rounded pill *track* holding N mutually-exclusive
  segments (the iOS-style segmented / tab toggle). The selected segment lifts onto a raised
  surface (`colors.surface`) with a subtle shadow; the rest stay transparent over the soft
  track (`colors.background`). Promoted from the v1 AML console's `.lf-mode` mode switch so
  erevna/katalogos/kefi share ONE toggle instead of hand-rolling two primary/ghost buttons.
- **Generic over the value union** (`SegmentedControl<'peps' | 'leaders'>`) for a typed
  `onChange`; each segment carries its own `label` / `value` / optional `testID` +
  `accessibilityLabel` / `accessibilityHint`.
- **a11y**: the group renders as a `tablist`, each segment as a `tab` with
  `accessibilityState={{ selected }}` (react-native-web forwards `role` + `aria-selected`).
- **Themed** entirely from the `@dloizides/ui-feedback` theme (surface / background / border /
  text colours); no colour literal except the selected-segment drop shadow.
- **Additive / backward-compatible**: purely new exports (`SegmentedControl`,
  `SegmentedControlProps`, `SegmentedOption`). Existing consumers are unaffected.

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
