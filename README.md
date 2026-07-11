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
| `ModalDropdown` | Generic dropdown selector. **Responsive by default**: an inline anchored menu on wide/desktop web, a modal on narrow/mobile — override per screen with `variant`. |
| `DropdownVariant` | Enum (`Menu` / `Modal`) to force a `ModalDropdown` rendering variant. |
| `useFocusTrap` | Web keyboard focus-trap hook (no-op on native). |

### `ModalDropdown` variants

`ModalDropdown` picks its presentation automatically:

- **Wide / desktop web** (viewport ≥ 768px) → an **inline anchored menu** that opens directly
  under the trigger (native `<select>` feel): dismissible via click-outside / `Esc`,
  keyboard-navigable (↑/↓, `Home`/`End`, `Enter`), scrolls when long, and never pushes layout.
- **Narrow / mobile, or any native platform** → the original **modal** / bottom-sheet.

Pass `variant` to force either behaviour regardless of viewport — the prop overrides the auto choice:

```tsx
import { ModalDropdown, DropdownVariant } from '@dloizides/ui-layout';

// Responsive (default): inline menu on desktop, modal on mobile.
<ModalDropdown testID="risk" accessibilityLabel="Risk" accessibilityHint="Pick a risk level"
  value={risk} options={riskOptions} onChange={setRisk} />

// Force the inline menu everywhere:
<ModalDropdown /* …props… */ variant={DropdownVariant.Menu} />

// Force the modal everywhere:
<ModalDropdown /* …props… */ variant={DropdownVariant.Modal} />
```

The public API is additive — callers that never pass `variant` keep working and now
get the inline-on-desktop menu for free.

## Install

```bash
npm install @dloizides/ui-layout @dloizides/ui-feedback
```

Peer deps: `@dloizides/ui-feedback >= 1.1.0`, `react >= 18`, `react-native >= 0.74`.

Mount a `FeedbackUiProvider` / `UiProvider` at the app root so the components pick up your theme,
translations, and navigation.

## License

MIT
