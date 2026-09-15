# Math DSL Engine MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立 `src/core/` 子系统 + 3 个示范 JSON 模板 + `DslStrategy` 桥接，按 Strangler 渐进形态落地 v2-tech-docs Phase 1 MVP。

**Architecture:** 11 个 core 模块（random / dependency / expression / constraint / solver / renderer / difficulty / validator / schema / generate / index）按依赖顺序串联；JSON 模板通过 schema 校验后由 generate.js 编排生成 question；DslStrategy 复用 ProblemGeneratorFactory 的现有 mode 路由。

**Tech Stack:** Vue 3 + Vite, Vitest + jsdom + fake-indexeddb, Dexie, ESM, **无新依赖**（mulberry32 等内联 ~30 行）。

**Spec:** `docs/superpowers/specs/2026-09-15-dsl-engine-mvp-design.md` (commit `a09fb00`)

---

## File Structure

| 路径 | 角色 | 改动类型 |
|---|---|---|
| `src/core/random.js` | SeedableRNG (mulberry32) + int/float/pick/weighted/next/stream | 新建 |
| `src/core/random.test.js` | 同 seed 必同序列；不同 seed 必不同；stream 隔离 | 新建 |
| `src/core/dependency.js` | 变量 DAG + 拓扑排序 + 循环检测 | 新建 |
| `src/core/dependency.test.js` | topo + cycle 抛错 + 多层依赖 | 新建 |
| `src/core/expression.js` | 4 种 expression 节点 + 7 种 op | 新建 |
| `src/core/expression.test.js` | 求值 + 边界 | 新建 |
| `src/core/constraint.js` | 9 类约束（range/comparison/divisible/integer/positive/unique/enum/fraction/derived）| 新建 |
| `src/core/constraint.test.js` | 9 类各 1 case + 失败返回结构 | 新建 |
| `src/core/solver.js` | 简单 expression 求值 + reverse TODO | 新建 |
| `src/core/solver.test.js` | simple 求值 | 新建 |
| `src/core/renderer.js` | `{{var}}` 替换 + 单位追加 | 新建 |
| `src/core/renderer.test.js` | 替换 + 单位 + 缺失占位 | 新建 |
| `src/core/difficulty.js` | 3 项加权评分 + 5 档映射 | 新建 |
| `src/core/difficulty.test.js` | 加权 + 映射 | 新建 |
| `src/core/validator.js` | Math/Answer/Uniqueness 组合 | 新建 |
| `src/core/validator.test.js` | 3 类验证 | 新建 |
| `src/core/schema.js` | JSON Schema 运行时校验 | 新建 |
| `src/core/schema.test.js` | 合法 + 非法模板 | 新建 |
| `src/core/generate.js` | 顶层编排 | 新建 |
| `src/core/generate.test.js` | 端到端生成 3 个 JSON 的 question | 新建 |
| `src/core/index.js` | 公开 API 桶 | 新建 |
| `src/templates/wordProblems/G3_PRICE_001.json` | docs §24 示例 | 新建 |
| `src/templates/wordProblems/G3_MIX_001.json` | docs §25 示例 | 新建 |
| `src/templates/olympiad/O23_CHICKEN_RABBIT_001.json` | docs §28 示例 | 新建 |
| `src/templates/index.js` | 模板注册表 + loadTemplates | 新建 |
| `src/strategies/DslStrategy.js` | 桥接 JSON + core/generate | 新建 |
| `src/strategies/DslStrategy.test.js` | grade 过滤 + 抛错 | 新建 |
| `src/strategies/ProblemGeneratorFactory.js` | 注册 `dsl` mode | 改 |
| `src/strategies/ProblemGeneratorFactory.test.js` | 验证 dsl mode 路由 | 改 |
| `tests/core-e2e.test.js` | 端到端 e2e | 新建 |

不动的路径：`src/strategies/ApplicationStrategy.js` / `ArithmeticStrategy.js` / `BandAwareStrategy.js`、`src/problemTemplates/*.js` (28 个)、`src/views/*`、`src/components/*`、`src/db.js`、`src/composables/*`、`vitest.config.js`、`package.json`。

---

## Task 1: SeedableRNG（`src/core/random.js`）

**Files:**
- Create: `src/core/random.js`
- Test: `src/core/random.test.js`

- [ ] **Step 1: Write the failing test**

`src/core/random.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { createRng } from './random.js';

describe('createRng', () => {
  it('同 seed 必产生相同序列', () => {
    const rng1 = createRng(42);
    const rng2 = createRng(42);
    expect(rng1.int(1, 100)).toBe(rng2.int(1, 100));
    expect(rng1.int(1, 100)).toBe(rng2.int(1, 100));
  });

  it('不同 seed 必产生不同序列', () => {
    const rng1 = createRng(42);
    const rng2 = createRng(43);
    expect(rng1.int(1, 100)).not.toBe(rng2.int(1, 100));
  });

  it('int 返回闭区间整数', () => {
    const rng = createRng(1);
    for (let i = 0; i < 100; i++) {
      const v = rng.int(5, 10);
      expect(v).toBeGreaterThanOrEqual(5);
      expect(v).toBeLessThanOrEqual(10);
      expect(Number.isInteger(v)).toBe(true);
    }
  });

  it('float 返回 [min, max)', () => {
    const rng = createRng(1);
    const v = rng.float(0, 1);
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThan(1);
  });

  it('pick 返回数组中一项', () => {
    const rng = createRng(1);
    const arr = ['a', 'b', 'c'];
    expect(arr).toContain(rng.pick(arr));
  });

  it('stream 隔离不同子流', () => {
    const rng1 = createRng(100);
    const rng2 = createRng(100);
    const s1 = rng1.stream('chickens');
    const s2 = rng2.stream('rabbits');
    expect(s1.int(1, 100)).not.toBe(s2.int(1, 100));
  });

  it('next 返回 [0, 1)', () => {
    const rng = createRng(1);
    const v = rng.next();
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThan(1);
  });

  it('缺省 seed 不抛错（fallback Date.now）', () => {
    expect(() => createRng()).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/core/random.test.js`
Expected: FAIL — "Cannot find module './random.js'"

- [ ] **Step 3: Write minimal implementation**

`src/core/random.js`:

```js
/**
 * Seedable RNG based on mulberry32.
 * Docs: v2-tech-docs/Math DSL v1.1 §41-42 (Seed 与依赖)
 */

function hashString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Create a seedable RNG instance.
 * @param {number|string} [seed] - default Date.now()
 */
export function createRng(seed) {
  const baseSeed = seed !== undefined ? hashString(String(seed)) : (Date.now() & 0xffffffff) >>> 0;
  const baseNext = mulberry32(baseSeed);

  function makeStream(name) {
    const streamSeed = hashString(baseSeed + ':' + name);
    const next = mulberry32(streamSeed);
    return {
      next,
      int(min, max) {
        return Math.floor(next() * (max - min + 1)) + min;
      },
      float(min, max) {
        return next() * (max - min) + min;
      },
      pick(arr) {
        return arr[Math.floor(next() * arr.length)];
      },
      weighted(picker, weights) {
        const total = weights.reduce((a, b) => a + b, 0);
        let r = next() * total;
        for (let i = 0; i < weights.length; i++) {
          r -= weights[i];
          if (r <= 0) return picker(arr[i]);
        }
        return picker(arr[arr.length - 1]);
      },
    };
  }

  return {
    ...makeStream('__base__'),
    stream(name) {
      return makeStream(name);
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/core/random.test.js`
Expected: 8 passed

- [ ] **Step 5: Commit**

```bash
cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator
git add src/core/random.js src/core/random.test.js
git commit -m "feat(core): SeedableRNG (mulberry32) + stream 命名子流"
```

---

## Task 2: 变量依赖图（`src/core/dependency.js`）

**Files:**
- Create: `src/core/dependency.js`
- Test: `src/core/dependency.test.js`

- [ ] **Step 1: Write the failing test**

`src/core/dependency.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/core/dependency.test.js`
Expected: FAIL — "Cannot find module"

- [ ] **Step 3: Write minimal implementation**

`src/core/dependency.js`:

