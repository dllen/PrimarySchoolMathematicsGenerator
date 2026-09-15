import { describe, it, expect } from 'vitest';
import { validateConstraints } from './constraint.js';

describe('validateConstraints', () => {
  const ctx = { vars: { x: 5, y: 10, z: 6 } };

  it('range 通过', () => {
    expect(validateConstraints([{ type: 'range', target: 'x', min: 1, max: 10 }], ctx).ok).toBe(true);
  });

  it('range 失败', () => {
    expect(validateConstraints([{ type: 'range', target: 'x', min: 10, max: 20 }], ctx).ok).toBe(false);
  });

  it('comparison lt 通过', () => {
    expect(validateConstraints([{ type: 'comparison', op: 'lt', left: 'x', right: 'y' }], ctx).ok).toBe(true);
  });

  it('comparison gt 失败', () => {
    expect(validateConstraints([{ type: 'comparison', op: 'gt', left: 'x', right: 'y' }], ctx).ok).toBe(false);
  });

  it('divisible 通过', () => {
    expect(validateConstraints([{ type: 'divisible', dividend: 'z', divisor: 3 }], ctx).ok).toBe(true);
  });

  it('divisible 失败', () => {
    expect(validateConstraints([{ type: 'divisible', dividend: 'x', divisor: 3 }], ctx).ok).toBe(false);
  });

  it('integer 通过', () => {
    expect(validateConstraints([{ type: 'integer', target: 'x' }], ctx).ok).toBe(true);
  });

  it('positive 通过', () => {
    expect(validateConstraints([{ type: 'positive', target: 'x' }], ctx).ok).toBe(true);
  });

  it('positive 失败 (y 改 0)', () => {
    expect(validateConstraints([{ type: 'positive', target: 'y' }], { vars: { y: 0 } }).ok).toBe(false);
  });

  it('enum 通过', () => {
    expect(validateConstraints([{ type: 'enum', target: 'x', values: [5, 6, 7] }], ctx).ok).toBe(true);
  });

  it('unique 通过（当前会话内唯一）', () => {
    expect(validateConstraints([{ type: 'unique', target: 'x', scope: 'session' }], { vars: { x: 5 }, used: { x: [1, 2, 3] } }).ok).toBe(true);
  });

  it('unique 失败', () => {
    expect(validateConstraints([{ type: 'unique', target: 'x', scope: 'session' }], { vars: { x: 5 }, used: { x: [1, 5, 3] } }).ok).toBe(false);
  });

  it('derived predicate 通过', () => {
    expect(validateConstraints([{
      type: 'derived',
      expression: { type: 'operation', op: 'lt', args: [{ type: 'variable', name: 'x' }, { type: 'variable', name: 'y' }] },
    }], ctx).ok).toBe(true);
  });

  it('失败返回 reason + failedIndex', () => {
    const r = validateConstraints([{ type: 'range', target: 'x', min: 10, max: 20 }], ctx);
    expect(r.reason).toBeDefined();
    expect(r.failedIndex).toBe(0);
  });
});
