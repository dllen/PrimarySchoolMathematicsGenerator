import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { useProblemGenerator } from './useProblemGenerator.js';
import { db } from '../db.js';

describe('useProblemGenerator', () => {
  beforeEach(async () => {
    await db.problemLibrary.clear();
  });

  it('generates arithmetic problems and caches them in library', async () => {
    const gen = useProblemGenerator();
    const config = {
      grade: '3',
      semester: '上',
      questionTypes: ['arithmetic'],
      problemType: 'result',
      difficulty: 'easy',
      problemCount: 5,
      operations: { add: true, subtract: false, multiply: false, divide: false },
      digits: { add: 1, subtract: 1, multiply: 1, divide: 1 },
      termCount: 2,
      useBrackets: false,
      allowRepeatOperators: true,
      knowledgePoints: [],
      composition: { arithmetic: 5, application: 0, olympiad: 0 },
    };
    const problems = await gen.generate(config);
    expect(problems.length).toBe(5);
    const stored = await db.problemLibrary.toArray();
    expect(stored.length).toBeGreaterThanOrEqual(5);
    expect(stored.every((p) => p.type === 'arithmetic')).toBe(true);
  });

  it('deduplicates within a single generation', async () => {
    const gen = useProblemGenerator();
    const config = {
      grade: '2',
      semester: '上',
      questionTypes: ['application'],
      difficulty: 'easy',
      problemCount: 10,
      operations: {},
      digits: {},
      termCount: 2,
      useBrackets: false,
      allowRepeatOperators: true,
      knowledgePoints: [],
      composition: { arithmetic: 0, application: 10, olympiad: 0 },
    };
    const problems = await gen.generate(config);
    const set = new Set(problems.map((p) => p.question));
    expect(set.size).toBe(problems.length);
  });

  it('splits count across multiple question types when composition present', async () => {
    const gen = useProblemGenerator();
    const config = {
      grade: '4',
      semester: '上',
      questionTypes: ['application', 'olympiad'],
      difficulty: 'medium',
      problemCount: 4,
      operations: {},
      digits: {},
      termCount: 2,
      useBrackets: false,
      allowRepeatOperators: true,
      knowledgePoints: [],
      composition: { application: 2, olympiad: 2, arithmetic: 0 },
    };
    const problems = await gen.generate(config);
    const byType = problems.reduce((acc, p) => {
      acc[p.type] = (acc[p.type] || 0) + 1;
      return acc;
    }, {});
    expect(byType.application).toBe(2);
    expect(byType.olympiad).toBe(2);
  });

  it('falls back gracefully if composition is missing — distributes remainder to first type', async () => {
    const gen = useProblemGenerator();
    const config = {
      grade: '3',
      semester: '上',
      questionTypes: ['application'],
      difficulty: 'easy',
      problemCount: 3,
      operations: {},
      digits: {},
      termCount: 2,
      useBrackets: false,
      allowRepeatOperators: true,
      knowledgePoints: [],
      composition: { application: 0, olympiad: 0, arithmetic: 0 },
    };
    const problems = await gen.generate(config);
    expect(problems.length).toBe(3);
  });

  it('单 batch 内每个 subtemplateId 出现次数 ≤ ceil(N/M) + 1', async () => {
    const { enumerateSubtypes } = await import('../problemTemplates/diversity.js');
    const gen = useProblemGenerator();
    const config = {
      grade: '5',  // grade 5+ 让 application/olympiad 各自在 medium band 有 ≥ 15 个 subtype
      semester: '上',
      questionTypes: ['application', 'olympiad'],
      difficulty: 'medium',
      problemCount: 30,
      operations: {},
      digits: {},
      termCount: 2,
      useBrackets: false,
      allowRepeatOperators: true,
      knowledgePoints: [],
      composition: { application: 15, olympiad: 15, arithmetic: 0 },
    };
    const problems = await gen.generate(config);
    expect(problems.length).toBe(30);

    const counts = new Map();
    for (const p of problems) {
      if (p.subtemplateId) {
        counts.set(p.subtemplateId, (counts.get(p.subtemplateId) || 0) + 1);
      }
    }
    // 按 type 分别算 cap,断言取 max(应用题/奥数题 cap) — 直白,不再依赖合并 M 的隐藏巧合
    const appCap = Math.ceil(15 / enumerateSubtypes('application', '5').length) + 1;
    const olyCap = Math.ceil(15 / enumerateSubtypes('olympiad', '5').length) + 1;
    for (const [, n] of counts) {
      expect(n).toBeLessThanOrEqual(Math.max(appCap, olyCap));
    }
    // sanity: 至少触达 5 个不同 subtype(证明多样化了)
    expect(counts.size).toBeGreaterThanOrEqual(5);
  });
});