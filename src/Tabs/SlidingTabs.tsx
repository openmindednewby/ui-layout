import React, { useRef } from 'react';

import { Animated, ScrollView, StyleSheet, View } from 'react-native';

import { useReducedMotion } from '@dloizides/rn-web-hooks';
import { useUi } from '@dloizides/ui-feedback';

import { EdgeFadeStrip } from './EdgeFadeStrip';
import { useEdgeFade } from './edgeFade';
import { SlidingTabItem } from './SlidingTabItem';
import { indicatorTransition } from './tabIndicatorTransition';
import { nextTabIndex } from './tabKeyNav';
import { useTabIndicator } from './useTabIndicator';
import type { UnderlineTab } from './underlineTabTypes';

const DEFAULT_UNDERLINE_STEP = '700';
const SCROLL_THROTTLE_MS = 16;
const UNDERLINE_PX = 3;

const styles = StyleSheet.create({
  indicator: { bottom: 0, height: UNDERLINE_PX, position: 'absolute' },
  row: { flexDirection: 'row', paddingBottom: UNDERLINE_PX, position: 'relative' },
  strip: { borderBottomWidth: 1, position: 'relative', width: '100%' },
});

export interface SlidingTabsProps {
  tabs: ReadonlyArray<UnderlineTab>;
  activeKey: string;
  onChange: (key: string) => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
  underlineColor?: string;
  fadeColor?: string;
  testID?: string;
}

/** Underline tabs whose underline slides to the selected tab, with arrow, Home and End keys. */
export const SlidingTabs = ({ tabs, activeKey, onChange, accessibilityLabel, accessibilityHint, underlineColor, fadeColor, testID }: SlidingTabsProps): React.ReactElement => {
  const { theme } = useUi();
  const reduced = useReducedMotion();
  const underline = underlineColor ?? theme.palette.primary[DEFAULT_UNDERLINE_STEP] ?? theme.colors.text;
  const fade = useEdgeFade();
  const activeIndex = tabs.findIndex((tab) => tab.key === activeKey);
  const indicator = useTabIndicator(activeIndex, reduced);
  const refs = useRef<Array<View | null>>([]);
  const moveFrom = (index: number) => (key: string | undefined): boolean => {
    const next = nextTabIndex(key, index, tabs.length);
    const target = next === undefined ? undefined : tabs[next];
    if (next === undefined || target === undefined) return false;
    onChange(target.key);
    refs.current[next]?.focus();
    return true;
  };
  return (
    <View style={[styles.strip, { borderBottomColor: theme.colors.border }]} testID={testID}>
      <ScrollView horizontal accessibilityHint={accessibilityHint} accessibilityRole="tablist" aria-label={accessibilityLabel} scrollEventThrottle={SCROLL_THROTTLE_MS} showsHorizontalScrollIndicator={false} onContentSizeChange={fade.onContentSizeChange} onLayout={fade.onLayout} onScroll={fade.onScroll}>
        <View style={styles.row}>
          {tabs.map((tab, index) => (
            <SlidingTabItem
              key={tab.key}
              ref={(node) => { refs.current[index] = node; }}
              reducedMotion={reduced}
              ringColor={underline}
              selected={index === activeIndex}
              tab={tab}
              onLayout={indicator.onTabLayout(index)}
              onSelect={onChange}
              onTabKey={moveFrom(index)}
            />
          ))}
          {indicator.measured ? <Animated.View pointerEvents="none" style={[styles.indicator, indicatorTransition(reduced), { backgroundColor: underline, left: indicator.left, width: indicator.width }]} testID={testID === undefined ? undefined : `${testID}-indicator`} /> : null}
        </View>
      </ScrollView>
      {fade.visible ? <EdgeFadeStrip color={fadeColor ?? theme.colors.background} /> : null}
    </View>
  );
};

export default SlidingTabs;
