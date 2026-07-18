# Changelog

## 1.12.0

- **New: `TruncatedText`** — a single-line text/link that middle-truncates to fit its container
  and cannot overflow at any width. Promoted out of the AML console, where a full adverse-media
  article URL rendered as raw `<Text>` and blew out its table row.

  Three things that look like they would solve this and do not, all verified against
  react-native-web 0.21 rather than assumed:

  1. `numberOfLines={1}` alone truncates at the **tail** (RN-web compiles it to
     `text-overflow: ellipsis`). Every URL from one publisher then collapses to the same
     `timesofindia.indiatimes.com/city/de…` prefix and the reader cannot tell the articles
     apart. There is no CSS for middle truncation, so it is computed in JS.
  2. `title={full}` is **silently dropped** — RN-web's `<Text>` forwards only `href`, `lang`
     and `pointerEvents` beyond the shared whitelist. The tooltip is set on the host node
     through a ref instead.
  3. JS truncation alone can mis-estimate an unusual glyph mix, so `numberOfLines={1}` is ALSO
     applied as a hard backstop. Overflow is impossible by construction, not by tuning.

  The full value always stays reachable — as the accessible name and, on web, the native
  tooltip. Also exported: the pure `truncateMiddle` / `formatUrlForDisplay` helpers and
  `ELLIPSIS`.

## 1.11.0

- **Fix (HIGH — 1.10.0's out-of-view close never fired in the real runtime).** 1.10.0 added
  "close the menu once the trigger leaves the viewport". Repositioning worked, but the close was
  measured **against the viewport**, and **RN-web apps never scroll the document** — every screen
  renders inside a `ScrollView`, so scrolling happens in an inner `<div>` and `window.scrollY`
  stays 0 forever. A trigger scrolled out of that inner scroller is invisible to the user while its
  rect sits comfortably inside the viewport, so the check could not fire on any screen of any
  portal. Measured in Chrome: trigger at `top: -37` (fully above the scroller), menu still rendered.
  Visibility is now measured against the **clip window** — the viewport intersected with every
  clipping ancestor — which is what makes it work inside an inner scroll container.
- **Fix: "entirely out of view" was also the wrong threshold.** When a scroll container reaches the
  end of its range the trigger stops with a few pixels still showing (4px in the reported case), so
  "fully out" was *unreachable* and the menu never closed however far the user scrolled. There is
  now a minimum-visible-pixel floor (`MIN_VISIBLE_PX`).
- **Guard: the menu never closes on its FIRST measurement**, so opening a dropdown whose trigger is
  already partly clipped still works; only movement after opening can close it.
- **The zero-area "not laid out yet" guard is unchanged in intent but now provably size-only** — it
  asks about the element's own box, never its position, so it cannot swallow a genuine hidden case.
- **New: `LAYOUT_I18N`** — the manifest of every translation key this package resolves, mirroring
  `TABLE_I18N` / `FILTERS_I18N` from `@dloizides/ui-tables` so hosts can bind an existing
  missing-key guard to it with no new pattern. The kit is fallback-free, so a key a host forgets
  reaches users as a raw dotted name; hand-maintained key lists rot (one portal was found missing
  26 kit keys, another had `common.accordionToggleHint` undefined while `Accordion` was mounted).
  Every `t(...)` call in the package now references the map, and the suite fails on a raw key
  literal or a stale entry — so the manifest cannot drift from the code.
- **Fix: the 1.10.0 CHANGELOG entry was written in cp1252**, leaving the published file invalid
  UTF-8. Re-encoded.
- **No breaking change.** `LAYOUT_I18N` is additive and the key strings are unchanged, so existing
  translation files keep working untouched.

## 1.10.0

Two defects found by browser visual QA of the inline dropdown menu against a live app.

- **Fix (HIGH, affects every consumer): the open inline menu detached from its trigger.** On web the
  menu is portalled to `document.body` with `position: fixed` at the trigger's measured rect.
  `fixed` is viewport-relative, so that coordinate is only valid until something moves the trigger.
  A `scroll`/`resize` listener on `window` was already in place (since 1.7.0) and does handle plain
  scrolling — but it left three real gaps:
  - **Layout changes that fire no scroll event at all** — an accordion above the trigger expanding,
    a sticky header resizing, a banner appearing, an async list rendering. The trigger moved, nothing
    scrolled, no listener fired, and the menu stayed behind. Now covered by a `ResizeObserver` on the
    anchor and on `document.body`.
  - **The trigger leaving the viewport.** Repositioning cannot help here — the menu just follows its
    trigger off-screen and hangs over unrelated content with nothing on screen explaining it. The
    menu now **closes** once the trigger is fully out of view.
  - **Layout thrash.** The handler ran a synchronous `getBoundingClientRect()` (a forced reflow) plus
    a React state update on *every* scroll event. Work is now coalesced into one
    `requestAnimationFrame` per frame.
  Scroll is now observed in the **capture** phase on `document` rather than `window`, so a scroll in
  any ancestor scroll container counts. Tracking moved into a dedicated `useAnchorTracking` hook.
  Native is unaffected (the popover is in-tree and moves with its anchor).
- **Fix (a11y): `accessibilityHint` never reached a screen reader.** The prop is part of the public
  API and every caller passes one, but react-native-web does not map it — the trigger carried
  `aria-label` and `aria-expanded` and **no hint of any kind**, so the text was silently thrown away
  (older react-native-web versions additionally leaked it to the DOM, logging
  `React does not recognize the accessibilityHint prop on a DOM element`). On web the hint is now
  rendered into a visually-hidden node referenced by `aria-describedby` — the same wiring
  `@dloizides/ui-forms`' `Field` uses for its error line — and the RN-only prop is no longer passed
  on web at all. Native still receives `accessibilityHint` unchanged.
- **No API change.** Both fixes are internal; every existing caller benefits without edits.

## 1.9.1

- **Fix (keyboard a11y, affects every consumer): Enter CLOSED the inline menu instead of SELECTING
  the highlighted option.** The trigger keeps DOM focus while the menu is open, and react-native-web
  maps Enter on a focused Touchable to `onPress`. React dispatches that from its ROOT container
  listener — an ancestor of the trigger, but a *descendant* of `document` — so the menu's BUBBLING
  `document` keydown listener ran second: the trigger toggled the menu shut, React unmounted the
  popover, the effect cleanup removed the very listener the event was still travelling toward, and
  `document` never saw the Enter. Keyboard users could open a dropdown and arrow through it but
  could never CHOOSE with the keyboard (mouse selection was unaffected, which is why it went
  unnoticed).
- **Fix:** the menu's key handler now runs in the **capture** phase and `stopPropagation`s the keys
  an open menu owns (↑/↓/Home/End/Enter/Escape), so it runs ahead of React's listener and the
  trigger cannot re-toggle behind it. Found while browser-verifying the AML v2 topbar dropdowns.

## 1.9.0

- **`ModalDropdown`: `menuMinWidth` — a width FLOOR for the open inline menu (additive, optional).**
  The menu matches the TRIGGER's width, which is right for a full-width field but leaves a compact
  anchor (the 1.8.0 `renderTrigger` case: a locale pill, an avatar chip, an icon button) with a menu
  too narrow to read its own option labels — a 52px "EN ▾" pill produced a 52px menu whose rows were
  clipped to a dark strip. `menuMinWidth` floors it; a wider trigger still wins.
- **Backward-compatible:** omitted, the width is the trigger's, exactly as before.

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
