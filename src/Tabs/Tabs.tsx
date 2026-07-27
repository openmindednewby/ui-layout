/**
 * Tabs — a named-section shell for a long dashboard. On WIDE viewports it is a
 * horizontal strip of pill tabs (a single scrollable `nowrap` row) plus the
 * active tab's panel. BELOW the collapse breakpoint it becomes a genuine mobile
 * MENU — a button showing the active section that opens a vertical list of all
 * sections — because a scrolling chip strip "is not a real menu and not mobile
 * friendly" on a phone. The active panel renders identically in both modes.
 *
 * It is deliberately CONTROLLED — the host owns `activeKey` and `onChange`, so
 * the selected tab can be driven from a route param, restored from storage, or
 * changed programmatically. The active panel is passed as `children`.
 *
 * A11y: WIDE mode keeps `role=tablist` / `role=tab` with `aria-selected` and the
 * `aria-controls` / `aria-labelledby` tab⇄panel wiring. COLLAPSED mode delegates
 * to {@link ModalDropdown}'s menu/listbox semantics (a `role=button` trigger that
 * opens a selectable list). The rendered panel is `aria-labelledby` the active
 * tab id in BOTH modes.
 *
 * Contract discipline (same as the rest of `@dloizides/ui-layout`): NO FM /
 * router / store / icon imports. `label`s are pre-localized strings supplied by
 * the caller; every colour is read from the `@dloizides/ui-feedback` UiProvider
 * theme, so the shell re-skins on tenant swap.
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

import { TabsMenu } from './TabsMenu';
import { TABS_COLLAPSE_BREAKPOINT, useTabsCollapsed } from './tabsResponsive';

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
  // The full-width rule under the row lives here (not on the strip) so it spans the
  // whole width even when the tabs are narrower than the viewport (desktop) and is
  // not clipped to the scroll content width.
  stripOuter: {
    width: '100%',
    borderBottomWidth: BORDER_WIDTH,
  },
  strip: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    columnGap: COLUMN_GAP,
    rowGap: ROW_GAP,
    paddingVertical: ROW_PAD_V,
  },
  pill: {
    // Keep each pill at its natural size so the row scrolls instead of squashing
    // the tabs when they don't all fit.
    flexShrink: 0,
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
  /** Fired with a tab's `key` when it is pressed (wide) or chosen (collapsed). */
  onChange: (key: string) => void;
  /** Accessible name for the whole tablist / collapsed menu. */
  accessibilityLabel: string;
  /** The panel content for the active tab. */
  children?: React.ReactNode;
  /** Prefix for the generated tab / panel element ids (must be unique per Tabs on a page). */
  idPrefix?: string;
  /**
   * Viewport width (dp) at/above which the tabs stay a horizontal ROW; below it
   * (or on native) they collapse to the mobile menu. Defaults to the shared kit
   * breakpoint ({@link TABS_COLLAPSE_BREAKPOINT}, 768). Pass a large number to
   * force the menu, or `0` to keep the row on any web width.
   */
  collapseBelow?: number;
  /** Style override merged onto the root container. */
  style?: StyleProp<ViewStyle>;
  /** Style override merged onto the tab strip (wide mode only). */
  stripStyle?: StyleProp<ViewStyle>;
  /** Style override merged onto the panel wrapper. */
  panelStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

interface WideTabStripProps {
  tabs: ReadonlyArray<TabDescriptor>;
  activeKey: string;
  onChange: (key: string) => void;
  accessibilityLabel: string;
  idPrefix: string;
  borderColor: string;
  primaryColor: string;
  textSecondary: string;
  surfaceElevated: string;
  stripStyle?: StyleProp<ViewStyle>;
}

/** The wide, horizontally-scrollable pill row. Unchanged desktop behaviour. */
const WideTabStrip = ({
  tabs,
  activeKey,
  onChange,
  accessibilityLabel,
  idPrefix,
  borderColor,
  primaryColor,
  textSecondary,
  surfaceElevated,
  stripStyle,
}: WideTabStripProps): React.ReactElement => (
  <View style={[styles.stripOuter, { borderBottomColor: borderColor }]}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View accessibilityRole="tablist" aria-label={accessibilityLabel} style={[styles.strip, stripStyle]}>
        {tabs.map((tab) => {
          const selected = tab.key === activeKey;
          const textColor = selected ? TEXT_ON_PRIMARY : textSecondary;
          const pillColor = selected ? primaryColor : surfaceElevated;
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
  </View>
);

/**
 * A controlled tabbed section shell. Renders the active tab's panel plus either
 * the wide pill strip or — below `collapseBelow` — the mobile menu. Generic-free
 * by design: tab identity is a plain string `key`.
 */
export const Tabs = ({
  tabs,
  activeKey,
  onChange,
  accessibilityLabel,
  children,
  idPrefix = 'tabs',
  collapseBelow = TABS_COLLAPSE_BREAKPOINT,
  style,
  stripStyle,
  panelStyle,
  testID,
}: TabsProps): React.ReactElement => {
  const { theme } = useUi();
  const { colors } = theme;
  const collapsed = useTabsCollapsed(collapseBelow);

  const activePanelId = `${idPrefix}-panel-${activeKey}`;
  const activeTabId = `${idPrefix}-tab-${activeKey}`;
  const panelAria: AriaPanelProps = { 'aria-labelledby': activeTabId, id: activePanelId };

  return (
    <View style={[styles.root, style]} testID={testID}>
      {collapsed ? (
        <TabsMenu
          accessibilityLabel={accessibilityLabel}
          activeKey={activeKey}
          idPrefix={idPrefix}
          tabs={tabs}
          testID={`${idPrefix}-menu`}
          onChange={onChange}
        />
      ) : (
        <WideTabStrip
          accessibilityLabel={accessibilityLabel}
          activeKey={activeKey}
          borderColor={colors.border}
          idPrefix={idPrefix}
          primaryColor={theme.palette.primary['500']}
          stripStyle={stripStyle}
          surfaceElevated={colors.surfaceElevated}
          tabs={tabs}
          textSecondary={colors.textSecondary}
          onChange={onChange}
        />
      )}
      <View accessibilityRole="none" style={[styles.panel, panelStyle]} {...panelAria}>
        {children}
      </View>
    </View>
  );
};

export default Tabs;
