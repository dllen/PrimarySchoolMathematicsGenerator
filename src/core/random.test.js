import { describe, it, expect } from 'vitest';
import { createRng } from './random.js';

describe('createRng', () => {
  it('同 seed 必产生相同序列', () => {
    const rng1 = createRng(42);
    const rng2 = createRng(42);
    expect(rng1.int(1, 100)).toBe(rng2.int(1, 100));
    expect(rng1.int(1, 100)).toBe(rng2.int(1, 100));
  });

  it('不同 seed 必产生不同序列', () => {
    const rng1 = createRng(42);
    const rng2 = createRng(43);
    expect(rng1.int(1, 100)).not.toBe(rng2.int(1, 100));
  });

  it('int 返回闭区间整数', () => {
    const rng = createRng(1);
    for (let i = 0; i < 100; i++) {
      const v = rng.int(5, 10);
      expect(v).toBeGreaterThanOrEqual(5);
      expect(v).toBeLessThanOrEqual(10);
      expect(Number.isInteger(v)).toBe(true);
    }
  });

  it('float 返回 [min, max)', () => {
    const rng = createRng(1);
    const v = rng.float(0, 1);
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThan(1);
  });

  it('pick 返回数组中一项', () => {
    const rng = createRng(1);
    const arr = ['a', 'b', 'c'];
    expect(arr).toContain(rng.pick(arr));
  });

  it('stream 隔离不同子流', () => {
    const rng1 = createRng(100);
    const rng2 = createRng(100);
    const s1 = rng1.stream('chickens');
    const s2 = rng2.stream('rabbits');
    expect(s1.int(1, 100)).not.toBe(s2.int(1, 100));
  });

  it('next 返回 [0, 1)', () => {
    const rng = createRng(1);
    const v = rng.next();
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThan(1);
  });

  it('缺省 seed 不抛错（fallback Date.now）', () => {
    expect(() => createRng()).not.toThrow();
  });
});
