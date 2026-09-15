import { describe, it, expect } from 'vitest';
import { enumerateSubtypes, computeCap, pickUnderCap, buildComposition, pickNextSubtemplate } from "./diversity.js";
import { BandAwareStrategy } from "../strategies/BandAwareStrategy.js";
import { createRng } from "../utils/rng.js";

describe('enumerateSubtypes', () => {
  it('flattens application templates for grade 3 into (templateId, subtemplateId, band)', () => {
    const out = enumerateSubtypes('application', '3');
    expect(out.length).toBeGreaterThan(0);
    for (const row of out) {
      expect(row).toHaveProperty('templateId');
      expect(row).toHaveProperty('subtemplateId');
      expect(['easy', 'medium', 'hard']).toContain(row.band);
    }
  });

  it('returns [] for a type with no templates matching grade', () => {
    // 用 '0' 模拟越界值(gradeRange 字段语义是字符串年级)
    const out = enumerateSubtypes('application', '0');
    expect(out).toEqual([]);
  });
});

describe('computeCap', () => {
  it('基本公式: cap = ceil(shareCount / subtypeCount) + 1', () => {
    expect(computeCap(15, 22)).toBe(Math.ceil(15 / 22) + 1); // = 2
    expect(computeCap(30, 10)).toBe(Math.ceil(30 / 10) + 1); // = 4
    expect(computeCap(0, 5)).toBe(1);
    expect(computeCap(5, 5)).toBe(2);
  });

  it('subtypeCount=0 时返回 Infinity,避免除零', () => {
    expect(computeCap(10, 0)).toBe(Infinity);
  });
});

describe('pickUnderCap', () => {
  const subs = [
    { subtemplateId: 'a' },
    { subtemplateId: 'b' },
    { subtemplateId: 'c' },
  ];

  it('全未用时,从全部中随机选一个(100 次都合法)', () => {
    const usage = new Map();
    for (let i = 0; i < 100; i++) {
      const idx = pickUnderCap(subs, usage, 2);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(3);
    }
  });

  it('部分超额时,只从未满的中选', () => {
    const usage = new Map([['a', 2], ['b', 0], ['c', 1]]); // a 已满
    for (let i = 0; i < 50; i++) {
      const idx = pickUnderCap(subs, usage, 2);
      expect(['b', 'c']).toContain(subs[idx].subtemplateId);
    }
  });

  it('全超额时返回 -1(调用方 retry 兜底)', () => {
    const usage = new Map([['a', 2], ['b', 2], ['c', 2]]);
    expect(pickUnderCap(subs, usage, 2)).toBe(-1);
  });
});

describe('buildComposition', () => {
  it('显式 composition 直接返回', () => {
    const config = {
      problemCount: 10,
      composition: { arithmetic: 2, application: 3, olympiad: 5 },
      questionTypes: ['arithmetic', 'application', 'olympiad'],
    };
    expect(buildComposition(config)).toEqual({ arithmetic: 2, application: 3, olympiad: 5 });
  });

  it('无 composition 时按 questionTypes 平分 problemCount,余数加在第一个 type', () => {
    const config = {
      problemCount: 10,
      questionTypes: ['application', 'olympiad'],
    };
    const out = buildComposition(config);
    expect(out.application).toBe(5);
    expect(out.olympiad).toBe(5);
    expect(out.arithmetic).toBe(0);
  });

  it('problemCount 不能被 type 数整除时,余数进入第一个 type', () => {
    const config = {
      problemCount: 7,
      questionTypes: ['application', 'olympiad'],
    };
    const out = buildComposition(config);
    expect(out.application).toBe(4); // 7/2 = 3, 余 1 → 3+1
    expect(out.olympiad).toBe(3);
  });
});

describe('enumerateSubtypes (band filter)', () => {
  it('returns only easy-band subtypes when band="easy"', () => {
    const out = enumerateSubtypes('application', '3', 'easy');
    expect(out.length).toBeGreaterThan(0);
    for (const row of out) expect(row.band).toBe('easy');
  });

  it('returns only medium-band subtypes when band="medium"', () => {
    const out = enumerateSubtypes('application', '3', 'medium');
    expect(out.length).toBeGreaterThan(0);
    for (const row of out) expect(row.band).toBe('medium');
  });

  it('returns only hard-band subtypes when band="hard"', () => {
    const out = enumerateSubtypes('application', '3', 'hard');
    expect(out.length).toBeGreaterThan(0);
    for (const row of out) expect(row.band).toBe('hard');
  });

  it('omitting band returns all bands (backward compat)', () => {
    const all = enumerateSubtypes('application', '3');
    const easyOnly = enumerateSubtypes('application', '3', 'easy');
    const mediumOnly = enumerateSubtypes('application', '3', 'medium');
    const hardOnly = enumerateSubtypes('application', '3', 'hard');
    expect(all.length).toBe(easyOnly.length + mediumOnly.length + hardOnly.length);
  });

  it('grade 3 olympiad medium has at most a few subtypes (sanity)', () => {
    const out = enumerateSubtypes('olympiad', '3', 'medium');
    expect(out.length).toBeGreaterThanOrEqual(2);
    expect(out.length).toBeLessThanOrEqual(10);
  });
});


describe('pickNextSubtemplate', () => {
  const config = { grade: '3', semester: '上', difficulty: 'medium' };

  it('returns null when all candidates exceed cap', () => {
    const s = new BandAwareStrategy(config, { type: 'application' });
    const cands = s.listSubtemplates({ band: 'medium' });
    const usage = new Map(cands.map(c => [c.subtemplateId, 5]));
    const r = pickNextSubtemplate(s, 'medium', usage, 5, createRng(1));
    expect(r).toBeNull();
  });

  it('skips candidates that exceed cap', () => {
    const s = new BandAwareStrategy(config, { type: 'application' });
    const cands = s.listSubtemplates({ band: 'medium' });
    // Saturate the first one
    const usage = new Map([[cands[0].subtemplateId, 10]]);
    const r = pickNextSubtemplate(s, 'medium', usage, 5, createRng(2));
    expect(r).not.toBeNull();
    expect(r.subtemplateId).not.toBe(cands[0].subtemplateId);
    expect(r.band).toBe('medium');
  });

  it('picks from full pool when usage is empty', () => {
    const s = new BandAwareStrategy(config, { type: 'application' });
    const cands = s.listSubtemplates({ band: 'medium' });
    const usage = new Map();
    for (let i = 0; i < 50; i++) {
      const r = pickNextSubtemplate(s, 'medium', usage, 5, createRng(i + 100));
      expect(cands.find(c => c.subtemplateId === r.subtemplateId)).toBeDefined();
    }
  });
});
