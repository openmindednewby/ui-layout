/**
 * NATIVE project only (the REAL react-native + react-test-renderer).
 *
 * The mirror image of the web assertions in `ModalDropdown.anchoring.test.tsx`, which resolve
 * the trigger's `aria-describedby` to a hidden DOM node and read its text. None of that exists
 * here: there is no document, and `aria-describedby` is meaningless to a native screen reader.
 * The platform expresses a description as a first-class `accessibilityHint` prop, so that is
 * what this suite asserts.
 *
 * The two suites deliberately assert DIFFERENT things about the SAME component. That
 * opposition is the product: before ModalDropdown delegated to `@dloizides/a11y` it hand-rolled
 * the platform branch, and the package was tested under react-native-web ONLY — a renderer
 * under which a threaded hint and a dropped hint look identical. If these assertions ever
 * converge with the web ones, the gate has stopped testing two platforms.
 */
import React from 'react';

import { Platform, TouchableOpacity } from 'react-native';
import TestRenderer from 'react-test-renderer';

import { DropdownVariant } from './DropdownVariant';
import { ModalDropdown } from './ModalDropdown';

const OPTIONS = [
  { label: 'Alpha', value: 'a' as const },
  { label: 'Beta', value: 'b' as const },
];

type Value = (typeof OPTIONS)[number]['value'];

const HINT = 'Pick the display currency';
const LABEL = 'Currency';

/**
 * The props the trigger actually received.
 *
 * `act()` is not optional: without it react-test-renderer schedules the render on a later tick,
 * which lands AFTER the test has finished and the Jest environment has been torn down —
 * react-native's lazily-getter'd `index.js` then throws "trying to import a file after the Jest
 * environment has been torn down".
 */
function triggerProps(): Record<string, unknown> {
  let renderer: TestRenderer.ReactTestRenderer | undefined;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <ModalDropdown
        testID="d"
        accessibilityLabel={LABEL}
        accessibilityHint={HINT}
        value={'a' as Value}
        variant={DropdownVariant.Modal}
        options={OPTIONS}
        onChange={() => undefined}
      />,
    );
  });
  if (renderer === undefined) {
    throw new Error('render did not produce a tree');
  }
  // The trigger is the first TouchableOpacity — the dismiss backdrop only mounts when open.
  return renderer.root.findAllByType(TouchableOpacity)[0]?.props as Record<string, unknown>;
}

describe('ModalDropdown on native', () => {
  it('runs under the real react-native, NOT react-native-web', () => {
    // The single most important assertion in this file. If a `react-native` ->
    // `react-native-web` moduleNameMapper ever leaks into the native Jest project, this
    // project silently becomes a duplicate of the web one and the gate dies.
    expect(Platform.OS).not.toBe('web');
    expect(['ios', 'android']).toContain(Platform.OS);
    expect(typeof document).toBe('undefined');
  });

  it('delivers the hint as accessibilityHint — the prop native actually consumes', () => {
    expect(triggerProps().accessibilityHint).toBe(HINT);
  });

  it('emits NO web ARIA attributes on native', () => {
    const props = triggerProps();

    // The web suite asserts these ARE present. Asserting their ABSENCE here is what proves
    // the adapter branches rather than emitting one merged set of props for both platforms.
    expect(props['aria-describedby']).toBeUndefined();
    expect(props['aria-label']).toBeUndefined();
    expect(props['aria-expanded']).toBeUndefined();
  });

  it('uses the native accessibility contract for label, role and state', () => {
    const props = triggerProps();

    expect(props.accessible).toBe(true);
    expect(props.accessibilityLabel).toBe(LABEL);
    expect(props.accessibilityRole).toBe('button');
    expect(props.accessibilityState).toEqual({ expanded: false });
    expect(props.testID).toBe('d');
  });

  it('renders no hidden description node — native has nothing to point at', () => {
    let renderer: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <ModalDropdown
          testID="d"
          accessibilityLabel={LABEL}
          accessibilityHint={HINT}
          value={'a' as Value}
          variant={DropdownVariant.Modal}
          options={OPTIONS}
          onChange={() => undefined}
        />,
      );
    });

    // On web the hint text is rendered into a visually-hidden node. On native the hint lives
    // ONLY on the prop, so the text must not appear in the tree as rendered CONTENT.
    // Inspecting `children` (which holds instances and raw strings) rather than `props`
    // is what keeps this from matching the legitimate `accessibilityHint` prop.
    const painted = renderer?.root.findAll((node) => node.children.includes(HINT), {
      deep: true,
    });
    expect(painted).toHaveLength(0);

    // Sanity-check the probe itself: the VISIBLE label is found the same way, so a zero
    // above means "the hint is not painted", not "this predicate never matches anything".
    expect(renderer?.root.findAll((node) => node.children.includes('Alpha'))?.length).toBeGreaterThan(0);
  });
});
