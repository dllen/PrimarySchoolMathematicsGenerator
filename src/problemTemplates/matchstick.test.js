import { describe, it, expect } from 'vitest';
import { matchstickTemplate } from './matchstick.js';

const rng = () => ({
  int: (a, b) => Math.floor(Math.random() * (b - a + 1)) + a,
  pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
});

describe('matchstickTemplate', () => {
  it('covers 3 bands', () => {
    expect(matchstickTemplate.subtemplates).toHaveLength(3);
  });
  it('generates non-null problems', () => {
    for (const sub of matchstickTemplate.subtemplates) {
      const r = sub.generate(rng());
      expect(r.subtype).toBe('matchstick');
      expect(r.answer).toBeTruthy();
    }
  });
});

describe('matchstickTemplate - character set (spec §5.3)', () => {
  it('every question uses only common Unicode (no emoji or special font glyphs)', () => {
    for (let i = 0; i < 30; i++) {
      const sub = matchstickTemplate.subtemplates[Math.floor(Math.random() * 3)];
      const r = sub.generate(rng());
      // 不含 emoji 或私有 Unicode 区
      expect(r.question).not.toMatch(/[\u{1F000}-\u{1FFFF}]/u);
      expect(r.answer).not.toMatch(/[\u{1F000}-\u{1FFFF}]/u);
    }
  });
  it('every answer mentions 火柴 or 操作 (operation description)', () => {
    for (let i = 0; i < 30; i++) {
      const sub = matchstickTemplate.subtemplates[Math.floor(Math.random() * 3)];
      const r = sub.generate(rng());
      expect(r.answer).toMatch(/火柴|棒|横|竖/);
    }
  });
  it('payload.kind matches one of move/add/remove', () => {
    for (let i = 0; i < 20; i++) {
      const sub = matchstickTemplate.subtemplates[Math.floor(Math.random() * 3)];
      const r = sub.generate(rng());
      expect(['move', 'add', 'remove']).toContain(r.payload.kind);
    }
  });
});
