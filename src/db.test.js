
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db, addProblemSet, getHistory } from './db.js';

describe('IndexedDB History Logic', () => {

  // Clear the database before each test to ensure a clean slate
  beforeEach(async () => {
    await db.problemSets.clear();
  });

  // Clean up after each test
  afterEach(async () => {
    await db.problemSets.clear();
  });

  it('should add a new problem set to the history', async () => {
    const problem = [{ expression: '1 + 1 = ___', answer: 2 }];
    const config = { problemCount: 1 };

    await addProblemSet(problem, config);
    const history = await getHistory();

    expect(history).toHaveLength(1);
    expect(history[0].config).toEqual(config);
    expect(history[0].problems).toEqual(problem);
  });

  it('should return history sorted with the newest item first', async () => {
    // Add two items, the second one being the newest
    await addProblemSet([], { id: 1 });
    // A minimal delay is necessary to ensure a different timestamp
    await new Promise(res => setTimeout(res, 10)); 
    await addProblemSet([], { id: 2 });

    const history = await getHistory();

    expect(history).toHaveLength(2);
    // The newest item (id: 2) should be the first in the list
    expect(history[0].config.id).toBe(2);
    expect(history[1].config.id).toBe(1);
  });

  it('should limit the history to a maximum of 20 records', async () => {
    // Add 21 records in a loop
    for (let i = 1; i <= 21; i++) {
      await addProblemSet([], { id: i });
      // A small delay to ensure distinct records
      await new Promise(res => setTimeout(res, 5));
    }

    const history = await getHistory();

    expect(history).toHaveLength(20);
    // The first item added (id: 1) should be gone
    // The oldest remaining item should be the one with id: 2
    expect(history[history.length - 1].config.id).toBe(2);
    // The newest item should be the last one added (id: 21)
    expect(history[0].config.id).toBe(21);
  });
});
