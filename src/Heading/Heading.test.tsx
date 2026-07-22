/**
 * Asserted against the emitted ELEMENT, not the props.
 *
 * `accessibilityRole="header"` without a level renders `<h1>` — so a page built from these
 * headings had every section marked as a peer of the page title, and looked completely correct
 * on screen while doing it. Only the tag name can tell the two apart.
 */
import { render, screen } from '@testing-library/react';

import { Heading } from './Heading';
import { UiProvider } from '@dloizides/ui-feedback';

import type { UiTheme } from '@dloizides/ui-feedback';

const theme = {
  colors: { text: '#111111', surface: '#ffffff', surfaceElevated: '#fafafa', border: '#dddddd', textSecondary: '#666666' },
  palette: { primary: { '500': '#2f6f4f' } },
  semantic: { error: { '500': '#b00020' } },
} as unknown as UiTheme;

/** The provider requires a translate fn; Heading renders caller-supplied text, so identity. */
const t = (key: string): string => key;

const renderHeading = (ui: React.ReactElement): ReturnType<typeof render> =>
  render(
    <UiProvider t={t} theme={theme}>
      {ui}
    </UiProvider>,
  );

describe('Heading', () => {
  it('emits a section heading, not a page title, by default', () => {
    renderHeading(<Heading text="Βήματα" />);

    expect(screen.getByText('Βήματα').tagName).toBe('H2');
  });

  it.each([1, 2, 3, 4, 5, 6] as const)('emits a real h%s for level %s', (level) => {
    renderHeading(<Heading level={level} text={`Level ${level}`} />);

    expect(screen.getByText(`Level ${level}`).tagName).toBe(`H${level}`);
  });

  it('keeps type scale independent of outline depth', () => {
    // If these ever differ, someone will pick a heading level to get a font size and silently
    // break the document outline to do it.
    const { unmount } = renderHeading(<Heading level={1} text="One" />);
    const h1Style = screen.getByText('One').getAttribute('style');
    unmount();

    renderHeading(<Heading level={4} text="Four" />);

    expect(screen.getByText('Four').getAttribute('style')).toBe(h1Style);
  });
});