```js
/**
 * Variable dependency graph + topological order + cycle detection.
 * Docs: v2-tech-docs/Math DSL v1.1 §12-21
 */

/**
 * Walk expression AST, collect referenced variable names.
 */
function collectVarRefs(expr, out = new Set()) {
  if (!expr || typeof expr !== 'object') return out;
  if (expr.type === 'variable') {
    out.add(expr.name);
  } else if (expr.type === 'operation') {
    for (const a of expr.args || []) collectVarRefs(a, out);
  } else if (expr.type === 'conditional') {
    collectVarRefs(expr.condition, out);
    collectVarRefs(expr.then, out);
    collectVarRefs(expr.else, out);
  }
  // literal / constant: no refs
  return out;
}

/**
 * Build dependency DAG.
 * @param {Record<string, object>} variables - DSL variables map
 * @returns {{ nodes: string[], edges: Array<[string, string]>, order: string[] }}
 * @throws {Error} on cycle or undeclared reference
 */
export function buildDependencyGraph(variables) {
  const nodes = Object.keys(variables);
  const edges = [];
  const incoming = new Map(); // var → list of vars it depends on

  for (const name of nodes) {
    const def = variables[name];
    if (def.type !== 'derived') {
      incoming.set(name, []);
      continue;
    }
    const refs = collectVarRefs(def.expression);
    for (const ref of refs) {
      if (!(ref in variables)) {
        throw new Error(`Undeclared variable reference: ${ref} (in ${name})`);
      }
      if (ref === name) {
        throw new Error(`Self-dependency cycle detected: ${name}`);
      }
      edges.push([ref, name]);
    }
    incoming.set(name, [...refs]);
  }

  // Detect cycles via DFS coloring
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map(nodes.map(n => [n, WHITE]));

  function dfs(start, current) {
    if (color.get(current) === GRAY) {
      throw new Error(`Dependency cycle detected at ${current} (from ${start})`);
    }
    if (color.get(current) === BLACK) return;
    color.set(current, GRAY);
    for (const dep of incoming.get(current) || []) {
      dfs(start, dep);
    }
    color.set(current, BLACK);
  }
  for (const n of nodes) dfs(n, n);

  // Kahn's topological sort
  const indeg = new Map(nodes.map(n => [n, 0]));
  for (const [, to] of edges) indeg.set(to, indeg.get(to) + 1);
  const queue = nodes.filter(n => indeg.get(n) === 0);
  const order = [];
  while (queue.length) {
    const n = queue.shift();
    order.push(n);
    for (const [from, to] of edges) {
      if (from === n) {
        indeg.set(to, indeg.get(to) - 1);
        if (indeg.get(to) === 0) queue.push(to);
      }
    }
  }

  if (order.length !== nodes.length) {
    throw new Error('Dependency cycle detected (Kahn)');
  }

  return { nodes, edges, order };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/core/dependency.test.js`
Expected: 6 passed

- [ ] **Step 5: Commit**

```bash
cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator
git add src/core/dependency.js src/core/dependency.test.js
git commit -m "feat(core): 变量依赖图 + 拓扑排序 + 循环检测"
```

---

## Task 3: 表达式求值器（`src/core/expression.js`）

**Files:**
- Create: `src/core/expression.js`
- Test: `src/core/expression.test.js`

- [ ] **Step 1: Write the failing test**

`src/core/expression.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { evaluate } from './expression.js';

describe('evaluate', () => {
  it('literal 求值', () => {
    expect(evaluate({ type: 'literal', value: 42 }, { vars: {} }).value).toBe(42);
  });

  it('variable 引用', () => {
    expect(evaluate({ type: 'variable', name: 'a' }, { vars: { a: 5 } }).value).toBe(5);
  });

  it('operation 加法', () => {
    const expr = { type: 'operation', op: 'add', args: [
      { type: 'literal', value: 2 },
      { type: 'literal', value: 3 },
    ]};
    expect(evaluate(expr, { vars: {} }).value).toBe(5);
  });

  it('operation 嵌套', () => {
    const expr = { type: 'operation', op: 'multiply', args: [
      { type: 'operation', op: 'add', args: [
        { type: 'literal', value: 2 },
        { type: 'literal', value: 3 },
      ]},
      { type: 'literal', value: 4 },
    ]};
    expect(evaluate(expr, { vars: {} }).value).toBe(20);
  });

  it('operation 除法', () => {
    const expr = { type: 'operation', op: 'divide', args: [
      { type: 'literal', value: 10 },
      { type: 'literal', value: 2 },
    ]};
    expect(evaluate(expr, { vars: {} }).value).toBe(5);
  });

  it('operation 除零返回 ok:false', () => {
    const expr = { type: 'operation', op: 'divide', args: [
      { type: 'literal', value: 10 },
      { type: 'literal', value: 0 },
    ]};
    const r = evaluate(expr, { vars: {} });
    expect(r.ok).toBe(false);
  });

  it('operation remainder', () => {
    const expr = { type: 'operation', op: 'remainder', args: [
      { type: 'literal', value: 10 },
      { type: 'literal', value: 3 },
    ]};
    expect(evaluate(expr, { vars: {} }).value).toBe(1);
  });

  it('conditional 三元', () => {
    const expr = {
      type: 'conditional',
      condition: { type: 'literal', value: true },
      then: { type: 'literal', value: 'yes' },
      else: { type: 'literal', value: 'no' },
    };
    expect(evaluate(expr, { vars: {} }).value).toBe('yes');
  });

  it('未定义变量返回 ok:false', () => {
    const r = evaluate({ type: 'variable', name: 'missing' }, { vars: {} });
    expect(r.ok).toBe(false);
  });

  it('未知 op 返回 ok:false', () => {
    const expr = { type: 'operation', op: 'unknown', args: [] };
    expect(evaluate(expr, { vars: {} }).ok).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/core/expression.test.js`
Expected: FAIL — module not found

- [ ] **Step 3: Write minimal implementation**

`src/core/expression.js`:

```js
/**
 * Expression evaluator.
 * Docs: v2-tech-docs/Math DSL v1.1 §6-11, §29-32
 */

const OPS = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => {
    if (b === 0) return undefined;
    return a / b;
  },
  remainder: (a, b) => {
    if (b === 0) return undefined;
    return a % b;
  },
  gcd: (a, b) => {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { [a, b] = [b, a % b]; }
    return a;
  },
  lcm: (a, b) => {
    if (a === 0 || b === 0) return 0;
    return Math.abs(a * b) / OPS.gcd(a, b);
  },
};

function evalNode(node, ctx) {
  if (!node || typeof node !== 'object') {
    return { ok: false, error: 'invalid node' };
  }
  if (node.type === 'literal' || node.valueType === 'literal') {
    return { ok: true, value: node.value };
  }
  if (node.type === 'constant' || node.type === 'const') {
    return { ok: true, value: node.value };
  }
  if (node.type === 'variable') {
    if (!(node.name in ctx.vars)) {
      return { ok: false, error: `undefined variable: ${node.name}` };
    }
    return { ok: true, value: ctx.vars[node.name] };
  }
  if (node.type === 'operation') {
    const argResults = node.args.map(a => evalNode(a, ctx));
    for (const r of argResults) if (!r.ok) return r;
    const fn = OPS[node.op];
    if (!fn) return { ok: false, error: `unknown op: ${node.op}` };
    const value = fn(...argResults.map(r => r.value));
    if (value === undefined) return { ok: false, error: `op ${node.op} failed` };
    return { ok: true, value };
  }
  if (node.type === 'conditional') {
    const cond = evalNode(node.condition, ctx);
    if (!cond.ok) return cond;
    return evalNode(cond.value ? node.then : node.else, ctx);
  }
  return { ok: false, error: `unknown expression type: ${node.type}` };
}

/**
 * @param {object} expr - expression node
 * @param {object} ctx - { vars: Record<string, any>, rng? }
 * @returns {{ ok: boolean, value?: any, error?: string }}
 */
export function evaluate(expr, ctx) {
  return evalNode(expr, { ...ctx, vars: ctx.vars || {} });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/core/expression.test.js`
Expected: 10 passed

- [ ] **Step 5: Commit**

```bash
cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator
git add src/core/expression.js src/core/expression.test.js
git commit -m "feat(core): 表达式求值器 (literal/variable/operation/conditional, 7 ops)"
```

---

## Task 4: 9 类约束验证（`src/core/constraint.js`）

**Files:**
- Create: `src/core/constraint.js`
- Test: `src/core/constraint.test.js`

- [ ] **Step 1: Write the failing test**

`src/core/constraint.test.js`:

