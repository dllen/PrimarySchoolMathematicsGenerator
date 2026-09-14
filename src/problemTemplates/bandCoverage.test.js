import { describe, it, expect } from 'vitest';
import { APPLICATION_TEMPLATES, OLYMPIAD_TEMPLATES } from './index.js';
import { BANDS } from './helpers.js';

describe('bandCoverage', () => {
  const allTemplates = [...APPLICATION_TEMPLATES, ...OLYMPIAD_TEMPLATES];

  it('covers all expected templates', () => {
    expect(allTemplates.length).toBeGreaterThanOrEqual(6);
  });

  for (const template of allTemplates) {
    describe(template.id, () => {
      it('every subtemplate has a valid band field', () => {
        for (const sub of template.subtemplates) {
          expect(sub).toHaveProperty('band');
          expect(BANDS).toContain(sub.band);
        }
      });

      for (const band of BANDS) {
        it(`has at least 1 subtemplate for band=${band}`, () => {
          const count = template.subtemplates.filter(t => t.band === band).length;
          expect(count, `${template.id} needs ≥1 subtemplate for band=${band}`).toBeGreaterThanOrEqual(1);
        });
      }
    });
  }
});
