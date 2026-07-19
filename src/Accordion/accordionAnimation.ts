/**
 * accordionAnimation — a lightweight, cross-platform-safe open/close animation.
 *
 * `animateNextLayout()` asks the next layout pass to animate (RN `LayoutAnimation`).
 * It is a guarded no-op wherever `LayoutAnimation` is unavailable (e.g. react-native-web
 * stubs it), so it never throws on web OR native.
 */
import { LayoutAnimation, Platform, UIManager } from 'react-native';

import { prefersReducedMotion } from '@dloizides/rn-web-hooks';

let androidEnabled = false;

/** Old-architecture Android requires opting in to LayoutAnimation once, at runtime. */
function enableAndroidLayoutAnimationOnce(): void {
  if (androidEnabled) return;
  androidEnabled = true;
  const isAndroid = Platform.OS === 'android';
  const setter = UIManager.setLayoutAnimationEnabledExperimental;
  if (isAndroid && typeof setter === 'function') {
    setter(true);
  }
}

/*
 * `prefersReducedMotion` used to be defined right here, and again — character for character —
 * in AccordionItem.tsx. It now comes from @dloizides/rn-web-hooks, which already owned the
 * identical `(prefers-contrast: more)` probe and has a dual-platform test gate behind it.
 * The imperative form (rather than the `useReducedMotion` hook) is the right one for this
 * call site: `animateNextLayout` runs outside render, so it cannot call a hook.
 */

/** Animate the layout change caused by the next state update (expand/collapse). */
export function animateNextLayout(): void {
  // Honour reduced-motion: skip the animation entirely so the change is instant.
  if (prefersReducedMotion()) return;
  enableAndroidLayoutAnimationOnce();
  const configure = LayoutAnimation.configureNext;
  if (typeof configure !== 'function') return;
  try {
    configure(LayoutAnimation.Presets.easeInEaseOut);
  } catch {
    // LayoutAnimation is a no-op / unavailable on this platform — ignore.
  }
}