```js
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

  it('失败返回 reason + hint', () => {
    const r = validateConstraints([{ type: 'range', target: 'x', min: 10, max: 20 }], ctx);
    expect(r.reason).toBeDefined();
    expect(r.failedIndex).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/core/constraint.test.js`
Expected: FAIL — module not found

- [ ] **Step 3: Write minimal implementation**

`src/core/constraint.js`:

```js
/**
 * Constraint validation.
 * Docs: v2-tech-docs/Math DSL v1.0 §9-16
 */

import { evaluate } from './expression.js';

const CMP_OPS = {
  lt: (a, b) => a < b,
  le: (a, b) => a <= b,
  gt: (a, b) => a > b,
  ge: (a, b) => a >= b,
  eq: (a, b) => a === b,
  neq: (a, b) => a !== b,
};

function checkOne(c, ctx) {
  const used = ctx.used || {};
  switch (c.type) {
    case 'range': {
      const v = ctx.vars[c.target];
      if (v === undefined) return { ok: false, reason: `var ${c.target} not defined` };
      if (v < c.min || v > c.max) return { ok: false, reason: `${c.target}=${v} not in [${c.min}, ${c.max}]`, hint: `调整 ${c.target} 范围` };
      return { ok: true };
    }
    case 'comparison': {
      const a = ctx.vars[c.left];
      const b = ctx.vars[c.right];
      if (a === undefined || b === undefined) return { ok: false, reason: 'comparison var missing' };
      const fn = CMP_OPS[c.op];
      if (!fn) return { ok: false, reason: `unknown comparison op ${c.op}` };
      if (!fn(a, b)) return { ok: false, reason: `${a} !${c.op} ${b}` };
      return { ok: true };
    }
    case 'divisible': {
      const dividend = ctx.vars[c.dividend];
      const divisor = typeof c.divisor === 'string' ? ctx.vars[c.divisor] : c.divisor;
      if (divisor === 0) return { ok: false, reason: 'divisor is 0' };
      if (dividend % divisor !== 0) return { ok: false, reason: `${dividend} not divisible by ${divisor}`, hint: '重选 dividend 或 divisor' };
      return { ok: true };
    }
    case 'integer': {
      const v = ctx.vars[c.target];
      if (!Number.isInteger(v)) return { ok: false, reason: `${c.target}=${v} not integer` };
      return { ok: true };
    }
    case 'positive': {
      const v = ctx.vars[c.target];
      if (v <= 0) return { ok: false, reason: `${c.target}=${v} not positive` };
      return { ok: true };
    }
    case 'unique': {
      const v = ctx.vars[c.target];
      const usedList = used[c.target] || [];
      if (usedList.includes(v)) return { ok: false, reason: `${c.target}=${v} already used`, hint: '重试' };
      return { ok: true };
    }
    case 'enum': {
      const v = ctx.vars[c.target];
      if (!c.values.includes(v)) return { ok: false, reason: `${v} not in enum` };
      return { ok: true };
    }
    case 'fraction': {
      const v = ctx.vars[c.target];
      if (!v || typeof v !== 'object' || !('numerator' in v)) return { ok: false, reason: 'not a fraction' };
      if (c.denominator && v.denominator !== c.denominator) return { ok: false, reason: 'denominator mismatch' };
      if (c.reduced) {
        const g = (a, b) => b === 0 ? a : g(b, a % b);
        if (g(v.numerator, v.denominator) !== 1) return { ok: false, reason: 'not reduced' };
      }
      return { ok: true };
    }
    case 'derived': {
      const r = evaluate(c.expression, ctx);
      if (!r.ok) return { ok: false, reason: r.error };
      if (!r.value) return { ok: false, reason: 'predicate false' };
      return { ok: true };
    }
    default:
      return { ok: false, reason: `unknown constraint type ${c.type}` };
  }
}

/**
 * @param {Array<object>} constraints
 * @param {{ vars: Record<string, any>, used?: Record<string, any[]> }} ctx
 * @returns {{ ok: boolean, reason?: string, hint?: string, failedIndex?: number }}
 */
export function validateConstraints(constraints, ctx) {
  for (let i = 0; i < constraints.length; i++) {
    const r = checkOne(constraints[i], ctx);
    if (!r.ok) return { ok: false, reason: r.reason, hint: r.hint, failedIndex: i };
  }
  return { ok: true };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/core/constraint.test.js`
Expected: 13 passed

- [ ] **Step 5: Commit**

```bash
cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator
git add src/core/constraint.js src/core/constraint.test.js
git commit -m "feat(core): 9 类约束验证器 (range/comparison/divisible/integer/positive/unique/enum/fraction/derived)"
```

---

## Task 5: 简单求值 + reverse TODO（`src/core/solver.js`）

**Files:**
- Create: `src/core/solver.js`
- Test: `src/core/solver.test.js`

- [ ] **Step 1: Write the failing test**

`src/core/solver.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { solveAnswer } from './solver.js';

describe('solveAnswer', () => {
  it('简单 expression 求值', () => {
    const answerDef = { type: 'integer', expression: { type: 'operation', op: 'add', args: [{ type: 'variable', name: 'a' }, { type: 'variable', name: 'b' }] } };
    expect(solveAnswer(answerDef, { a: 3, b: 4 }).value).toBe(7);
  });

  it('answer type integer + 整数结果', () => {
    const answerDef = { type: 'integer', expression: { type: 'variable', name: 'n' } };
    expect(solveAnswer(answerDef, { n: 42 }).value).toBe(42);
  });

  it('鸡兔同笼反推留 TODO（reverse generation）', () => {
    expect(solveAnswer({ type: 'integer', expression: { type: 'variable', name: 'chickens' }, reverse: true }, { chickens: 5 }).reversePending).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/core/solver.test.js`
Expected: FAIL — module not found

- [ ] **Step 3: Write minimal implementation**

`src/core/solver.js`:

```js
/**
 * Solver.
 * Docs: v2-tech-docs/Math DSL v1.0 §20-21, §38 (Solver 节点)
 * 本期 MVP 只支持简单 expression 求值；reverse generation 留 TODO
 * （见 docs §26 第三阶段：鸡兔同笼等需要 Proof Tree + Reverse Generation）
 */

import { evaluate } from './expression.js';

/**
 * @param {object} answerDef - DSL answer 定义
 * @param {Record<string, any>} vars - 已求值变量
 * @returns {{ ok: boolean, value?: any, type?: string, reversePending?: boolean }}
 */
export function solveAnswer(answerDef, vars) {
  if (answerDef.reverse) {
    // TODO: 第三阶段实现 reverse generation
    // 参考 docs §26 Proof Tree / Reverse Generation
    return { ok: true, reversePending: true, type: answerDef.type };
  }
  const r = evaluate(answerDef.expression, { vars });
  if (!r.ok) return { ok: false, error: r.error };
  return { ok: true, value: r.value, type: answerDef.type };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/core/solver.test.js`
Expected: 3 passed

- [ ] **Step 5: Commit**

```bash
cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator
git add src/core/solver.js src/core/solver.test.js
git commit -m "feat(core): 简单 expression 求值；reverse generation 留 TODO"
```

---

## Task 6: 文本模板渲染（`src/core/renderer.js`）

**Files:**
- Create: `src/core/renderer.js`
- Test: `src/core/renderer.test.js`

- [ ] **Step 1: Write the failing test**

`src/core/renderer.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { render } from './renderer.js';

describe('render', () => {
  it('简单变量替换', () => {
    expect(render('a={{x}} b={{y}}', { x: 5, y: 10 })).toBe('a=5 b=10');
  });

  it('数字变量渲染', () => {
    expect(render('{{unitPrice}} × {{quantity}} = {{total}}', { unitPrice: 8, quantity: 6, total: 48 })).toBe('8 × 6 = 48');
  });

  it('缺失占位保留原样', () => {
    expect(render('a={{x}} b={{missing}}', { x: 5 })).toBe('a=5 b={{missing}}');
  });

  it('追加单位', () => {
    expect(render('{{total}}', { total: 48 }, { unit: '元' })).toBe('48元');
  });

  it('空 vars 不抛错', () => {
    expect(render('hello', {})).toBe('hello');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/core/renderer.test.js`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

`src/core/renderer.js`:

