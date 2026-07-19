import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePreloadedLibrary } from './usePreloadedLibrary.js';

const mockProblems = [
  { q: '1+1=___', a: '2' },
  { q: '2+2=___', a: '4' },
  { q: '3+3=___', a: '6' },
  { q: '4+4=___', a: '8' },
  { q: '5+5=___', a: '10' },
];

describe('usePreloadedLibrary', () => {
  beforeEach(() => {
    usePreloadedLibrary().clearCache();
    globalThis.fetch = vi.fn();
  });

  it('fetches and caches a combo', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ count: 5, problems: mockProblems }),
    });
    const lib = usePreloadedLibrary();
    const a = await lib.get('3', '上', 'arithmetic', 'medium');
    expect(a).toEqual(mockProblems);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);

    const b = await lib.get('3', '上', 'arithmetic', 'medium');
    expect(b).toEqual(mockProblems);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('returns null on 404', async () => {
    globalThis.fetch.mockResolvedValueOnce({ ok: false, status: 404 });
    const lib = usePreloadedLibrary();
    const r = await lib.get('5', '上', 'application', 'easy');
    expect(r).toBeNull();
  });

  it('returns null on fetch error', async () => {
    globalThis.fetch.mockRejectedValueOnce(new Error('network'));
    const lib = usePreloadedLibrary();
    const r = await lib.get('1', '上', 'olympiad', 'easy');
    expect(r).toBeNull();
  });

  it('returns null when JSON has no problems array', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ count: 0 }),
    });
    const lib = usePreloadedLibrary();
    const r = await lib.get('1', '上', 'olympiad', 'easy');
    expect(r).toEqual([]);
  });

  it('samples n unique problems', () => {
    const lib = usePreloadedLibrary();
    const sampled = lib.sample(mockProblems, 3, 42);
    expect(sampled).toHaveLength(3);
    expect(new Set(sampled.map((p) => p.question)).size).toBe(3);
    for (const s of sampled) {
      expect(s).toHaveProperty('question');
      expect(s).toHaveProperty('answer');
    }
  });

  it('returns all problems when n >= length', () => {
    const lib = usePreloadedLibrary();
    const sampled = lib.sample(mockProblems, 10, 1);
    expect(sampled).toHaveLength(5);
  });

  it('returns empty array for empty input', () => {
    const lib = usePreloadedLibrary();
    expect(lib.sample([], 5, 1)).toEqual([]);
    expect(lib.sample(null, 5, 1)).toEqual([]);
  });

  it('clearCache resets in-memory state', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ count: 5, problems: mockProblems }),
    });
    const lib = usePreloadedLibrary();
    await lib.get('3', '上', 'arithmetic', 'medium');
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    lib.clearCache();
    await lib.get('3', '上', 'arithmetic', 'medium');
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });
});