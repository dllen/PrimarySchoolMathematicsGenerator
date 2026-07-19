import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { useProblemLibrary } from './useProblemLibrary.js';
import { db } from '../db.js';

describe('useProblemLibrary', () => {
  beforeEach(async () => {
    await db.problemLibrary.clear();
  });

  it('save persists to library and is queryable', async () => {
    const lib = useProblemLibrary();
    const id = await lib.save({
      grade: '3',
      semester: '上',
      type: 'arithmetic',
      subtype: 'add-result',
      difficulty: 1,
      knowledgePoints: ['100以内加减法'],
      question: '12 + 34 = ______',
      answer: '46',
      source: 'generated',
    });
    expect(id).toBeTypeOf('number');
    const results = await lib.query({ grade: '3', semester: '上', type: 'arithmetic' });
    expect(results.length).toBe(1);
    expect(results[0].question).toBe('12 + 34 = ______');
  });

  it('query with difficulty filter', async () => {
    const lib = useProblemLibrary();
    await lib.save({ grade: '3', semester: '上', type: 'arithmetic', subtype: 'add-result', difficulty: 1, knowledgePoints: [], question: 'a', answer: 'b', source: 'generated' });
    await lib.save({ grade: '3', semester: '上', type: 'arithmetic', subtype: 'add-result', difficulty: 2, knowledgePoints: [], question: 'c', answer: 'd', source: 'generated' });
    const easy = await lib.query({ grade: '3', semester: '上', type: 'arithmetic', difficulty: 1 });
    expect(easy.length).toBe(1);
    expect(easy[0].question).toBe('a');
  });

  it('remove deletes by id', async () => {
    const lib = useProblemLibrary();
    const id = await lib.save({ grade: '1', semester: '下', type: 'application', subtype: 'shopping', difficulty: 1, knowledgePoints: [], question: 'x', answer: 'y', source: 'generated' });
    await lib.remove(id);
    const results = await lib.query({ grade: '1', semester: '下', type: 'application' });
    expect(results.length).toBe(0);
  });
});