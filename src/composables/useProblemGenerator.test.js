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
});