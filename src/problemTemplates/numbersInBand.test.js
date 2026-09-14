import { describe, it, expect } from 'vitest';
import { APPLICATION_TEMPLATES, OLYMPIAD_TEMPLATES } from './index.js';
import { createRng } from '../utils/rng.js';
import { levelToBand } from './helpers.js';

/**
 * Extract all numeric values from a payload object (recursively into nested objects,
 * but not into arrays of objects).
 */
function extractNumbers(obj, seen = new Set()) {
  if (seen.has(obj)) return [];
  seen.add(obj);
  if (obj === null || obj === undefined) return [];
  if (typeof obj === 'number') return [obj];
  if (Array.isArray(obj)) {
    return obj.flatMap(item => typeof item === 'number' ? [item] : extractNumbers(item, seen));
  }
  if (typeof obj === 'object') {
    return Object.values(obj).flatMap(v => extractNumbers(v, seen));
  }
  return [];
}

const allTemplates = [...APPLICATION_TEMPLATES, ...OLYMPIAD_TEMPLATES];

describe('numbersInBand', () => {
  for (const template of allTemplates) {
    describe(template.id, () => {
      for (const level of [1, 2, 3]) {
        const band = levelToBand(level);

        it(`difficulty=${level} (band=${band}) generates valid numeric payloads`, () => {
          let maxVal = -Infinity;
          let minVal = Infinity;

          for (let i = 0; i < 200; i++) {
            const rng = createRng(i * 7 + level * 13);
            const result = template.generate(rng, level);

            expect(result).toHaveProperty('question');
            expect(result).toHaveProperty('answer');
            expect(result).toHaveProperty('payload');

            const nums = extractNumbers(result.payload);
            for (const n of nums) {
              // Allow 0 (e.g., endMinute=0 in time problems) but reject negatives
              expect(n, `value ${n} must be ≥ 0`).toBeGreaterThanOrEqual(0);
              expect(n, `value ${n} must be ≤ 10000`).toBeLessThanOrEqual(10000);
              if (n > maxVal) maxVal = n;
              if (n < minVal) minVal = n;
            }
          }

          expect(minVal).toBeGreaterThanOrEqual(0);
        });
      }

      it('easy band generates smaller numbers than hard band on average', () => {
        const easyNums = [];
        const hardNums = [];

        for (let i = 0; i < 200; i++) {
          const easyRng = createRng(i);
          const hardRng = createRng(i + 1000);

          const easyResult = template.generate(easyRng, 1);
          const hardResult = template.generate(hardRng, 3);

          easyNums.push(...extractNumbers(easyResult.payload));
          hardNums.push(...extractNumbers(hardResult.payload));
        }

        const easyAvg = easyNums.reduce((a, b) => a + b, 0) / easyNums.length;
        const hardAvg = hardNums.reduce((a, b) => a + b, 0) / hardNums.length;

        expect(easyAvg, `easy avg=${easyAvg.toFixed(1)} should be < hard avg=${hardAvg.toFixed(1)}`).toBeLessThan(hardAvg);
      });
    });
  }
});
