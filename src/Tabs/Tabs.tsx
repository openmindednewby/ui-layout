/**
 * Tabs — a wrapping strip of pill tabs plus the panel for the active tab. The
 * cross-portal "section shell": one long dashboard split into named tabs so an
 * operator can find a surface instead of scrolling past it.
 *
 * It is deliberately CONTROLLED — the host owns `activeKey` and `onChange`, so
 * the selected tab can be driven from a route param, restored from storage, or
 * changed programmatically. The active panel is passed as `children`; Tabs wraps
 * it in a `tabpanel` and wires the `aria-labelledby` / `aria-controls`
 * relationship so assistive tech announces "tab N of M, <label>" and links the
 * panel back to its tab.
 *
 * Contract discipline (same as the rest of `@dloizides/ui-layout`): NO FM /
 * router / store / icon imports. `label`s are pre-localized strings supplied by
 * the caller; every colour is read from the `@dloizides/ui-feedback` UiProvider
 * theme, so the strip re-skins on tenant swap. The tab row is horizontally
 * scrollable AND wraps, so 3 tabs or 15 tabs both lay out sensibly.
 */
import React from 'react';

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

const PILL_RADIUS = 999;
const PILL_PAD_H = 16;
const PILL_PAD_V = 8;
const PILL_MIN_HEIGHT = 40;
const PILL_FONT = 14;
const PILL_WEIGHT = '600';
const ROW_GAP = 8;
const COLUMN_GAP = 8;
const ROW_PAD_V = 8;
const PANEL_PAD_TOP = 16;
const BORDER_WIDTH = 1;

/** Ink for a pill sitting on the accent (active) background — full-contrast white. */
const TEXT_ON_PRIMARY = '#ffffff';

const styles = StyleSheet.create({
  root: {
    width: '100%',
  },
  strip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: COLUMN_GAP,
    rowGap: ROW_GAP,
    paddingVertical: ROW_PAD_V,
    borderBottomWidth: BORDER_WIDTH,
  },
  pill: {
    paddingHorizontal: PILL_PAD_H,
    paddingVertical: PILL_PAD_V,
    borderRadius: PILL_RADIUS,
    minHeight: PILL_MIN_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    fontSize: PILL_FONT,
    fontWeight: PILL_WEIGHT,
    textAlign: 'center',
  },
  panel: {
    paddingTop: PANEL_PAD_TOP,
  },
});

/**
 * `aria-selected` marks the active tab for assistive tech, and `aria-controls` /
 * `id` / `aria-labelledby` link a tab to its panel. react-native's prop types
 * omit these, but react-native-web forwards `aria-*` / `id` to the DOM — so we
 * attach them (no `any`) rather than rely on `accessibilityState` alone.
 */
type AriaTabProps = PressableProps & {
  'aria-selected': boolean;
  'aria-controls': string;
  id: string;
};

function ariaTabProps(selected: boolean, panelId: string, tabId: string): AriaTabProps {
  return { 'aria-selected': selected, 'aria-controls': panelId, id: tabId };
}

/** `id` + `aria-labelledby` link the tabpanel back to its controlling tab. */
interface AriaPanelProps {
  'aria-labelledby': string;
  id: string;
}

/** One tab in the strip. `key` is what `onChange` emits and what selects the panel. */
export interface TabDescriptor {
  /** Stable identity — emitted by `onChange`, compared against `activeKey`. */
  key: string;
  /** Pre-localized, human-readable tab label. */
  label: string;
  testID?: string;
  /** Accessible name; defaults to `label`. */
  accessibilityLabel?: string;
  /** Accessible hint announced after the label. */
  accessibilityHint?: string;
}

export interface TabsProps {
  /** The tabs, left → right. */
  tabs: ReadonlyArray<TabDescriptor>;
  /** The currently-active tab `key`. */
  activeKey: string;
  /** Fired with a tab's `key` when it is pressed. */
  onChange: (key: string) => void;
  /** Accessible name for the whole tablist. */
  accessibilityLabel: string;
  /** The panel content for the active tab. */
  children?: React.ReactNode;
  /** Prefix for the generated tab / panel element ids (must be unique per Tabs on a page). */
  idPrefix?: string;
  /** Style override merged onto the root container. */
  style?: StyleProp<ViewStyle>;
  /** Style override merged onto the tab strip. */
  stripStyle?: StyleProp<ViewStyle>;
  /** Style override merged onto the panel wrapper. */
  panelStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * A controlled tabbed section shell. Renders the tab strip and the active tab's
 * panel. Generic-free by design — tab identity is a plain string `key`.
 */
export const Tabs = ({
  tabs,
  activeKey,
  onChange,
  accessibilityLabel,
  children,
  idPrefix = 'tabs',
  style,
  stripStyle,
  panelStyle,
  testID,
}: TabsProps): React.ReactElement => {
  const { theme } = useUi();
  const { colors } = theme;
  const primaryColor = theme.palette.primary['500'];

  const activePanelId = `${idPrefix}-panel-${activeKey}`;
  const activeTabId = `${idPrefix}-tab-${activeKey}`;
  const panelAria: AriaPanelProps = { 'aria-labelledby': activeTabId, id: activePanelId };

  return (
    <View style={[styles.root, style]} testID={testID}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View
          accessibilityRole="tablist"
          aria-label={accessibilityLabel}
          style={[styles.strip, { borderBottomColor: colors.border }, stripStyle]}
        >
          {tabs.map((tab) => {
            const selected = tab.key === activeKey;
            const textColor = selected ? TEXT_ON_PRIMARY : colors.textSecondary;
            const pillColor = selected ? primaryColor : colors.surfaceElevated;
            const tabId = `${idPrefix}-tab-${tab.key}`;
            const panelId = `${idPrefix}-panel-${tab.key}`;
            return (
              <Pressable
                key={tab.key}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                accessibilityLabel={tab.accessibilityLabel ?? tab.label}
                accessibilityHint={tab.accessibilityHint}
                onPress={() => onChange(tab.key)}
                style={[styles.pill, { backgroundColor: pillColor }]}
                testID={tab.testID}
                {...ariaTabProps(selected, panelId, tabId)}
              >
                <Text style={[styles.pillText, { color: textColor }]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <View accessibilityRole="none" style={[styles.panel, panelStyle]} {...panelAria}>
        {children}
      </View>
    </View>
  );
};

export default Tabs;
