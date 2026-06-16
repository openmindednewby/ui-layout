# @dloizides/ui-layout

Themable, brand-agnostic React Native (RN-web) **layout primitives** for the dloizides.com portfolio.
Read theme + translations from the shared `@dloizides/ui-feedback` context (`useUi`).

## Components

| Export | Purpose |
|--------|---------|
| `Section` | Bordered card container (themes border + surface). |
| `Heading` | Themed section heading text. |
| `StatusBadge` | Status pill — caller supplies `label`/`color`/`backgroundColor`. |
| `UpgradePrompt` | Free-tier upgrade nudge; CTA navigates to the billing route via `useUi().navigate`. |
| `ModalDropdown` | Generic modal-based dropdown selector (with web focus-trap). |
| `useFocusTrap` | Web keyboard focus-trap hook (no-op on native). |

## Install

```bash
npm install @dloizides/ui-layout @dloizides/ui-feedback
```

Peer deps: `@dloizides/ui-feedback >= 1.1.0`, `react >= 18`, `react-native >= 0.74`.

Mount a `FeedbackUiProvider` / `UiProvider` at the app root so the components pick up your theme,
translations, and navigation.

## License

MIT
