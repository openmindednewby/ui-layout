# Changelog

## 1.0.0

Initial release (Capability Wave C1, batch 5 — the ui-layout pivot after full settings-hub proved
not cleanly extractable). Extracted the proven (erevna+katalogos identical) presentational primitives
that the settings screens (and others) reuse: `Section`, `Heading`, `StatusBadge`, `UpgradePrompt`,
`ModalDropdown` + `useFocusTrap`. Share the `@dloizides/ui-feedback` context (`useUi`). `Heading`
unblocks the deferred ModalShell. `Breadcrumb` deferred (couples to the app's router + breadcrumb map).
