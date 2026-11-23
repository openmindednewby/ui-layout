import React from 'react';

import { Text, View } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import { StickyActionBar } from './StickyActionBar';

const HINT = 'Actions for this page';
const NARROW = 100000;

describe('StickyActionBar', () => {
  it('with an accessibilityHint, passes it to the toolbar view', () => {
    let tree: TestRenderer.ReactTestRenderer | undefined;

    act(() => {
      tree = TestRenderer.create(<StickyActionBar accessibilityHint={HINT} accessibilityLabel="Page actions" breakpoint={NARROW} testID="bar"><Text>Export</Text></StickyActionBar>);
    });

    const bar = tree?.root.findAll((node) => node.type === View && node.props.testID === 'bar')[0];
    expect(bar?.props.accessibilityHint).toBe(HINT);
  });
});
