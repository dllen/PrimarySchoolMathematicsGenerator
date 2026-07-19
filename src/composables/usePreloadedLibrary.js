import { createRng } from '../utils/rng.js';

const KEY_SEP = '-';
const cache = new Map();
const inflight = new Map();

function comboKey(grade, semester, type, difficulty) {
  const sem = semester === '上' ? 'UP' : 'DOWN';
  return `${grade}${KEY_SEP}${sem}${KEY_SEP}${type}${KEY_SEP}${difficulty}`;
}

function fileUrl(key) {
  return `${import.meta.env.BASE_URL}library/${key}.json`;
}

async function loadOne(key) {
  if (cache.has(key)) return cache.get(key);
  if (inflight.has(key)) return inflight.get(key);

  const url = fileUrl(key);
  const promise = (async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      const problems = Array.isArray(data?.problems) ? data.problems : [];
      cache.set(key, problems);
      return problems;
    } catch (err) {
      console.warn(`[usePreloadedLibrary] failed to load ${key}:`, err);
      return null;
    }
  })();
  inflight.set(key, promise);
  const result = await promise;
  inflight.delete(key);
  return result;
}

export function usePreloadedLibrary() {
  async function get(grade, semester, type, difficulty) {
    return loadOne(comboKey(grade, semester, type, difficulty));
  }

  function sample(problems, n, seed) {
    if (!problems || problems.length === 0) return [];
    if (n >= problems.length) {
      return problems.map((p) => ({ question: p.q, answer: p.a }));
    }
    const rng = createRng(seed ?? Date.now());
    const indices = new Set();
    while (indices.size < n) {
      indices.add(rng.int(0, problems.length - 1));
    }
    return Array.from(indices).map((i) => {
      const p = problems[i];
      return { question: p.q, answer: p.a };
    });
  }

  function clearCache() {
    cache.clear();
  }

  return { get, sample, clearCache };
}

export { comboKey as _comboKey };