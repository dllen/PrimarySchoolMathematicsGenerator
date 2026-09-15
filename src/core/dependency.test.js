import { describe, it, expect } from 'vitest';
import { buildDependencyGraph } from './dependency.js';

describe('buildDependencyGraph', () => {
  it('纯随机变量：拓扑序即声明序', () => {
    const vars = {
      a: { type: 'random', valueType: 'integer', generator: { strategy: 'range', min: 1, max: 10 } },
      b: { type: 'random', valueType: 'integer', generator: { strategy: 'range', min: 1, max: 10 } },
    };
    const { order, edges } = buildDependencyGraph(vars);
    expect(order).toEqual(['a', 'b']);
    expect(edges).toEqual([]);
  });

  it('单层 derived：base 在 derived 前', () => {
    const vars = {
      total: { type: 'derived', valueType: 'integer', expression: { op: 'add', args: [{ type: 'variable', name: 'a' }, { type: 'variable', name: 'b' }] } },
      a: { type: 'random', valueType: 'integer', generator: { strategy: 'range', min: 1, max: 10 } },
      b: { type: 'random', valueType: 'integer', generator: { strategy: 'range', min: 1, max: 10 } },
    };
    const { order } = buildDependencyGraph(vars);
    const ai = order.indexOf('a');
    const bi = order.indexOf('b');
    const ti = order.indexOf('total');
    expect(ti).toBeGreaterThan(ai);
    expect(ti).toBeGreaterThan(bi);
  });

  it('多层 derived：a → b → c 必保 a 在 c 前', () => {
    const vars = {
      c: { type: 'derived', valueType: 'integer', expression: { op: 'add', args: [{ type: 'variable', name: 'b' }, { type: 'literal', value: 1 }] } },
      b: { type: 'derived', valueType: 'integer', expression: { op: 'add', args: [{ type: 'variable', name: 'a' }, { type: 'literal', value: 1 }] } },
      a: { type: 'random', valueType: 'integer', generator: { strategy: 'range', min: 1, max: 10 } },
    };
    const { order } = buildDependencyGraph(vars);
    expect(order.indexOf('a')).toBeLessThan(order.indexOf('b'));
    expect(order.indexOf('b')).toBeLessThan(order.indexOf('c'));
  });

  it('自依赖抛错', () => {
    const vars = {
      a: { type: 'derived', valueType: 'integer', expression: { op: 'add', args: [{ type: 'variable', name: 'a' }, { type: 'literal', value: 1 }] } },
    };
    expect(() => buildDependencyGraph(vars)).toThrow(/cycle/i);
  });

  it('互依赖抛错', () => {
    const vars = {
      a: { type: 'derived', valueType: 'integer', expression: { op: 'add', args: [{ type: 'variable', name: 'b' }] } },
      b: { type: 'derived', valueType: 'integer', expression: { op: 'add', args: [{ type: 'variable', name: 'a' }] } },
    };
    expect(() => buildDependencyGraph(vars)).toThrow(/cycle/i);
  });

  it('未声明依赖抛错', () => {
    const vars = {
      x: { type: 'derived', valueType: 'integer', expression: { op: 'add', args: [{ type: 'variable', name: 'undeclared' }] } },
    };
    expect(() => buildDependencyGraph(vars)).toThrow(/undeclared/i);
  });
});
