import { describe, it, expect } from 'vitest';
import { DslStrategy } from './DslStrategy.js';

describe('DslStrategy', () => {
  it('type === "dsl"', () => {
    const s = new DslStrategy({ grade: 3 });
    expect(s.type).toBe('dsl');
  });

  it('grade=3 → 用 G3_* 模板', () => {
    const s = new DslStrategy({ grade: 3 });
    const q = s.generate();
    expect(q.templateId).toMatch(/^G3_/);
  });

  it('grade=4 → 用 O23_* 模板', () => {
    const s = new DslStrategy({ grade: 4 });
    const q = s.generate();
    expect(q.templateId).toMatch(/^O23_/);
  });

  it('无模板时抛错', () => {
    const s = new DslStrategy({ grade: 99 });
    expect(() => s.generate()).toThrow(/no DSL templates/i);
  });
});
