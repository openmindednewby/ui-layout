/**
 * NATIVE project only (the REAL react-native + react-test-renderer).
 *
 * An option row's height used to be whatever its padding plus the label's line box added up to:
 * 12 + 12 + the 14px font's `normal` line-height came to 42.4px on a 360-wide phone. The row
 * must declare the 44px floor itself so the hit box never depends on font metrics.
 */
import React from 'react';

import { StyleSheet, TouchableOpacity } from 'react-native';
import TestRenderer from 'react-test-renderer';

import { MIN_TARGET_PX } from '../constants';

import { OptionRow } from './OptionRow';

function rowStyle(): Record<string, unknown> {
  let renderer: TestRenderer.ReactTestRenderer | undefined;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <OptionRow testID="row" label="Standard" isSelected={false} onSelect={() => undefined} />,
    );
  });
  if (renderer === undefined) throw new Error('render did not produce a tree');
  const row = renderer.root.findByType(TouchableOpacity);
  return StyleSheet.flatten(row.props.style) as Record<string, unknown>;
}

describe('OptionRow hit box', () => {
  it('declares a minHeight of at least MIN_TARGET_PX', () => {
    expect(rowStyle().minHeight).toBeGreaterThanOrEqual(MIN_TARGET_PX);
  });

  it('centres the label vertically inside the 44px floor', () => {
    expect(rowStyle().justifyContent).toBe('center');
  });
});
