/**
 * accordionAnimation — a lightweight, cross-platform-safe open/close animation.
 *
 * `animateNextLayout()` asks the next layout pass to animate (RN `LayoutAnimation`).
 * It is a guarded no-op wherever `LayoutAnimation` is unavailable (e.g. react-native-web
 * stubs it), so it never throws on web OR native.
 */
import { LayoutAnimation, Platform, UIManager } from 'react-native';

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

/**
 * True when the user asked the OS to reduce motion (web only). The expand/collapse layout
 * animation is then skipped so the panel appears/disappears instantly (WCAG 2.3.3). Safe under
 * SSR / where `matchMedia` is unavailable, and always false on native (handled by the caller).
 */
function prefersReducedMotion(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

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