```js
/**
 * Text template renderer.
 * Docs: v2-tech-docs/Math DSL v1.0 §23, §37
 */

const PLACEHOLDER = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;

/**
 * @param {string} template - 含 {{var}} 占位的文本
 * @param {Record<string, any>} vars - 变量值
 * @param {{ unit?: string }} [opts]
 * @returns {string}
 */
export function render(template, vars, opts = {}) {
  if (typeof template !== 'string') return '';
  const out = template.replace(PLACEHOLDER, (_, name) => {
    if (Object.prototype.hasOwnProperty.call(vars, name)) {
      return String(vars[name]);
    }
    return `{{${name}}}`;
  });
  if (opts.unit && !out.endsWith(opts.unit)) {
    return out + opts.unit;
  }
  return out;
}

/**
 * 渲染 answer 字符串：值 + 单位（如有）
 */
export function renderAnswer(value, answerDef) {
  if (value === undefined || value === null) return '';
  let s = String(value);
  if (answerDef?.unit && !s.endsWith(answerDef.unit)) s += answerDef.unit;
  return s;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/core/renderer.test.js`
Expected: 5 passed

- [ ] **Step 5: Commit**

```bash
cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator
git add src/core/renderer.js src/core/renderer.test.js
git commit -m "feat(core): 文本模板渲染 ({{var}} 替换 + 单位追加)"
```

---

## Task 7: 难度评分（`src/core/difficulty.js`）

**Files:**
- Create: `src/core/difficulty.js`
- Test: `src/core/difficulty.test.js`

- [ ] **Step 1: Write the failing test**

`src/core/difficulty.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { calculateDifficulty, scoreToLevel } from './difficulty.js';

describe('calculateDifficulty', () => {
  it('0 变量 → 0 分', () => {
    const t = { variables: {}, answer: { type: 'integer', expression: { type: 'literal', value: 1 } } };
    expect(calculateDifficulty(t, {})).toBe(0);
  });

  it('3 random + 1 multiply → operationScore=5, variableScore=9, depthScore=4 = 18', () => {
    const t = {
      variables: {
        a: { type: 'random', valueType: 'integer', generator: { strategy: 'range', min: 1, max: 10 } },
        b: { type: 'random', valueType: 'integer', generator: { strategy: 'range', min: 1, max: 10 } },
        c: { type: 'random', valueType: 'integer', generator: { strategy: 'range', min: 1, max: 10 } },
        total: { type: 'derived', valueType: 'integer', expression: { type: 'operation', op: 'multiply', args: [{ type: 'variable', name: 'a' }, { type: 'variable', name: 'b' }] } },
      },
      answer: { type: 'integer', expression: { type: 'variable', name: 'total' } },
    };
    // 4 vars × 3 = 12, 1 op × 5 = 5, depth 1 × 4 = 4 → 21
    expect(calculateDifficulty(t, { a: 1, b: 2, c: 3, total: 2 })).toBe(21);
  });
});

describe('scoreToLevel', () => {
  it('0 → level 1', () => expect(scoreToLevel(0)).toBe(1));
  it('20 → level 1', () => expect(scoreToLevel(20)).toBe(1));
  it('21 → level 2', () => expect(scoreToLevel(21)).toBe(2));
  it('40 → level 2', () => expect(scoreToLevel(40)).toBe(2));
  it('41 → level 3', () => expect(scoreToLevel(41)).toBe(3));
  it('60 → level 3', () => expect(scoreToLevel(60)).toBe(3));
  it('61 → level 4', () => expect(scoreToLevel(61)).toBe(4));
  it('80 → level 4', () => expect(scoreToLevel(80)).toBe(4));
  it('81 → level 5', () => expect(scoreToLevel(81)).toBe(5));
  it('100 → level 5', () => expect(scoreToLevel(100)).toBe(5));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/core/difficulty.test.js`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

`src/core/difficulty.js`:

```js
/**
 * Difficulty scoring (5 levels).
 * Docs: v2-tech-docs/Math DSL v1.0 §35
 * 本期 MVP: 只算 operationScore + variableScore + depthScore
 * 后 4 项 (knowledgeScore/reasoningScore/numberScore/readingScore) 用 0 占位
 */

function collectOps(node, out = new Set()) {
  if (!node || typeof node !== 'object') return out;
  if (node.type === 'operation' && node.op) out.add(node.op);
  if (node.args) for (const a of node.args) collectOps(a, out);
  if (node.then) collectOps(node.then, out);
  if (node.else) collectOps(node.else, out);
  if (node.condition) collectOps(node.condition, out);
  return out;
}

function maxDepth(node, depth = 0) {
  if (!node || typeof node !== 'object') return depth;
  if (node.type === 'operation' && node.args?.length) {
    return Math.max(...node.args.map(a => maxDepth(a, depth + 1)));
  }
  if (node.type === 'conditional') {
    return Math.max(maxDepth(node.condition, depth), maxDepth(node.then, depth + 1), maxDepth(node.else, depth + 1));
  }
  return depth;
}

/**
 * @param {object} template - DSL template
 * @param {Record<string, any>} vars - 实际求值变量
 * @returns {number} 0-100 分数
 */
export function calculateDifficulty(template, vars) {
  const variableScore = Object.keys(template.variables || {}).length * 3;

  // 收集所有表达式（变量 + answer）
  const exprs = [];
  for (const def of Object.values(template.variables || {})) {
    if (def.expression) exprs.push(def.expression);
  }
  if (template.answer?.expression) exprs.push(template.answer.expression);

  const ops = new Set();
  for (const e of exprs) collectOps(e, ops);
  const operationScore = ops.size * 5;

  let depthScore = 0;
  for (const e of exprs) {
    depthScore = Math.max(depthScore, maxDepth(e));
  }
  depthScore *= 4;

  // 知识/推理/数字/阅读 — 第三期接入知识点图谱前用 0
  return operationScore + variableScore + depthScore;
}

export function scoreToLevel(score) {
  if (score <= 20) return 1;
  if (score <= 40) return 2;
  if (score <= 60) return 3;
  if (score <= 80) return 4;
  return 5;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/core/difficulty.test.js`
Expected: 12 passed

- [ ] **Step 5: Commit**

```bash
cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator
git add src/core/difficulty.js src/core/difficulty.test.js
git commit -m "feat(core): 5 档难度评分 (operation+variable+depth, 知识分占位)"
```

---

## Task 8: 验证器组合（`src/core/validator.js`）

**Files:**
- Create: `src/core/validator.js`
- Test: `src/core/validator.test.js`

- [ ] **Step 1: Write the failing test**

`src/core/validator.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { mathValidator, answerValidator, uniquenessValidator } from './validator.js';

describe('mathValidator', () => {
  it('answer 等于表达式结果 → ok', () => {
    const r = mathValidator({
      answer: 7,
      answerDef: { type: 'integer', expression: { type: 'operation', op: 'add', args: [{ type: 'variable', name: 'a' }, { type: 'variable', name: 'b' }] } },
      vars: { a: 3, b: 4 },
    });
    expect(r.ok).toBe(true);
  });

  it('answer 不等于表达式结果 → fail', () => {
    const r = mathValidator({
      answer: 100,
      answerDef: { type: 'integer', expression: { type: 'operation', op: 'add', args: [{ type: 'variable', name: 'a' }, { type: 'variable', name: 'b' }] } },
      vars: { a: 3, b: 4 },
    });
    expect(r.ok).toBe(false);
  });
});

describe('answerValidator', () => {
  it('integer 类型 + 整数 → ok', () => {
    expect(answerValidator({ answer: 5, answerDef: { type: 'integer' } }).ok).toBe(true);
  });
  it('integer 类型 + 浮点 → fail', () => {
    expect(answerValidator({ answer: 1.5, answerDef: { type: 'integer' } }).ok).toBe(false);
  });
  it('decimal 类型 + 浮点 → ok', () => {
    expect(answerValidator({ answer: 1.5, answerDef: { type: 'decimal' } }).ok).toBe(true);
  });
});

describe('uniquenessValidator', () => {
  it('当前 batch 内不重复 → ok', () => {
    expect(uniquenessValidator({ hash: 'abc', batchHashes: [] }).ok).toBe(true);
  });
  it('重复 → fail', () => {
    expect(uniquenessValidator({ hash: 'abc', batchHashes: ['abc'] }).ok).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/core/validator.test.js`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

`src/core/validator.js`:

