import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { boatCurrentTemplate } from './boatCurrent.js';

describe('boatCurrentTemplate', () => {
  it('has 3 subtemplates', () => {
    expect(boatCurrentTemplate.subtemplates.length).toBe(3);
    expect(boatCurrentTemplate.subtemplates.map(s => s.band)).toContain('easy');
    expect(boatCurrentTemplate.subtemplates.map(s => s.band)).toContain('medium');
    expect(boatCurrentTemplate.subtemplates.map(s => s.band)).toContain('hard');
  });
  it('generates valid boat-current questions', () => {
    for (const st of boatCurrentTemplate.subtemplates) {
      const r = st.generate(createRng());
      expect(r.question).toMatch(/顺水|逆水|静水|水速/);
      expect(r.answer).toMatch(/\d/);
      expect(r.subtype).toBe('boat-current');
    }
  });
});
