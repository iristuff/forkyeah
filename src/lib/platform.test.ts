import { afterEach, describe, expect, it, vi } from 'vitest';
import { isIOS, isStandalone, readFlag, requestPersistentStorage, writeFlag } from './platform';

function stubNavigator(nav: Partial<Navigator> & Record<string, unknown>) {
  vi.stubGlobal('navigator', nav);
}

function stubDisplayMode(standalone: boolean) {
  vi.stubGlobal('window', { matchMedia: () => ({ matches: standalone }) });
}

function stubStorage() {
  const data = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('isIOS', () => {
  it('detects iPhone', () => {
    stubNavigator({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)', maxTouchPoints: 5 });
    expect(isIOS()).toBe(true);
  });

  it('detects iPadOS, which reports itself as a Mac', () => {
    stubNavigator({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', maxTouchPoints: 5 });
    expect(isIOS()).toBe(true);
  });

  it('does not flag a desktop Mac or Android', () => {
    stubNavigator({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', maxTouchPoints: 0 });
    expect(isIOS()).toBe(false);
    stubNavigator({ userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel 9)', maxTouchPoints: 5 });
    expect(isIOS()).toBe(false);
  });
});

describe('isStandalone', () => {
  it('is true when launched from the home screen', () => {
    stubDisplayMode(true);
    stubNavigator({});
    expect(isStandalone()).toBe(true);
  });

  it('uses the iOS navigator.standalone flag', () => {
    stubDisplayMode(false);
    stubNavigator({ standalone: true });
    expect(isStandalone()).toBe(true);
  });

  it('is false in a normal browser tab', () => {
    stubDisplayMode(false);
    stubNavigator({});
    expect(isStandalone()).toBe(false);
  });
});

describe('requestPersistentStorage', () => {
  it('skips the request when storage is already persisted', async () => {
    const persist = vi.fn();
    stubNavigator({ storage: { persisted: async () => true, persist } as unknown as StorageManager });
    expect(await requestPersistentStorage()).toBe(true);
    expect(persist).not.toHaveBeenCalled();
  });

  it('returns false when the API is missing or throws', async () => {
    stubNavigator({});
    expect(await requestPersistentStorage()).toBe(false);
    stubNavigator({ storage: { persisted: async () => { throw new Error('denied'); } } as unknown as StorageManager });
    expect(await requestPersistentStorage()).toBe(false);
  });
});

describe('readFlag / writeFlag', () => {
  it('round-trips a flag', () => {
    stubStorage();
    expect(readFlag('k')).toBe(false);
    writeFlag('k');
    expect(readFlag('k')).toBe(true);
  });

  it('never throws when storage is blocked', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); },
    });
    expect(readFlag('k')).toBe(false);
    expect(() => writeFlag('k')).not.toThrow();
  });
});
