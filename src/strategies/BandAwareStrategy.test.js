import { describe, it, expect } from 'vitest';
import { BandAwareStrategy } from './BandAwareStrategy.js';
import { createRng } from '../utils/rng.js';
import { templatesFor } from '../problemTemplates/index.js';

const config = { grade: '3', semester: '上', difficulty: 'medium' };

describe('BandAwareStrategy', () => {
  it('constructor stores type, difficultyLevel, and filters templates by grade', () => {
    const s = new BandAwareStrategy(config, { type: 'application' });
    expect(s.type).toBe('application');
    expect(s.difficultyLevel).toBe(2);
    const expectedIds = templatesFor('application', '3').map(t => t.id);
    expect(s.templates.map(t => t.id).sort()).toEqual(expectedIds.sort());
  });

  it('listSubtemplates() returns all subtemplates for current (type, grade)', () => {
    const s = new BandAwareStrategy(config, { type: 'application' });
    const all = s.listSubtemplates();
    const expectedCount = templatesFor('application', '3')
      .reduce((acc, t) => acc + t.subtemplates.length, 0);
    expect(all.length).toBe(expectedCount);
    for (const c of all) {
      expect(c).toHaveProperty('templateId');
      expect(c).toHaveProperty('subtemplateId');
      expect(c).toHaveProperty('band');
      expect(['easy', 'medium', 'hard']).toContain(c.band);
    }
  });

  it('listSubtemplates({band: "easy"}) filters by band', () => {
    const s = new BandAwareStrategy(config, { type: 'olympiad' });
    const easy = s.listSubtemplates({ band: 'easy' });
    expect(easy.length).toBeGreaterThan(0);
    expect(every(easy, c => c.band === 'easy')).toBe(true);
  });

  it('generate(rng) keeps old behavior (delegates to template.generate)', () => {
    const s = new BandAwareStrategy(config, { type: 'application' });
    const a = s.generate(createRng(7));
    expect(a).toMatchObject({
      question: expect.any(String),
      answer: expect.any(String),
      subtype: expect.any(String),
    });
  });

  it('generateFromSubtemplate returns basic fields + templateId + subtemplateId + band', () => {
    const s = new BandAwareStrategy(config, { type: 'application' });
    const [{ templateId, subtemplateId }] = s.listSubtemplates({ band: 'medium' });
    const r = s.generateFromSubtemplate(createRng(11), { templateId, subtemplateId });
    expect(r.question).toBeTypeOf('string');
    expect(r.answer).toBeTypeOf('string');
    expect(r.subtype).toBeTypeOf('string');
    expect(r.payload).toBeTypeOf('object');
    expect(r.templateId).toBe(templateId);
    expect(r.subtemplateId).toBe(subtemplateId);
    expect(r.band).toBe('medium');
  });

  it('generateFromSubtemplate throws when template not found', () => {
    const s = new BandAwareStrategy(config, { type: 'application' });
    expect(() => s.generateFromSubtemplate(createRng(1), {
      templateId: 'no-such-template', subtemplateId: 'x',
    })).toThrow(/template not found/);
  });

  it('generateFromSubtemplate throws when subtemplate not found', () => {
    const s = new BandAwareStrategy(config, { type: 'application' });
    const { templateId } = s.listSubtemplates()[0];
    expect(() => s.generateFromSubtemplate(createRng(1), {
      templateId, subtemplateId: 'no-such-sub',
    })).toThrow(/subtemplate not found/);
  });
});

function every(arr, pred) { return arr.every(pred); }
