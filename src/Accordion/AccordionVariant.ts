/**
 * AccordionVariant — the two visual treatments for an {@link Accordion}.
 *
 * A plain string union (not a const enum) so call sites stay ergonomic
 * (`variant="boxed"`) and the package exposes no cross-boundary const-enum,
 * matching the rest of the shared UI kit (e.g. `ButtonVariant`).
 *
 *  - `plain` (default) — borderless rows separated by a hairline divider, with a
 *    right-hand chevron that flips 180° on open. Drops cleanly inside a Section / Card.
 *  - `boxed` — each item is its own bordered, rounded box with a LEADING ▸ marker that
 *    rotates 90° on open and a muted, 600-weight summary. Matches the AML v1 console's
 *    `<details>` panels.
 */
export type AccordionVariant = 'plain' | 'boxed';
