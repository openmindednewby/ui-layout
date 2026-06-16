# Changelog

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