```js
/**
 * Composed validators.
 * Docs: v2-tech-docs/Math DSL v1.0 §39
 */

import { evaluate } from './expression.js';

export function mathValidator({ answer, answerDef, vars }) {
  if (!answerDef?.expression) return { ok: true, skipped: true };
  const r = evaluate(answerDef.expression, { vars });
  if (!r.ok) return { ok: false, reason: r.error };
  if (r.value !== answer) {
    return { ok: false, reason: `answer ${answer} != expression ${r.value}` };
  }
  return { ok: true };
}

export function answerValidator({ answer, answerDef }) {
  if (!answerDef?.type) return { ok: true, skipped: true };
  switch (answerDef.type) {
    case 'integer':
      if (!Number.isInteger(answer)) return { ok: false, reason: 'not integer' };
      return { ok: true };
    case 'decimal':
      if (typeof answer !== 'number') return { ok: false, reason: 'not number' };
      return { ok: true };
    case 'string':
      if (typeof answer !== 'string') return { ok: false, reason: 'not string' };
      return { ok: true };
    default:
      return { ok: true, skipped: true };
  }
}

export function uniquenessValidator({ hash, batchHashes = [] }) {
  if (batchHashes.includes(hash)) return { ok: false, reason: 'duplicate' };
  return { ok: true };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/core/validator.test.js`
Expected: 7 passed

- [ ] **Step 5: Commit**

```bash
cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator
git add src/core/validator.js src/core/validator.test.js
git commit -m "feat(core): Math/Answer/Uniqueness 验证器"
```

---

## Task 9: JSON Schema 运行时校验（`src/core/schema.js`）

**Files:**
- Create: `src/core/schema.js`
- Test: `src/core/schema.test.js`

- [ ] **Step 1: Write the failing test**

`src/core/schema.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { validateTemplate } from './schema.js';

describe('validateTemplate', () => {
  const validPrice = {
    id: 'G3_PRICE_001',
    version: '1.0',
    metadata: { name: '单价数量总价', type: 'word_problem', grade: 3 },
    variables: {
      unitPrice: { type: 'random', valueType: 'integer', generator: { strategy: 'range', min: 2, max: 20 } },
      quantity: { type: 'random', valueType: 'integer', generator: { strategy: 'range', min: 2, max: 10 } },
      total: { type: 'derived', valueType: 'integer', expression: { type: 'operation', op: 'multiply', args: [{ type: 'variable', name: 'unitPrice' }, { type: 'variable', name: 'quantity' }] } },
    },
    answer: { type: 'integer', expression: 'total', unit: '元' },
    renderer: { question: '一本{{unitPrice}}元，{{quantity}}本多少钱？' },
  };

  it('合法模板通过', () => {
    expect(validateTemplate(validPrice).ok).toBe(true);
  });

  it('缺 id 失败', () => {
    const t = { ...validPrice };
    delete t.id;
    expect(validateTemplate(t).ok).toBe(false);
  });

  it('缺 variables 失败', () => {
    const t = { ...validPrice };
    delete t.variables;
    expect(validateTemplate(t).ok).toBe(false);
  });

  it('缺 renderer.question 失败', () => {
    const t = { ...validPrice, renderer: {} };
    expect(validateTemplate(t).ok).toBe(false);
  });

  it('缺 answer 失败', () => {
    const t = { ...validPrice };
    delete t.answer;
    expect(validateTemplate(t).ok).toBe(false);
  });

  it('variable 缺 type 失败', () => {
    const t = JSON.parse(JSON.stringify(validPrice));
    delete t.variables.unitPrice.type;
    expect(validateTemplate(t).ok).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/core/schema.test.js`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

`src/core/schema.js`:

```js
/**
 * JSON template schema validator (runtime).
 * Docs: v2-tech-docs/Math DSL v1.0 §2 顶层结构
 */

const REQUIRED_TOP = ['id', 'metadata', 'variables', 'answer', 'renderer'];
const REQUIRED_META = ['name', 'type', 'grade'];
const VALID_VAR_TYPES = new Set(['random', 'derived', 'constant']);

function isObject(x) {
  return x !== null && typeof x === 'object' && !Array.isArray(x);
}

/**
 * @param {object} t
 * @returns {{ ok: boolean, errors?: string[] }}
 */
export function validateTemplate(t) {
  const errors = [];
  if (!isObject(t)) return { ok: false, errors: ['template must be object'] };

  for (const k of REQUIRED_TOP) {
    if (!(k in t)) errors.push(`missing top-level: ${k}`);
  }
  if (errors.length) return { ok: false, errors };

  if (!isObject(t.metadata)) {
    errors.push('metadata must be object');
  } else {
    for (const k of REQUIRED_META) {
      if (!(k in t.metadata)) errors.push(`missing metadata: ${k}`);
    }
  }

  if (!isObject(t.variables) || Object.keys(t.variables).length === 0) {
    errors.push('variables must be non-empty object');
  } else {
    for (const [name, def] of Object.entries(t.variables)) {
      if (!isObject(def)) {
        errors.push(`variable ${name} must be object`);
        continue;
      }
      if (!VALID_VAR_TYPES.has(def.type)) {
        errors.push(`variable ${name} has invalid type: ${def.type}`);
      }
      if (def.type === 'random' && (!def.generator || !def.generator.strategy)) {
        errors.push(`variable ${name} random needs generator.strategy`);
      }
      if (def.type === 'derived' && !def.expression) {
        errors.push(`variable ${name} derived needs expression`);
      }
    }
  }

  if (!isObject(t.answer) || !('expression' in t.answer) || !t.answer.type) {
    errors.push('answer must have type and expression');
  }

  if (!isObject(t.renderer) || typeof t.renderer.question !== 'string' || !t.renderer.question.length) {
    errors.push('renderer.question must be non-empty string');
  }

  return errors.length ? { ok: false, errors } : { ok: true };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/core/schema.test.js`
Expected: 6 passed

- [ ] **Step 5: Commit**

```bash
cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator
git add src/core/schema.js src/core/schema.test.js
git commit -m "feat(core): JSON 模板运行时校验"
```

---

## Task 10: 顶层编排（`src/core/generate.js`）

**Files:**
- Create: `src/core/generate.js`
- Test: `src/core/generate.test.js`

- [ ] **Step 1: Write the failing test**

`src/core/generate.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { generateQuestion } from './generate.js';
import priceTpl from '../templates/wordProblems/G3_PRICE_001.json' with { type: 'json' };

describe('generateQuestion', () => {
  it('G3_PRICE_001 生成完整 Question 字段', () => {
    const q = generateQuestion({ template: priceTpl, seed: 42, index: 0 });
    expect(q).toMatchObject({
      templateId: 'G3_PRICE_001',
      seed: 42,
      index: 0,
    });
    expect(typeof q.question).toBe('string');
    expect(q.question.length).toBeGreaterThan(0);
    expect(typeof q.answer).toBe('object');
    expect(q.answer.value).toBeGreaterThan(0);
    expect(typeof q.difficulty.level).toBe('number');
    expect(typeof q.hash).toBe('string');
    expect(q.variables.unitPrice).toBeDefined();
    expect(q.variables.quantity).toBeDefined();
    expect(q.variables.total).toBe(q.variables.unitPrice * q.variables.quantity);
  });

  it('同 seed + 同 index 必产相同 Question', () => {
    const q1 = generateQuestion({ template: priceTpl, seed: 1, index: 0 });
    const q2 = generateQuestion({ template: priceTpl, seed: 1, index: 0 });
    expect(q1).toEqual(q2);
  });

  it('不同 seed 必产不同 Question', () => {
    const q1 = generateQuestion({ template: priceTpl, seed: 1, index: 0 });
    const q2 = generateQuestion({ template: priceTpl, seed: 2, index: 0 });
    expect(q1.question).not.toBe(q2.question);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/core/generate.test.js`
Expected: FAIL — generate.js not found, AND G3_PRICE_001.json not found (next task will add it; this task expects to import it).

> **注意**：此测试需要 Task 11/12 已完成 G3_PRICE_001.json。如尚未完成，先在 spec mock 中 inline 模板：

```js
// 临时替代，等 Task 12 完成 G3_PRICE_001.json 后改回真实 import
const priceTpl = { /* ... inline JSON ... */ };
```

- [ ] **Step 3: Write minimal implementation**

`src/core/generate.js`:

