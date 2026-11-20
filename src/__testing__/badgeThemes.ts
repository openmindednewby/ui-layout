import type { UiTheme } from '@dloizides/ui-feedback';

export const LIGHT_THEME: UiTheme = {
  colors: { background: '#ffffff', surface: '#ffffff', surfaceElevated: '#f4f4f5', text: '#18181b', textSecondary: '#52525b', border: '#d4d4d8' },
  palette: { primary: { '500': '#2563eb', '700': '#1d4ed8' } },
  semantic: {
    error: { '500': '#dc2626', '700': '#b91c1c' },
    success: { '500': '#16a34a', '700': '#15803d' },
    warning: { '500': '#d97706', '700': '#b45309' },
    info: { '500': '#2563eb', '700': '#1d4ed8' },
  },
};

export const DARK_THEME: UiTheme = {
  colors: { background: '#09090b', surface: '#18181b', surfaceElevated: '#27272a', text: '#fafafa', textSecondary: '#a1a1aa', border: '#3f3f46' },
  palette: { primary: { '500': '#60a5fa', '700': '#2563eb' } },
  semantic: {
    error: { '500': '#f87171', '700': '#dc2626' },
    success: { '500': '#4ade80', '700': '#16a34a' },
    warning: { '500': '#fbbf24', '700': '#d97706' },
    info: { '500': '#60a5fa', '700': '#2563eb' },
  },
};
