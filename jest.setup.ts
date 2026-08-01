import '@testing-library/jest-dom';

/**
 * jsdom ships no `window.matchMedia`, so `@dloizides/rn-web-hooks`' `useReducedMotion`
 * defaults to "motion allowed" — under which `@dloizides/ui-motion`'s `useEnterExit`
 * keeps an exiting node MOUNTED for the duration of its fade-out. That async unmount
 * would race every "the menu/modal is gone right after close" assertion in this suite.
 *
 * We pin the environment to REDUCED-MOTION, which collapses every ui-motion animation
 * to `instant` (0ms): enter/exit — and therefore mount/unmount — resolve synchronously
 * within the same `act()`, so the logic tests stay deterministic AND the reduced-motion
 * code path is the one under test. Only the reduced-motion query matches; every other
 * media query (e.g. `prefers-contrast`) reports `false`, leaving unrelated probes intact.
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addEventListener: (): void => undefined,
    removeEventListener: (): void => undefined,
    addListener: (): void => undefined,
    removeListener: (): void => undefined,
    dispatchEvent: (): boolean => false,
  }),
});