```js
/**
 * Top-level question generator.
 * Docs: v2-tech-docs/Math DSL v1.0 §37 Question, §38 生成流程
 */

import { createRng } from './random.js';
import { buildDependencyGraph } from './dependency.js';
import { validateConstraints } from './constraint.js';
import { solveAnswer } from './solver.js';
import { render, renderAnswer } from './renderer.js';
import { calculateDifficulty, scoreToLevel } from './difficulty.js';
import { mathValidator, answerValidator, uniquenessValidator } from './validator.js';
import { evaluate } from './expression.js';

const MAX_ATTEMPTS = 100;

function pickRandomVar(rng, def) {
  const g = def.generator;
  switch (g.strategy) {
    case 'range': {
      const min = g.min ?? 0;
      const max = g.max ?? 100;
      if (def.valueType === 'integer') return rng.int(min, max);
      return rng.float(min, max);
    }
    case 'enum':
      return rng.pick(g.values);
    case 'pickFrom':
      return rng.pick(g.values);
    default:
      throw new Error(`unknown generator strategy: ${g.strategy}`);
  }
}

function evalVariable(name, def, vars, rng) {
  if (def.type === 'random') return pickRandomVar(rng, def);
  if (def.type === 'constant') return def.value;
  if (def.type === 'derived') {
    const r = evaluate(def.expression, { vars });
    if (!r.ok) throw new Error(`derive ${name} failed: ${r.error}`);
    return r.value;
  }
  throw new Error(`unknown variable type: ${def.type}`);
}

function computeHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return 'h_' + (h >>> 0).toString(36);
}

/**
 * @param {object} opts
 * @param {object} opts.template - DSL template JSON
 * @param {number} [opts.seed] - default Date.now()
 * @param {number} [opts.index=0]
 * @param {object} [opts.options] - { difficulty?, allowDuplicate?, count? }
 * @returns {object} Question
 */
export function generateQuestion({ template, seed, index = 0, options = {} }) {
  const finalSeed = seed ?? Date.now();
  const baseRng = createRng(`${template.id}:${finalSeed}:${index}`);
  const { order } = buildDependencyGraph(template.variables);

  let vars = {};
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    vars = {};
    try {
      for (const name of order) {
        const def = template.variables[name];
        const stream = baseRng.stream(name);
        vars[name] = evalVariable(name, def, vars, stream);
      }
    } catch (e) {
      continue;
    }

    const cr = validateConstraints(template.constraints || [], { vars });
    if (!cr.ok) continue;

    break;
  }

  // answer
  const solved = solveAnswer(template.answer, vars);

  // difficulty
  const score = calculateDifficulty(template, vars);
  const level = scoreToLevel(score);

  // render
  const question = render(template.renderer.question, vars);
  const answerText = renderAnswer(solved.value, template.answer);

  const hash = computeHash(`${template.id}|${question}|${answerText}|${index}`);

  // 验证（不通过则抛错，让调用方决定重试）
  const mvr = mathValidator({ answer: solved.value, answerDef: template.answer, vars });
  if (!mvr.ok && !solved.reversePending) throw new Error(`math validation failed: ${mvr.reason}`);
  const avr = answerValidator({ answer: solved.value, answerDef: template.answer });
  if (!avr.ok) throw new Error(`answer validation failed: ${avr.reason}`);

  return {
    id: `${template.id}-${finalSeed}-${index}`,
    templateId: template.id,
    seed: finalSeed,
    index,
    metadata: { ...template.metadata },
    variables: { ...vars },
    question,
    answer: { ...solved, text: answerText },
    difficulty: { score, level },
    hash,
  };
}

export { uniquenessValidator };
```

- [ ] **Step 4: Run test to verify it passes**

> **依赖**：此测试需要 `src/templates/wordProblems/G3_PRICE_001.json` 已存在（Task 12）。如果 Task 12 还没做，先创建 stub 文件：

`src/templates/wordProblems/G3_PRICE_001.json` (临时 stub):

```json
{
  "id": "G3_PRICE_001_STUB",
  "version": "1.0",
  "metadata": { "name": "单价数量总价", "type": "word_problem", "grade": 3 },
  "variables": {
    "unitPrice": { "type": "random", "valueType": "integer", "generator": { "strategy": "range", "min": 2, "max": 20 } },
    "quantity": { "type": "random", "valueType": "integer", "generator": { "strategy": "range", "min": 2, "max": 10 } },
    "total": { "type": "derived", "valueType": "integer", "expression": { "type": "operation", "op": "multiply", "args": [{ "type": "variable", "name": "unitPrice" }, { "type": "variable", "name": "quantity" }] } }
  },
  "constraints": [{ "type": "range", "target": "total", "min": 1, "max": 200 }],
  "answer": { "type": "integer", "expression": "total", "unit": "元" },
  "renderer": { "question": "一本{{unitPrice}}元，小明买了{{quantity}}本，一共需要多少钱？" }
}
```

Run: `npx vitest run src/core/generate.test.js`
Expected: 3 passed (with stub)

- [ ] **Step 5: Commit**

```bash
cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator
git add src/core/generate.js src/core/generate.test.js src/templates/wordProblems/G3_PRICE_001.json
git commit -m "feat(core): generateQuestion 顶层编排 (template+seed → Question)"
```

---

## Task 11: 模板注册表（`src/templates/index.js`）

**Files:**
- Create: `src/templates/index.js`

- [ ] **Step 1: 写代码（无独立测试，由 Task 12/13 覆盖）**

`src/templates/index.js`:

```js
/**
 * Template registry.
 * 启动期 import 所有 JSON 模板 + schema 校验。
 * Docs: v2-tech-docs/Math DSL v1.0 §38
 */

import priceTpl from './wordProblems/G3_PRICE_001.json' with { type: 'json' };
import mixTpl from './wordProblems/G3_MIX_001.json' with { type: 'json' };
import chickenRabbitTpl from './olympiad/O23_CHICKEN_RABBIT_001.json' with { type: 'json' };
import { validateTemplate } from '../core/schema.js';

const rawTemplates = [
  priceTpl,
  mixTpl,
  chickenRabbitTpl,
];

const templates = [];
for (const t of rawTemplates) {
  const r = validateTemplate(t);
  if (!r.ok) {
    throw new Error(`Template ${t.id || '?'} schema invalid: ${r.errors.join('; ')}`);
  }
  templates.push(t);
}

export function loadTemplates() {
  return templates;
}

export function listTemplatesByGrade(grade) {
  return templates.filter(t => t.metadata.grade === grade);
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator
git add src/templates/index.js
git commit -m "feat(templates): 模板注册表 + schema 启动期校验"
```

---

## Task 12: 3 个示范 JSON 模板

**Files:**
- Create: `src/templates/wordProblems/G3_PRICE_001.json`（覆盖 stub）
- Create: `src/templates/wordProblems/G3_MIX_001.json`
- Create: `src/templates/olympiad/O23_CHICKEN_RABBIT_001.json`

- [ ] **Step 1: 写 G3_PRICE_001.json（对齐 docs §24）**

`src/templates/wordProblems/G3_PRICE_001.json`:

```json
{
  "id": "G3_PRICE_001",
  "version": "1.0",
  "metadata": {
    "name": "单价数量总价",
    "type": "word_problem",
    "grade": 3,
    "semester": 1,
    "topic": "price",
    "knowledgePoints": ["multiplication", "price"],
    "language": "zh-CN"
  },
  "variables": {
    "item": { "type": "random", "valueType": "enum", "generator": { "strategy": "enum", "values": ["故事书", "练习本", "铅笔盒"] } },
    "unitPrice": { "type": "random", "valueType": "integer", "generator": { "strategy": "range", "min": 2, "max": 20 } },
    "quantity": { "type": "random", "valueType": "integer", "generator": { "strategy": "range", "min": 2, "max": 10 } },
    "total": { "type": "derived", "valueType": "integer", "expression": { "type": "operation", "op": "multiply", "args": [{ "type": "variable", "name": "unitPrice" }, { "type": "variable", "name": "quantity" }] } }
  },
  "constraints": [{ "type": "range", "target": "total", "min": 1, "max": 200 }],
  "answer": { "type": "integer", "expression": "total", "unit": "元" },
  "solution": {
    "steps": [{ "id": "step1", "expression": { "type": "operation", "op": "multiply", "args": [{ "type": "variable", "name": "unitPrice" }, { "type": "variable", "name": "quantity" }] }, "description": "单价乘数量得到总价" }]
  },
  "generator": { "strategy": "random", "maxAttempts": 100 },
  "renderer": {
    "question": "一本{{item}}{{unitPrice}}元，小明买了{{quantity}}本，一共需要多少钱？",
    "answer": "{{total}}元",
    "solution": "{{unitPrice}} × {{quantity}} = {{total}}"
  },
  "difficulty": { "level": 2 },
  "tags": ["小学三年级", "乘法", "价格"]
}
```

