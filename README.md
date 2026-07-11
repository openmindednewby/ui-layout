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
| `Accordion` / `AccordionItem` | Themed expand/collapse disclosure group (replaces hand-rolled `<details>`/expanders). Controlled or uncontrolled, single- or multi-open, animated, keyboard + screen-reader accessible. |
| `useFocusTrap` | Web keyboard focus-trap hook (no-op on native). |

### `Accordion`

A compound component: an `Accordion` container that owns the open state + `AccordionItem`
children that read it via context. Each item is a pressable header (title left, optional
`right` adornment/badge slot, a rotating chevron) over a collapsible body `region`.

- **Controlled** — pass `openIds` + `onOpenChange`.
- **Uncontrolled** — pass `defaultOpenIds` on the container and/or `defaultOpen` per item.
- **`allowMultiple`** (default `true`) keeps any number of items open; `false` = single-open.
- **Per-item `disabled`.**
- **a11y** — header is an accessible `button` (`accessibilityRole="button"`,
  `accessibilityState={{ expanded }}`, web `aria-expanded` + `aria-controls`); the body is a
  `role="region"`. The header renders as a native `<button>`, so **Enter / Space toggle** it.
- **Themed** entirely from the active `useUi()` theme (border / surface / text colours). Renders
  borderless so it drops cleanly inside a `Section` / `Card`.
- **Animated** open/close via guarded `LayoutAnimation` (a no-op where unavailable — never errors
  on web or native) plus an `Animated` chevron rotation.
- **testIDs** — container `testID` (default `accordion`); per item the header is
  `testID` (default `accordion-item-<id>`), the body `<header>-body`, the chevron `<header>-chevron`.

```tsx
import { Accordion, AccordionItem, Section, StatusBadge } from '@dloizides/ui-layout';

// 1) A form "More options" disclosure (single collapsible section, starts closed):
<Section>
  <Accordion>
    <AccordionItem id="more" title="More options">
      <FuzzinessSlider />
      <DatasetPicker />
    </AccordionItem>
  </Accordion>
</Section>

// 2) An expandable list row per matched candidate (single-open, badge in the right slot):
<Accordion allowMultiple={false} onOpenChange={(ids) => setOpenRow(ids[0])}>
  {candidates.map((c) => (
    <AccordionItem
      key={c.id}
      id={c.id}
      title={c.name}
      right={<StatusBadge label={c.tier} color={c.fg} backgroundColor={c.bg} />}
    >
      <CandidateDetail candidate={c} />
    </AccordionItem>
  ))}
</Accordion>

// Controlled variant:
<Accordion openIds={openIds} onOpenChange={setOpenIds}>{/* …items… */}</Accordion>
```

The apps supply the header hint string via the shared translate: key `common.accordionToggleHint`.

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
