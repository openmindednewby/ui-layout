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

/** Animate the layout change caused by the next state update (expand/collapse). */
export function animateNextLayout(): void {
  enableAndroidLayoutAnimationOnce();
  const configure = LayoutAnimation.configureNext;
  if (typeof configure !== 'function') return;
  try {
    configure(LayoutAnimation.Presets.easeInEaseOut);
  } catch {
    // LayoutAnimation is a no-op / unavailable on this platform — ignore.
  }
}