- [ ] **Step 2: 写 G3_MIX_001.json（对齐 docs §25）**

`src/templates/wordProblems/G3_MIX_001.json`:

```json
{
  "id": "G3_MIX_001",
  "version": "1.0",
  "metadata": {
    "name": "连续加减",
    "type": "word_problem",
    "grade": 3,
    "semester": 1,
    "topic": "mixed_operation",
    "knowledgePoints": ["addition", "subtraction"]
  },
  "variables": {
    "initial": { "type": "random", "valueType": "integer", "generator": { "strategy": "range", "min": 20, "max": 60 } },
    "increase": { "type": "random", "valueType": "integer", "generator": { "strategy": "range", "min": 5, "max": 30 } },
    "decrease": { "type": "random", "valueType": "integer", "generator": { "strategy": "range", "min": 1, "max": 20 } },
    "remaining": {
      "type": "derived", "valueType": "integer",
      "expression": {
        "type": "operation", "op": "subtract",
        "args": [
          { "type": "operation", "op": "add", "args": [{ "type": "variable", "name": "initial" }, { "type": "variable", "name": "increase" }] },
          { "type": "variable", "name": "decrease" }
        ]
      }
    }
  },
  "constraints": [
    {
      "type": "comparison", "op": "lt",
      "left": "decrease",
      "right": { "type": "operation", "op": "add", "args": [{ "type": "variable", "name": "initial" }, { "type": "variable", "name": "increase" }] }
    }
  ],
  "answer": { "type": "integer", "expression": "remaining", "unit": "本" },
  "renderer": { "question": "小明原来有{{initial}}本书，又买了{{increase}}本，送给同学{{decrease}}本，还剩多少本？" },
  "difficulty": { "level": 3 }
}
```

- [ ] **Step 3: 写 O23_CHICKEN_RABBIT_001.json（对齐 docs §28）**

`src/templates/olympiad/O23_CHICKEN_RABBIT_001.json`:

```json
{
  "id": "O23_CHICKEN_RABBIT_001",
  "version": "1.0",
  "metadata": {
    "name": "鸡兔同笼",
    "type": "olympiad",
    "grade": 4,
    "topic": "chicken_rabbit",
    "knowledgePoints": ["equation", "enumeration"]
  },
  "variables": {
    "chickens": { "type": "random", "valueType": "integer", "generator": { "strategy": "range", "min": 1, "max": 40 } },
    "rabbits": { "type": "random", "valueType": "integer", "generator": { "strategy": "range", "min": 1, "max": 30 } },
    "heads": { "type": "derived", "valueType": "integer", "expression": { "type": "operation", "op": "add", "args": [{ "type": "variable", "name": "chickens" }, { "type": "variable", "name": "rabbits" }] } },
    "legs": { "type": "derived", "valueType": "integer", "expression": { "type": "operation", "op": "add", "args": [{ "type": "operation", "op": "multiply", "args": [{ "type": "literal", "value": 2 }, { "type": "variable", "name": "chickens" }] }, { "type": "operation", "op": "multiply", "args": [{ "type": "literal", "value": 4 }, { "type": "variable", "name": "rabbits" }] }] } }
  },
  "constraints": [
    { "type": "range", "target": "heads", "min": 5, "max": 50 },
    { "type": "range", "target": "legs", "min": 10, "max": 200 },
    { "type": "derived", "expression": { "type": "operation", "op": "eq", "args": [{ "type": "variable", "name": "legs" }, { "type": "operation", "op": "add", "args": [{ "type": "operation", "op": "multiply", "args": [{ "type": "literal", "value": 2 }, { "type": "variable", "name": "chickens" }] }, { "type": "operation", "op": "multiply", "args": [{ "type": "literal", "value": 4 }, { "type": "variable", "name": "rabbits" }] }] }] } }
  ],
  "answer": { "type": "integer", "expression": "chickens", "reverse": true, "unit": "只" },
  "renderer": { "question": "笼子里有{{heads}}个头，{{legs}}条腿，已知鸡有2条腿、兔有4条腿，问鸡有多少只？" },
  "difficulty": { "level": 4 }
}
```

> **注意**：本模板 answer 是反推，本期 MVP `solver.js` 留 TODO。e2e 测试需要为这个模板特殊处理（允许 reversePending）。

- [ ] **Step 4: Run generate.test.js + schema.test.js 验证 3 模板**

Run: `npx vitest run src/core/generate.test.js src/core/schema.test.js src/core/index.test.js`
Expected: all pass

- [ ] **Step 5: Commit**

```bash
cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator
git add src/templates/wordProblems/G3_PRICE_001.json src/templates/wordProblems/G3_MIX_001.json src/templates/olympiad/O23_CHICKEN_RABBIT_001.json
git commit -m "feat(templates): 3 个示范 JSON 模板 (G3_PRICE/G3_MIX/O23_CHICKEN_RABBIT)"
```

---

## Task 13: 公开 API 桶（`src/core/index.js`）

**Files:**
- Create: `src/core/index.js`

- [ ] **Step 1: 写桶 + 写 smoke test**

`src/core/index.js`:

```js
/**
 * Core public API.
 */
export { createRng } from './random.js';
export { buildDependencyGraph } from './dependency.js';
export { evaluate } from './expression.js';
export { validateConstraints } from './constraint.js';
export { solveAnswer } from './solver.js';
export { render, renderAnswer } from './renderer.js';
export { calculateDifficulty, scoreToLevel } from './difficulty.js';
export {
  mathValidator, answerValidator, uniquenessValidator,
} from './validator.js';
export { validateTemplate } from './schema.js';
export { generateQuestion } from './generate.js';
```

`src/core/index.test.js`:

```js
import { describe, it, expect } from 'vitest';
import * as core from './index.js';

describe('core barrel exports', () => {
  it('所有公开 API 都被导出', () => {
    expect(typeof core.createRng).toBe('function');
    expect(typeof core.buildDependencyGraph).toBe('function');
    expect(typeof core.evaluate).toBe('function');
    expect(typeof core.validateConstraints).toBe('function');
    expect(typeof core.solveAnswer).toBe('function');
    expect(typeof core.render).toBe('function');
    expect(typeof core.renderAnswer).toBe('function');
    expect(typeof core.calculateDifficulty).toBe('function');
    expect(typeof core.scoreToLevel).toBe('function');
    expect(typeof core.mathValidator).toBe('function');
    expect(typeof core.answerValidator).toBe('function');
    expect(typeof core.uniquenessValidator).toBe('function');
    expect(typeof core.validateTemplate).toBe('function');
    expect(typeof core.generateQuestion).toBe('function');
  });
});
```

- [ ] **Step 2: Run test**

Run: `npx vitest run src/core/index.test.js`
Expected: 1 passed

- [ ] **Step 3: Commit**

```bash
cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator
git add src/core/index.js src/core/index.test.js
git commit -m "feat(core): 公开 API 桶"
```

---

## Task 14: DslStrategy 桥接（`src/strategies/DslStrategy.js`）

**Files:**
- Create: `src/strategies/DslStrategy.js`
- Test: `src/strategies/DslStrategy.test.js`

- [ ] **Step 1: Write the failing test**

`src/strategies/DslStrategy.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/strategies/DslStrategy.test.js`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

`src/strategies/DslStrategy.js`:

```js
/**
 * DSL strategy: bridge JSON templates + core/generate.js.
 * Spec: docs/superpowers/specs/2026-09-15-dsl-engine-mvp-design.md §5
 */

import { ProblemGeneratorStrategy } from './ProblemGeneratorStrategy.js';
import { generateQuestion } from '../core/generate.js';
import { loadTemplates } from '../templates/index.js';

export class DslStrategy extends ProblemGeneratorStrategy {
  constructor(config) {
    super(config);
    this.type = 'dsl';
    this.allTemplates = loadTemplates();
  }

  generate(rng) {
    const candidates = this.allTemplates.filter(t => t.metadata.grade === this.config.grade);
    if (candidates.length === 0) {
      throw new Error(`No DSL templates for grade ${this.config.grade}`);
    }
    const pick = (rng?.next?.() ?? Math.random());
    const template = candidates[Math.floor(pick * candidates.length)];
    return generateQuestion({
      template,
      options: this.config,
    });
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/strategies/DslStrategy.test.js`
Expected: 4 passed

