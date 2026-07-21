/**
 * The clipboard write, and specifically its FAILURE branches — the ones a browser only reaches on
 * plain http or with a denied permission, which is precisely where a hand-test never goes.
 */
import { copyText } from './copyText';

const VALUE = '3f2a9c81-7b4e-4a10-9c3d-88f0a1b2d4e7';

describe('copyText', () => {
  const originalClipboard = navigator.clipboard;

  function setClipboard(value: unknown): void {
    Object.defineProperty(navigator, 'clipboard', { value, configurable: true, writable: true });
  }

  /**
   * jsdom does not implement `document.execCommand` AT ALL — it is not a stubbed method, the
   * property is simply absent, so `jest.spyOn` throws rather than attaching. It is installed
   * here instead. That absence is itself worth knowing: in jsdom the fallback path hits
   * "execCommand is not a function", which our try/catch turns into an honest `false`.
   */
  function setExecCommand(impl: () => boolean): jest.Mock {
    const mock = jest.fn(impl);
    Object.defineProperty(document, 'execCommand', {
      value: mock,
      configurable: true,
      writable: true,
    });
    return mock;
  }

  afterEach(() => {
    setClipboard(originalClipboard);
    Reflect.deleteProperty(document, 'execCommand');
    jest.restoreAllMocks();
  });

  it('uses the async clipboard API when it is available', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    setClipboard({ writeText });

    await expect(copyText(VALUE)).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith(VALUE);
  });

  it('falls back to execCommand when the async clipboard API is absent (plain http)', async () => {
    // A non-secure context does not merely reject — `navigator.clipboard` is undefined entirely.
    setClipboard(undefined);
    const exec = setExecCommand(() => true);

    await expect(copyText(VALUE)).resolves.toBe(true);
    expect(exec).toHaveBeenCalledWith('copy');
  });

  it('falls back to execCommand when the async clipboard write REJECTS', async () => {
    setClipboard({ writeText: jest.fn().mockRejectedValue(new Error('NotAllowedError')) });
    const exec = setExecCommand(() => true);

    await expect(copyText(VALUE)).resolves.toBe(true);
    expect(exec).toHaveBeenCalled();
  });

  it('reports FAILURE when every path fails, rather than claiming success', async () => {
    setClipboard(undefined);
    setExecCommand(() => false);

    await expect(copyText(VALUE)).resolves.toBe(false);
  });

  it('reports failure when execCommand throws', async () => {
    setClipboard(undefined);
    setExecCommand(() => {
      throw new Error('nope');
    });

    await expect(copyText(VALUE)).resolves.toBe(false);
  });

  it('removes the fallback textarea even when the copy throws', async () => {
    setClipboard(undefined);
    setExecCommand(() => {
      throw new Error('nope');
    });
    const before = document.body.childElementCount;

    await copyText(VALUE);

    expect(document.body.childElementCount).toBe(before);
  });

  it('prefers an injected writer over the DOM paths', async () => {
    const writer = jest.fn().mockResolvedValue(undefined);
    const exec = setExecCommand(() => true);

    await expect(copyText(VALUE, writer)).resolves.toBe(true);
    expect(writer).toHaveBeenCalledWith(VALUE);
    expect(exec).not.toHaveBeenCalled();
  });

  it('falls through to the DOM paths when an injected writer throws', async () => {
    const writer = jest.fn().mockRejectedValue(new Error('no native clipboard'));
    setClipboard(undefined);
    setExecCommand(() => true);

    await expect(copyText(VALUE, writer)).resolves.toBe(true);
  });

  it('refuses an empty value instead of reporting a successful no-op copy', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    setClipboard({ writeText });

    await expect(copyText('')).resolves.toBe(false);
    expect(writeText).not.toHaveBeenCalled();
  });
});
