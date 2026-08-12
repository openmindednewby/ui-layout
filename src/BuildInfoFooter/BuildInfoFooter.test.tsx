import { render, screen, waitFor } from '@testing-library/react';

import { BuildInfoFooter } from './BuildInfoFooter';

// useUi resolves from @dloizides/ui-feedback's default context — no provider needed in tests.

function jsonResponse(body: unknown, ok = true): Response {
  return { ok, json: async () => body } as unknown as Response;
}

describe('BuildInfoFooter', () => {
  it('renders `v<version>` at the default testID with no api base', () => {
    render(<BuildInfoFooter buildVersion="1.4.2" />);
    expect(screen.getByTestId('build-info-footer')).toBeTruthy();
    expect(screen.getByText('v1.4.2')).toBeTruthy();
  });

  it('shows an explicit apiCommit without fetching', () => {
    const fetchImpl = jest.fn();
    render(
      <BuildInfoFooter
        buildVersion="1.4.2"
        apiCommit="0123456789"
        fetchImpl={fetchImpl as unknown as typeof fetch}
      />,
    );
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(screen.getByText('v1.4.2 · api 0123456')).toBeTruthy();
  });

  it('appends the api commit once the /version fetch resolves', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse({ commit: 'deadbeef99' }));
    render(
      <BuildInfoFooter
        buildVersion="1.4.2"
        apiBaseUrl="https://api.dev"
        fetchImpl={fetchImpl as unknown as typeof fetch}
      />,
    );
    // Before resolution the version renders alone; after, the commit is appended.
    expect(screen.getByText('v1.4.2')).toBeTruthy();
    await waitFor(() => expect(screen.getByText('v1.4.2 · api deadbee')).toBeTruthy());
  });

  it('falls back to just the version when the fetch fails', async () => {
    const fetchImpl = jest.fn().mockRejectedValue(new Error('offline'));
    render(
      <BuildInfoFooter
        buildVersion="1.4.2"
        apiBaseUrl="https://api.dev"
        fetchImpl={fetchImpl as unknown as typeof fetch}
      />,
    );
    await waitFor(() => expect(fetchImpl).toHaveBeenCalled());
    expect(screen.getByText('v1.4.2')).toBeTruthy();
  });
});
