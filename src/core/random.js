/**
 * Seedable RNG based on mulberry32.
 * Docs: v2-tech-docs/Math DSL v1.1 §41-42 (Seed 与依赖)
 */

function hashString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Create a seedable RNG instance.
 * @param {number|string} [seed] - default Date.now()
 */
export function createRng(seed) {
  const baseSeed = seed !== undefined ? hashString(String(seed)) : (Date.now() & 0xffffffff) >>> 0;
  const baseNext = mulberry32(baseSeed);

  function makeStream(name) {
    const streamSeed = hashString(baseSeed + ':' + name);
    const next = mulberry32(streamSeed);
    return {
      next,
      int(min, max) {
        return Math.floor(next() * (max - min + 1)) + min;
      },
      float(min, max) {
        return next() * (max - min) + min;
      },
      pick(arr) {
        return arr[Math.floor(next() * arr.length)];
      },
      weighted(picker, weights) {
        const total = weights.reduce((a, b) => a + b, 0);
        let r = next() * total;
        for (let i = 0; i < weights.length; i++) {
          r -= weights[i];
          if (r <= 0) return picker(arr[i]);
        }
        return picker(arr[arr.length - 1]);
      },
    };
  }

  return {
    ...makeStream('__base__'),
    stream(name) {
      return makeStream(name);
    },
  };
}