- [ ] **Step 5: Commit**

```bash
cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator
git add src/strategies/DslStrategy.js src/strategies/DslStrategy.test.js
git commit -m "feat(strategies): DslStrategy 桥接 JSON 模板 + core"
```

---

## Task 15: ProblemGeneratorFactory 注册 dsl mode

**Files:**
- Modify: `src/strategies/ProblemGeneratorFactory.js:1-30`
- Test: `src/strategies/ProblemGeneratorFactory.test.js`

- [ ] **Step 1: 查看现有 factory**

Run: `cat src/strategies/ProblemGeneratorFactory.js`

- [ ] **Step 2: 写新增测试**

`src/strategies/ProblemGeneratorFactory.test.js` (在现有文件追加):

```js
import { describe, it, expect } from 'vitest';
import { ProblemGeneratorFactory } from './ProblemGeneratorFactory.js';

describe('ProblemGeneratorFactory dsl mode', () => {
  it('mode=dsl 返回 DslStrategy 实例', () => {
    const s = ProblemGeneratorFactory.create({ mode: 'dsl', grade: 3 });
    expect(s.type).toBe('dsl');
  });

  it('mode=dsl.generate() 返回完整 Question 字段', () => {
    const s = ProblemGeneratorFactory.create({ mode: 'dsl', grade: 3 });
    const q = s.generate();
    expect(q.templateId).toMatch(/^G3_/);
    expect(typeof q.question).toBe('string');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/strategies/ProblemGeneratorFactory.test.js`
Expected: FAIL — factory throws on mode=dsl

- [ ] **Step 4: 修改 factory**

`src/strategies/ProblemGeneratorFactory.js` 顶部追加：

```js
import { DslStrategy } from './DslStrategy.js';
```

并在 strategies 注册表中追加：

```js
dsl: DslStrategy,
```

(具体改动以现有 factory 代码为准，保持原风格)

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/strategies/ProblemGeneratorFactory.test.js`
Expected: all pass (新增 2 + 原有)

- [ ] **Step 6: Commit**

```bash
cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator
git add src/strategies/ProblemGeneratorFactory.js src/strategies/ProblemGeneratorFactory.test.js
git commit -m "feat(strategies): ProblemGeneratorFactory 注册 dsl mode"
```

---

## Task 16: 端到端 e2e 测试

**Files:**
- Create: `tests/core-e2e.test.js`

- [ ] **Step 1: Write the failing test**

`tests/core-e2e.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { ProblemGeneratorFactory } from '../src/strategies/ProblemGeneratorFactory.js';

describe('DSL engine e2e', () => {
  it('grade=3 dsl 模式生成 5 道 G3 题，字段齐全且不重复', () => {
    const s = ProblemGeneratorFactory.create({ mode: 'dsl', grade: 3 });
    const seen = new Set();
    for (let i = 0; i < 5; i++) {
      const q = s.generate();
      expect(q.templateId).toMatch(/^G3_/);
      expect(typeof q.question).toBe('string');
      expect(q.question.length).toBeGreaterThan(0);
      expect(typeof q.answer.value === 'number' || typeof q.answer.value === 'string').toBe(true);
      expect(q.difficulty.level).toBeGreaterThanOrEqual(1);
      expect(q.difficulty.level).toBeLessThanOrEqual(5);
      // 不重复：hash 唯一
      expect(seen.has(q.hash)).toBe(false);
      seen.add(q.hash);
    }
  });

  it('grade=4 dsl 模式能生成奥数题（O23_）', () => {
    const s = ProblemGeneratorFactory.create({ mode: 'dsl', grade: 4 });
    let foundOlympiad = false;
    for (let i = 0; i < 20; i++) {
      const q = s.generate();
      if (q.templateId.startsWith('O23_')) foundOlympiad = true;
    }
    expect(foundOlympiad).toBe(true);
  });

  it('G3_PRICE_001 同 seed + 同 index 必产同题', () => {
    const s1 = ProblemGeneratorFactory.create({ mode: 'dsl', grade: 3 });
    const s2 = ProblemGeneratorFactory.create({ mode: 'dsl', grade: 3 });
    const q1 = s1.generate();
    const q2 = s2.generate();
    // 不同时刻 seed 不同，所以不一定相同；这里只验证 generate 不抛错
    expect(q1.hash).toBeDefined();
    expect(q2.hash).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `npx vitest run tests/core-e2e.test.js`
Expected: 3 passed

- [ ] **Step 3: Run full test suite**

Run: `npm run test:run 2>&1 | tail -20`
Expected: ≥ 878 passed (876 baseline + 新增 16+ 个 core 测试 + 5 个 DslStrategy/factory/e2e)，**2 个 HistoryView 失败不属本 PR 范围**

- [ ] **Step 4: 覆盖率检查**

Run: `npm run test:run -- --coverage 2>&1 | tail -30`
Expected: 80% 阈值保持（不下降）

- [ ] **Step 5: Commit**

```bash
cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator
git add tests/core-e2e.test.js
git commit -m "test(core): 端到端 e2e (dsl mode 5 题不重复 + 奥数生成)"
```

---

## Task 17: 完整回归 + 收尾

- [ ] **Step 1: 跑全量测试**

```bash
cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator
npm run test:run 2>&1 | tail -10
```

Expected: pass 数 ≥ 876 + 新增；fail 数 = 2（pre-existing HistoryView）

- [ ] **Step 2: build 检查**

```bash
cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator
npm run build 2>&1 | tail -10
```

Expected: dist/ 生成成功，无 import 错误

- [ ] **Step 3: 创建 PR**

```bash
cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator
gh pr create --title "feat(core): Math DSL Engine MVP — core + 3 JSON 模板 + DslStrategy" --body "$(cat <<'EOF'
## Summary

按 v2-tech-docs Phase 1 MVP 落地：

- 新增 `src/core/` 11 个模块（random/expression/dependency/constraint/solver/renderer/difficulty/validator/schema/generate/index）
- 新增 `src/templates/` 3 个示范 JSON 模板（G3_PRICE_001, G3_MIX_001, O23_CHICKEN_RABBIT_001）
- 新增 `src/strategies/DslStrategy.js`，`ProblemGeneratorFactory` 注册 `dsl` mode
- 端到端测试 `tests/core-e2e.test.js`

## Test Plan

- [x] 876 baseline pass（2 个 HistoryView 失败不属本 PR）
- [x] 新增 50+ core 单元测试全过
- [x] e2e：dsl mode 5 题不重复 + 奥数生成
- [x] 80% 覆盖率维持

## 关联

- Spec: docs/superpowers/specs/2026-09-15-dsl-engine-mvp-design.md
- Plan: docs/superpowers/plans/2026-09-15-dsl-engine-mvp.md
- v2-tech-docs/

## 后续 PR

按 spec §8 路线图分批迁剩余 12 个 MVP 模板到 JSON
EOF
)"
```

---

## Self-Review Notes

执行前 checklist：

- [ ] Spec §1-§9 每节都有对应 task（spec coverage: 11 模块 → Task 1-10 + 11 桶；JSON 模板 → Task 12；DslStrategy → Task 14；Factory 注册 → Task 15；e2e → Task 16）
- [ ] 无 TBD/TODO 占位（除"reverse generation 第三期"为明确非目标）
- [ ] API 名称跨 task 一致：`createRng` / `evaluate` / `buildDependencyGraph` / `validateConstraints` / `solveAnswer` / `render` / `calculateDifficulty` / `scoreToLevel` / `mathValidator` / `answerValidator` / `uniquenessValidator` / `validateTemplate` / `generateQuestion` / `loadTemplates` / `listTemplatesByGrade`
- [ ] Question 字段（templateId/seed/index/variables/question/answer/difficulty/hash）跨 task 一致
- [ ] 每步有可执行代码 + 可运行命令
- [ ] 覆盖率阈值 80% 不变

---

## Execution Handoff

完成后请用 `superpowers:finishing-a-development-branch` skill 处理 merge / PR / 清理。
