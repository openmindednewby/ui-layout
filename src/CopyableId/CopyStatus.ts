/**
 * The three states a copy affordance can be in. Its own file per the repo's
 * "one exported enum per file" rule.
 *
 * `Failed` is a first-class state on purpose. Clipboard writes genuinely fail in the browser —
 * a non-secure context (plain http, which is how every staging box and LAN preview is served)
 * has no `navigator.clipboard` at all, and even on https the Permissions API can reject. A
 * control that swallowed that would leave the analyst believing they hold an ID they do not,
 * and they would only find out after pasting the WRONG thing into a re-screen.
 */
export const enum CopyStatus {
  Idle = 'idle',
  Copied = 'copied',
  Failed = 'failed',
}
