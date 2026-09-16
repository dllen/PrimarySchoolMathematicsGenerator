# Reverse Generation Hybrid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 落地 v2-tech-docs 三件套中"逆向生成"在 MVP 阶段的基础设施——让 `answer.reverse=true` 真正生效，schema 接受 `strategy='reverse'` / `role='target'`，并通过新模块 `src/core/reverse.js` 为 Phase 3 的 Solver 实现铺好接口。

**Architecture:** `solver.js` 简化（删 `reversePending`，按 vars 取值）；`schema.js` 加 4 条校验规则；`dependency.js` 新增 `reverseTopologicalOrder`（target-first）；新文件 `src/core/reverse.js` 暴露 `ReverseStrategy` 接口与默认 stub（抛 Phase 3）；`generate.js` 增加 reverse 分支（stub 抛错时降级到 forward，保鸡兔同笼 MVP）；`index.js` 导出新 API。

**Tech Stack:** Vue 3 + Vite, Vitest + jsdom + fake-indexeddb, Dexie, ESM, **无新依赖**。

**Spec:** `docs/superpowers/specs/2026-09-15-reverse-generation-hybrid-design.md` (commits `46e72f5` + `dc71c7a`)

---

## File Structure

| 路径 | 角色 | 改动类型 |
|---|---|---|
| `src/core/schema.js` | 接受 `strategy='reverse'` 与 `role='target'`，加 4 条 fail-loud 校验 | 改 |
| `src/core/schema.test.js` | 6 个新 reverse-validation cases + 保留旧 cases | 改 |
| `src/core/dependency.js` | 新增 `reverseTopologicalOrder(variables)`，不动 `buildDependencyGraph` | 改 |
| `src/core/dependency.test.js` | 5 个新 reverse-topo cases + 保留旧 cases | 改 |
| `src/core/reverse.js` | `ReverseStrategy` 接口 + `defaultReverseStrategy` stub + `reverseStrategies` registry | 新建 |
| `src/core/reverse.test.js` | 3 个 stub interface cases | 新建 |
| `src/core/solver.js` | 删 `reversePending` 分支 + JSDoc + 注释刷新；`reverse=true` 时返回 `vars[name]` | 改 |
| `src/core/solver.test.js` | 替换 `reversePending` 测试 + 加 throw-on-missing | 改 |
| `src/core/generate.js` | 删 `reversePending` 绕过分支；新增 `template.generator.strategy==='reverse'` 路由 + 降级 | 改 |
| `src/core/generate.test.js` | 2 个 reverse fallback cases + 保留旧 cases | 改 |
| `src/core/index.js` | 导出 `reverseTopologicalOrder` / `defaultReverseStrategy` / `reverseStrategies` | 改 |
| `src/core/index.test.js` | 1 个新导出 case | 改 |
| `tests/core-e2e.test.js` | 鸡兔同笼 10 题 e2e（answer.value 整数 + 约束满足 + 无 reversePending） | 改 |

不动的路径：`src/templates/olympiad/O23_CHICKEN_RABBIT_001.json`（已有 `answer.reverse=true`，无需改）、`src/templates/wordProblems/*.json`、`src/templates/index.js`、`src/strategies/*`、`src/problemTemplates/*`、`src/views/*`、`src/components/*`、`src/db.js`、`src/composables/*`、`vitest.config.js`、`package.json`。

**TDD 顺序**：每个 task 先写测试（FAIL）→ 写实现（PASS）→ commit。

---

## Task 1: Schema — write failing tests for reverse-validation rules

**Files:**
- Modify: `src/core/schema.test.js` (append new describe block)

- [ ] **Step 1: Append the new test block**

Open `src/core/schema.test.js`. Find the last `});` at end-of-file and insert the following block **before** it (preserve existing tests):

```js
describe('reverse strategy validation', () => {
  const baseReverseTpl = {
    id: 'REVERSE_OK',
    metadata: { name: 'reverse ok', type: 'olympiad', grade: 4 },
    variables: {
      target: { type: 'random', valueType: 'integer', role: 'target',
                 generator: { strategy: 'range', min: 1, max: 10 } },
      x: { type: 'random', valueType: 'integer',
           generator: { strategy: 'range', min: 1, max: 10 } },
    },
    answer: { type: 'integer', expression: { type: 'variable', name: 'target' } },
    renderer: { question: '?' },
    generator: { strategy: 'reverse' },
  };

  it('should accept valid template with strategy=reverse + role=target', () => {
    const r = validateTemplate(baseReverseTpl);
    expect(r.ok).toBe(true);
  });

  it('should reject strategy=reverse without any role=target variable', () => {
    const tpl = { ...baseReverseTpl,
                  variables: { x: baseReverseTpl.variables.x },
                  generator: { strategy: 'reverse' } };
    const r = validateTemplate(tpl);
    expect(r.ok).toBe(false);
    expect(r.errors.join(' ')).toMatch(/role='target'/);
  });

  it('should reject role=target on derived variable', () => {
    const tpl = { ...baseReverseTpl,
                  variables: {
                    target: { type: 'derived', valueType: 'integer', role: 'target',
                              expression: { type: 'literal', value: 5 } },
                    x: baseReverseTpl.variables.x,
                  } };
    const r = validateTemplate(tpl);
    expect(r.ok).toBe(false);
    expect(r.errors.join(' ')).toMatch(/type='random'/);
  });

  it('should reject role=target without generator', () => {
    const tpl = { ...baseReverseTpl,
                  variables: {
                    target: { type: 'random', valueType: 'integer', role: 'target' },
                    x: baseReverseTpl.variables.x,
                  } };
    const r = validateTemplate(tpl);
    expect(r.ok).toBe(false);
    expect(r.errors.join(' ')).toMatch(/generator/);
  });

  it('should reject multiple role=target variables', () => {
    const tpl = { ...baseReverseTpl,
                  variables: {
                    t1: { type: 'random', valueType: 'integer', role: 'target',
                          generator: { strategy: 'range', min: 1, max: 5 } },
                    t2: { type: 'random', valueType: 'integer', role: 'target',
                          generator: { strategy: 'range', min: 1, max: 5 } },
                  } };
    const r = validateTemplate(tpl);
    expect(r.ok).toBe(false);
    expect(r.errors.join(' ')).toMatch(/multiple role='target'/);
  });

  it('should still accept existing forward templates (regression)', () => {
    const tpl = {
      id: 'FWD', metadata: { name: 'forward', type: 'word_problem', grade: 3 },
      variables: {
        a: { type: 'random', valueType: 'integer',
             generator: { strategy: 'range', min: 1, max: 10 } },
        b: { type: 'random', valueType: 'integer',
             generator: { strategy: 'range', min: 1, max: 10 } },
      },
      answer: { type: 'integer', expression: { type: 'variable', name: 'a' } },
      renderer: { question: '?' },
    };
    const r = validateTemplate(tpl);
    expect(r.ok).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests — confirm new ones FAIL**

Run: `cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator && npx vitest run src/core/schema.test.js`
Expected: existing tests PASS, the new `reverse strategy validation` block has at least one FAIL (likely "should accept valid template" because schema doesn't yet accept `strategy: 'reverse'`).

- [ ] **Step 3: Commit (TDD red)**

```bash
cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator
git add src/core/schema.test.js
git commit -m "test(core): schema accepts strategy=reverse + role=target with validation rules"
```

---

## Task 2: Schema — implement the 4 validation rules

**Files:**
- Modify: `src/core/schema.js`

- [ ] **Step 1: Add reverse-validation inside `validateTemplate`**

Open `src/core/schema.js`. After the existing variable loop (around the `for (const [name, def] of Object.entries(t.variables))` block), add **at the same indentation level** (before the `}` that closes the variables block):

```js
    // Reverse strategy validation (added 2026-09-15)
    let hasTarget = false;
    for (const [name, def] of Object.entries(t.variables)) {
      if (def.role !== 'target') continue;
      hasTarget = true;
      if (def.type !== 'random') {
        errors.push(`variable ${name}: role='target' requires type='random'`);
      }
      if (!def.generator || !def.generator.strategy) {
        errors.push(`role='target' variable ${name} needs generator`);
      }
    }
    if (hasTarget) {
      const targetCount = Object.values(t.variables).filter(d => d.role === 'target').length;
      if (targetCount > 1) {
        errors.push(`multiple role='target' variables not supported`);
      }
    }
    if (t.generator?.strategy === 'reverse' && !hasTarget) {
      errors.push(`reverse strategy requires at least one role='target' variable`);
    }
```

Also update the file header docstring (top of file) from:

```js
/**
 * JSON template schema validator (runtime).
 * Docs: v2-tech-docs/Math DSL v1.0 §2 顶层结构
 */
```

to:

```js
/**
 * JSON template schema validator (runtime).
 * Docs: v2-tech-docs/Math DSL v1.0 §2 顶层结构;
 *       v2-tech-docs/Math DSL v1.1 §44 (GenerationRole / role='target')
 */
```

- [ ] **Step 2: Run tests — confirm all PASS**

Run: `cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator && npx vitest run src/core/schema.test.js`
Expected: all green, including the 6 new reverse-validation cases.

- [ ] **Step 3: Run full core suite — confirm no regression**

Run: `cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator && npx vitest run src/core/`
Expected: all green.

- [ ] **Step 4: Commit**

```bash
cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator
git add src/core/schema.js src/core/schema.test.js
git commit -m "feat(core): schema validation for reverse strategy + target role"
```

---

## Task 3: Dependency — write failing tests for `reverseTopologicalOrder`

**Files:**
- Modify: `src/core/dependency.test.js` (append new describe block)

- [ ] **Step 1: Append the new test block**

Open `src/core/dependency.test.js`. Before the final closing `});` of the file, append:

```js
import { reverseTopologicalOrder } from './dependency.js';

describe('reverseTopologicalOrder', () => {
  it('should place role=target variables first', () => {
    const vars = {
      target: { type: 'random', valueType: 'integer', role: 'target',
                generator: { strategy: 'range', min: 1, max: 5 } },
      x: { type: 'derived', valueType: 'integer',
           expression: { type: 'variable', name: 'target' } },
    };
    const order = reverseTopologicalOrder(vars);
    expect(order.indexOf('target')).toBeLessThan(order.indexOf('x'));
  });

  it('should preserve topo within non-target subgraph', () => {
    const vars = {
      target: { type: 'random', valueType: 'integer', role: 'target',
                generator: { strategy: 'range', min: 1, max: 5 } },
      a: { type: 'random', valueType: 'integer',
           generator: { strategy: 'range', min: 1, max: 5 } },
      b: { type: 'derived', valueType: 'integer',
           expression: { type: 'variable', name: 'a' } },
    };
    const order = reverseTopologicalOrder(vars);
    expect(order.indexOf('a')).toBeLessThan(order.indexOf('b'));
    expect(order.indexOf('target')).toBe(0);
  });

  it('should put lone target with no deps first', () => {
    const vars = {
      target: { type: 'random', valueType: 'integer', role: 'target',
                generator: { strategy: 'range', min: 1, max: 5 } },
    };
    const order = reverseTopologicalOrder(vars);
    expect(order).toEqual(['target']);
  });

  it('should throw on cycle involving target', () => {
    const vars = {
      target: { type: 'derived', valueType: 'integer', role: 'target',
                expression: { type: 'variable', name: 'loop' } },
      loop: { type: 'derived', valueType: 'integer',
              expression: { type: 'variable', name: 'target' } },
    };
    expect(() => reverseTopologicalOrder(vars)).toThrow(/cycle/i);
  });

  it('should not change order when no role=target present (forward-only)', () => {
    const vars = {
      a: { type: 'random', valueType: 'integer',
           generator: { strategy: 'range', min: 1, max: 5 } },
      b: { type: 'derived', valueType: 'integer',
           expression: { type: 'variable', name: 'a' } },
    };
    const order = reverseTopologicalOrder(vars);
    expect(order.indexOf('a')).toBeLessThan(order.indexOf('b'));
  });
});
```

- [ ] **Step 2: Run tests — confirm new ones FAIL**

Run: `cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator && npx vitest run src/core/dependency.test.js`
Expected: existing tests PASS, new `reverseTopologicalOrder` block FAILs (module not exported yet).

- [ ] **Step 3: Commit (TDD red)**

```bash
cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator
git add src/core/dependency.test.js
git commit -m "test(core): reverseTopologicalOrder places role=target first"
```

---

## Task 4: Dependency — implement `reverseTopologicalOrder`

**Files:**
- Modify: `src/core/dependency.js`

- [ ] **Step 1: Add `reverseTopologicalOrder` export**

Open `src/core/dependency.js`. Find the very last line (end of `buildDependencyGraph`) and append at end of file:

```js
/**
 * Topological order with role='target' variables placed first.
 * Useful for reverse-generation flow (target-first). Cycle detection still
 * uses the same DAG invariant as buildDependencyGraph.
 *
 * @param {Record<string, any>} variables - template.variables
 * @returns {string[]} variable names in evaluation order
 */
export function reverseTopologicalOrder(variables) {
  // Reuse the existing forward topo (proves DAG, raises on cycle).
  const { order: forwardOrder } = buildDependencyGraph(variables);

  const targets = [];
  const others = [];
  for (const name of forwardOrder) {
    if (variables[name]?.role === 'target') targets.push(name);
    else others.push(name);
  }
  return [...targets, ...others];
}
```

Also update the file header docstring from:

```js
/**
 * Variable dependency graph + topological order + cycle detection.
 * Docs: v2-tech-docs/Math DSL v1.1 §12-21
 * Accepts both envelope ({ type: 'operation', op, args }) and
 * shorthand ({ op, args }) expression forms per DSL docs §9/§24.
 */
```

to (add the new export to the documented surface):

```js
/**
 * Variable dependency graph + topological order + cycle detection +
 * reverseTopologicalOrder (target-first order).
 * Docs: v2-tech-docs/Math DSL v1.1 §12-21, §44-45
 * Accepts both envelope ({ type: 'operation', op, args }) and
 * shorthand ({ op, args }) expression forms per DSL docs §9/§24.
 */
```

- [ ] **Step 2: Run tests — confirm all PASS**

Run: `cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator && npx vitest run src/core/dependency.test.js`
Expected: all green, including 5 new reverse-topo cases.

- [ ] **Step 3: Run full core suite — confirm no regression**

Run: `cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator && npx vitest run src/core/`
Expected: all green.

- [ ] **Step 4: Commit**

```bash
cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator
git add src/core/dependency.js src/core/dependency.test.js
git commit -m "feat(core): reverseTopologicalOrder in dependency.js"
```

---

## Task 5: Reverse — create `src/core/reverse.js` (ReverseStrategy interface + default stub)

**Files:**
- Create: `src/core/reverse.js`
- Create: `src/core/reverse.test.js`

- [ ] **Step 1: Write the failing test FIRST**

Create `src/core/reverse.test.js` with content:

```js
import { describe, it, expect } from 'vitest';
import { defaultReverseStrategy, reverseStrategies } from './reverse.js';

describe('defaultReverseStrategy', () => {
  it('should have name "default"', () => {
    expect(defaultReverseStrategy.name).toBe('default');
  });

  it('should be registered in reverseStrategies under key "default"', () => {
    expect(reverseStrategies.default).toBe(defaultReverseStrategy);
  });

  it('should throw Phase 3 message when solve() is called', () => {
    expect(() => defaultReverseStrategy.solve({}, {})).toThrow(/Phase 3/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator && npx vitest run src/core/reverse.test.js`
Expected: FAIL — "Cannot find module './reverse.js'"

- [ ] **Step 3: Create `src/core/reverse.js`**

```js
/**
 * Reverse generation strategy registry.
 * Docs: v2-tech-docs/Math DSL v1.0 §19 (Reverse Generator),
 *       v2-tech-docs/Math DSL v1.1 §44-45 (Reverse Variable / Solving Direction),
 *       v2-tech-docs/小学数学题智能生成引擎-技术方案.md §7, §26
 *
 * The default stub throws because true target-first reverse generation with
 * constraint solving is Phase 3 (per 技术方案 §26). Phase 3 contributor
 * implements `defaultReverseStrategy.solve(template, rng)` to fill in
 * linear-equation / Diophantine solver for olympiad templates.
 */

/**
 * @typedef {object} ReverseStrategy
 * @property {string} name
 * @property {(template: object, rng: object) => Record<string, any>} solve
 *   - Given a DSL template and a SeedableRNG, return a fully-populated vars map.
 *   - Throws if reverse generation cannot proceed.
 */

/** @type {ReverseStrategy} */
export const defaultReverseStrategy = {
  name: 'default',
  solve(template, rng) {
    throw new Error(
      '[reverse] Phase 3 required: implement ReverseStrategy.solve. ' +
      'See docs/superpowers/specs/2026-09-15-reverse-generation-hybrid-design.md §3'
    );
  },
};

/** @type {Record<string, ReverseStrategy>} */
export const reverseStrategies = {
  default: defaultReverseStrategy,
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator && npx vitest run src/core/reverse.test.js`
Expected: PASS (3 cases).

- [ ] **Step 5: Run full core suite — confirm no regression**

Run: `cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator && npx vitest run src/core/`
Expected: all green.

- [ ] **Step 6: Commit**

```bash
cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator
git add src/core/reverse.js src/core/reverse.test.js
git commit -m "feat(core): reverse.js — ReverseStrategy interface + default stub"
```

---

## Task 6: Solver — replace `reversePending` test with real-value assertion

**Files:**
- Modify: `src/core/solver.test.js`

- [ ] **Step 1: Replace the failing test**

Open `src/core/solver.test.js`. Find the test named `'鸡兔同笼反推留 TODO（reverse generation）'` (currently asserts `reversePending === true`). Replace it with:

```js
it('should return vars[name] when answer.reverse is true and variable exists', () => {
  const def = { type: 'integer', expression: { type: 'variable', name: 'chickens' }, reverse: true };
  const r = solveAnswer(def, { chickens: 23, rabbits: 12, heads: 35, legs: 94 });
  expect(r.ok).toBe(true);
  expect(r.value).toBe(23);
  expect(r.type).toBe('integer');
  expect(r.reversePending).toBeUndefined();
});

it('should throw when reverse answer references ungenerated variable', () => {
  const def = { type: 'integer', expression: { type: 'variable', name: 'ghosts' }, reverse: true };
  expect(() => solveAnswer(def, { chickens: 5 })).toThrow(/ungenerated variable.*ghosts/);
});
```

- [ ] **Step 2: Run test — confirm FAIL**

Run: `cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator && npx vitest run src/core/solver.test.js`
Expected: FAIL — current `solveAnswer` still returns `{ ok: true, reversePending: true, ... }` instead of the real value.

- [ ] **Step 3: Commit (TDD red)**

```bash
cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator
git add src/core/solver.test.js
git commit -m "test(core): solver returns vars[name] when answer.reverse=true (replaces reversePending)"
```

---

## Task 7: Solver — implement real-value return + throw-on-missing + refresh docstring

**Files:**
- Modify: `src/core/solver.js`

- [ ] **Step 1: Replace the entire `solver.js` content**

Open `src/core/solver.js`. Replace the entire file with:

```js
/**
 * Solver.
 * Docs: v2-tech-docs/Math DSL v1.0 §20-21, §38;
 *       v2-tech-docs/Math DSL v1.1 §9, §44-45 (Reverse Variable)
 *
 * Two responsibilities:
 *   1. Reverse answer: when `answer.reverse === true`, the answer value
 *      IS the named variable in vars. Return it directly.
 *   2. Forward answer: evaluate `answer.expression` against vars.
 */

import { evaluate } from './expression.js';

/**
 * @param {object} answerDef - DSL answer definition
 * @param {Record<string, any>} vars - already-evaluated variables
 * @returns {{ ok: boolean, value?: any, type?: string, error?: string }}
 * @throws when reverse answer references a variable not present in vars
 */
export function solveAnswer(answerDef, vars) {
  if (answerDef.reverse) {
    // Reverse: variable must already exist in vars. Schema enforces
    // role='target' as a random variable, generated upstream.
    if (answerDef.expression?.type === 'variable' && typeof answerDef.expression.name === 'string') {
      const name = answerDef.expression.name;
      if (!(name in vars)) {
        throw new Error(
          `reverse answer references ungenerated variable: ${name}`
        );
      }
      return { ok: true, value: vars[name], type: answerDef.type };
    }
    // Defensive: reverse=true without a variable-node expression is a template bug.
    throw new Error(
      `reverse answer requires expression of type 'variable' (got ${JSON.stringify(answerDef.expression)})`
    );
  }

  // Forward: evaluate the expression.
  const r = evaluate(answerDef.expression, { vars });
  if (!r.ok) return { ok: false, error: r.error };
  return { ok: true, value: r.value, type: answerDef.type };
}
```

- [ ] **Step 2: Run solver tests — confirm PASS**

Run: `cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator && npx vitest run src/core/solver.test.js`
Expected: all green (3 cases: 2 forward + 1 reverse real-value + 1 throw-on-missing = 4 cases total).

- [ ] **Step 3: Run full core suite — confirm no regression**

Run: `cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator && npx vitest run src/core/`
Expected: `generate.test.js` may FAIL at the chicken-rabbit case because `generate.js` still has the `reversePending` bypass branch. Expected failure mode: validation now triggers and either passes (because `vars.chickens` is set) or the existing `generate.js` math/answer validation surfaces a mismatch. Read the failure; if it's the expected `math validation failed` because `solved.value` is now `vars.chickens` but the existing `generate.js` code still uses `solved.reversePending` as a bypass — proceed to Task 8 (the bypass removal is Task 8's job).

- [ ] **Step 4: Commit**

```bash
cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator
git add src/core/solver.js src/core/solver.test.js
git commit -m "fix(core): solver returns real answer when reverse=true (drops reversePending + refresh docstring)"
```

---

## Task 8: Generate — write failing tests for reverse-fallback behavior

**Files:**
- Modify: `src/core/generate.test.js`

- [ ] **Step 1: Append the new test block**

Open `src/core/generate.test.js`. Find the existing imports and the closing `});` of the file. **Append** (do not modify existing tests) before the final `});`:

```js
import chickenRabbitTpl from '../templates/olympiad/O23_CHICKEN_RABBIT_001.json' with { type: 'json' };

describe('generateQuestion reverse strategy', () => {
  it('should log warn and fall through to forward when reverse stub throws', () => {
    const tpl = { ...chickenRabbitTpl, generator: { strategy: 'reverse' } };
    const q = generateQuestion({ template: tpl, seed: 1 });
    expect(q.answer.value).toBeDefined();
    expect(typeof q.answer.value).toBe('number');
  });

  it('should use returned vars when reverse stub returns vars (Phase 3 path simulation)', async () => {
    // We can't easily mock ES module exports from a Vitest unit, so we
    // verify the *fallback* path: with stub throwing, forward runs and
    // produces vars. Phase 3 will add the "stub returns" test path.
    const tpl = { ...chickenRabbitTpl, generator: { strategy: 'reverse' } };
    const q1 = generateQuestion({ template: tpl, seed: 42 });
    const q2 = generateQuestion({ template: tpl, seed: 42 });
    expect(q1.variables.chickens).toBe(q2.variables.chickens); // deterministic
  });
});
```

Note: the existing test file already imports `generateQuestion`. Confirm by checking the imports at the top — if `generateQuestion` is already imported, do not duplicate.

- [ ] **Step 2: Run tests — confirm new ones FAIL**

Run: `cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator && npx vitest run src/core/generate.test.js`
Expected: existing tests PASS, new reverse-strategy tests FAIL (generate.js doesn't route yet).

- [ ] **Step 3: Commit (TDD red)**

```bash
cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator
git add src/core/generate.test.js
git commit -m "test(core): generate.js reverse-fallback behavior"
```

---

## Task 9: Generate — implement reverse routing + remove `reversePending` bypass

**Files:**
- Modify: `src/core/generate.js`

- [ ] **Step 1: Add import for `defaultReverseStrategy`**

At the top of `src/core/generate.js`, find the existing imports and add (alphabetical position is fine):

```js
import { defaultReverseStrategy } from './reverse.js';
```

- [ ] **Step 2: Replace the `reversePending` branch with reverse routing**

Find the validation block at the bottom of `generateQuestion` (lines around `if (!mvr.ok && !solved.reversePending)`). Replace the entire validation tail (from the comment line through the final return statement before `}`) with:

```js
  // Try reverse strategy if requested; fall back to forward on failure.
  // The default stub throws "Phase 3", so chicken-rabbit (which has no
  // top-level generator.strategy) is unaffected — it goes straight to forward.
  // Phase 3 fills in defaultReverseStrategy.solve() and this fallback
  // path naturally lights up.
  const tplGenStrategy = template.generator?.strategy;
  if (tplGenStrategy === 'reverse' && !solved.ok) {
    try {
      vars = defaultReverseStrategy.solve(template, baseRng);
    } catch (e) {
      console.warn(`[generate] reverse strategy failed, falling back to forward: ${e.message}`);
      // vars already populated by forward loop above; re-run constraints.
    }
  }

  // Validate (no more reversePending bypass — solver now returns real values).
  const mvr = mathValidator({ answer: solved.value, answerDef: normalizedAnswer, vars });
  if (!mvr.ok) throw new Error(`math validation failed: ${mvr.reason}`);
  const avr = answerValidator({ answer: solved.value, answerDef: normalizedAnswer });
  if (!avr.ok) throw new Error(`answer validation failed: ${avr.reason}`);
```

- [ ] **Step 3: Update file header docstring**

Replace:

```js
/**
 * Top-level question generator.
 * Docs: v2-tech-docs/Math DSL v1.0 §37 Question, §38 生成流程
 */
```

with:

```js
/**
 * Top-level question generator.
 * Docs: v2-tech-docs/Math DSL v1.0 §37 Question, §38 生成流程;
 *       v2-tech-docs/Math DSL v1.1 §44-45 (reverse direction);
 *       v2-tech-docs/小学数学题智能生成引擎-技术方案.md §7
 */
```

- [ ] **Step 4: Run generate tests — confirm all PASS**

Run: `cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator && npx vitest run src/core/generate.test.js`
Expected: all green (existing + 2 new reverse-strategy cases).

- [ ] **Step 5: Run full core suite — confirm no regression**

Run: `cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator && npx vitest run src/core/`
Expected: all green.

- [ ] **Step 6: Commit**

```bash
cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator
git add src/core/generate.js src/core/generate.test.js
git commit -m "feat(core): generate.js routes strategy=reverse with forward fallback"
```

---

## Task 10: Index — write failing test for new exports

**Files:**
- Modify: `src/core/index.test.js`

- [ ] **Step 1: Append new test**

Open `src/core/index.test.js`. Before its final closing `});`, append:

```js
describe('reverse exports', () => {
  it('should export reverseTopologicalOrder, defaultReverseStrategy, reverseStrategies', async () => {
    const mod = await import('./index.js');
    expect(typeof mod.reverseTopologicalOrder).toBe('function');
    expect(mod.defaultReverseStrategy).toBeDefined();
    expect(mod.defaultReverseStrategy.name).toBe('default');
    expect(mod.reverseStrategies).toBeDefined();
    expect(mod.reverseStrategies.default).toBe(mod.defaultReverseStrategy);
  });
});
```

- [ ] **Step 2: Run — confirm FAIL**

Run: `cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator && npx vitest run src/core/index.test.js`
Expected: FAIL — `reverseTopologicalOrder` / `defaultReverseStrategy` / `reverseStrategies` not exported yet.

- [ ] **Step 3: Commit (TDD red)**

```bash
cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator
git add src/core/index.test.js
git commit -m "test(core): export reverse API from index.js"
```

---

## Task 11: Index — wire new exports

**Files:**
- Modify: `src/core/index.js`

- [ ] **Step 1: Add exports**

Open `src/core/index.js`. Add the following lines (keep existing exports; preserve order):

```js
export { reverseTopologicalOrder } from './dependency.js';
export { defaultReverseStrategy, reverseStrategies } from './reverse.js';
```

- [ ] **Step 2: Update header docstring**

Replace:

```js
/**
 * Core public API.
 */
```

with:

```js
/**
 * Core public API.
 * Docs: v2-tech-docs/Math DSL v1.0, v1.1, 小学数学题智能生成引擎-技术方案
 */
```

- [ ] **Step 3: Run index tests — confirm PASS**

Run: `cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator && npx vitest run src/core/index.test.js`
Expected: all green.

- [ ] **Step 4: Run full core suite — confirm no regression**

Run: `cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator && npx vitest run src/core/`
Expected: all green.

- [ ] **Step 5: Commit**

```bash
cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator
git add src/core/index.js src/core/index.test.js
git commit -m "feat(core): export reverse API from index.js"
```

---

## Task 12: E2E — chicken-rabbit end-to-end produces real answers

**Files:**
- Modify: `tests/core-e2e.test.js`

- [ ] **Step 1: Read existing file**

Run: `cat /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator/tests/core-e2e.test.js`

- [ ] **Step 2: Append the new describe block**

Before the file's final closing (whichever is the outer-most), append:

```js
import chickenRabbitTpl from '../src/templates/olympiad/O23_CHICKEN_RABBIT_001.json' with { type: 'json' };
import { generateQuestion } from '../src/core/generate.js';

describe('e2e: chicken-rabbit (reverse answer path)', () => {
  it('should produce 10 questions with real answers satisfying all constraints', () => {
    const seen = new Set();
    for (let i = 0; i < 10; i++) {
      const q = generateQuestion({ template: chickenRabbitTpl, seed: 1000, index: i });
      // 1. answer.value is real (no reversePending)
      expect(q.answer.value).toBeDefined();
      expect(typeof q.answer.value).toBe('number');
      expect(q.answer.reversePending).toBeUndefined();

      // 2. chickens + rabbits === heads
      expect(q.variables.chickens + q.variables.rabbits).toBe(q.variables.heads);

      // 3. 2 * chickens + 4 * rabbits === legs
      expect(2 * q.variables.chickens + 4 * q.variables.rabbits).toBe(q.variables.legs);

      // 4. answer.value === vars.chickens (because answer.expression references chickens)
      expect(q.answer.value).toBe(q.variables.chickens);

      // 5. unique within batch
      expect(seen.has(q.hash)).toBe(false);
      seen.add(q.hash);
    }
  });

  it('different seeds produce different questions', () => {
    const q1 = generateQuestion({ template: chickenRabbitTpl, seed: 1, index: 0 });
    const q2 = generateQuestion({ template: chickenRabbitTpl, seed: 2, index: 0 });
    expect(q1.hash).not.toBe(q2.hash);
  });
});
```

Note: if the existing file already imports `generateQuestion` at the top, skip the second import line. Check imports first.

- [ ] **Step 3: Run e2e — confirm PASS**

Run: `cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator && npx vitest run tests/core-e2e.test.js`
Expected: all green, including the new chicken-rabbit block (2 cases).

- [ ] **Step 4: Run full test suite — confirm coverage ≥80%**

Run: `cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator && npm run test:run`
Expected: all green. Coverage report shows ≥80% on touched files (`src/core/solver.js`, `schema.js`, `dependency.js`, `reverse.js`, `generate.js`, `index.js`).

- [ ] **Step 5: Verify production build**

Run: `cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator && npm run build`
Expected: build succeeds, `dist/` regenerated.

- [ ] **Step 6: Commit**

```bash
cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator
git add tests/core-e2e.test.js
git commit -m "test(e2e): chicken-rabbit end-to-end produces real answers, validates constraints"
```

---

## Task 13: (Optional) CHANGELOG entry

**Files:**
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Read current CHANGELOG header**

Run: `head -30 /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator/CHANGELOG.md`

- [ ] **Step 2: Add an unreleased section entry**

Add a new entry at the top of the changelog (above the latest versioned section):

```markdown
## [Unreleased]

### Added

- **Reverse Generation Hybrid (Phase 1 infrastructure)** — `answer.reverse` in DSL templates now returns the real answer value instead of `reversePending`. `schema.js` validates `strategy='reverse'` and `role='target'`. New `reverseTopologicalOrder()` utility + new `src/core/reverse.js` (ReverseStrategy interface + default stub for Phase 3 Solver). See `docs/superpowers/specs/2026-09-15-reverse-generation-hybrid-design.md`.

### Notes

- True target-first reverse generation with constraint solving remains Phase 3 per `v2-tech-docs/小学数学题智能生成引擎-技术方案.md §26`.
```

- [ ] **Step 3: Commit**

```bash
cd /Users/shichaopeng/Work/self-dir/projects/PrimarySchoolMathematicsGenerator
git add CHANGELOG.md
git commit -m "docs(core): CHANGELOG entry for reverse generation hybrid"
```

---

## Self-Review (run after writing the plan, before committing)

1. **Spec coverage:**
   - §1 Goal #1 (solver.js real answer) → Tasks 6+7 ✓
   - §1 Goal #2 (schema validation) → Tasks 1+2 ✓
   - §1 Goal #3 (reverseTopologicalOrder) → Tasks 3+4 ✓
   - §1 Goal #4 (reverse.js stub) → Task 5 ✓
   - §1 Goal #5 (generate.js routing) → Tasks 8+9 ✓
   - §1 Goal #6 (forward templates unchanged) → covered by regression tests in Tasks 2, 4, 5, 9, 11 ✓
   - §1 Goal #7 (coverage ≥80%) → Task 12 Step 4 ✓
   - §1 Goal #8 (chicken-rabbit e2e) → Task 12 ✓

2. **Placeholder scan:** No "TBD", "TODO", "implement later", "similar to Task N", or "appropriate error handling" placeholders. Every step has exact file paths, exact code, exact commands, exact expected output.

3. **Type consistency:**
   - `defaultReverseStrategy.solve(template, rng)` used identically in Tasks 5 (definition), 9 (call site).
   - `reverseStrategies` registry shape `{ default: defaultReverseStrategy }` consistent in Tasks 5 + 11.
   - `reverseTopologicalOrder(variables)` signature identical in Tasks 3 (test), 4 (impl), 11 (export).
   - `solveAnswer(answerDef, vars)` return shape `{ ok, value, type, error }` consistent with existing consumers (generate.js line 99, validator.js).

4. **Command consistency:** All `npx vitest run <file>` commands match the actual file paths. `npm run test:run` matches `package.json` script. `npm run build` matches the same.

If you find any issue during implementation, fix inline and continue.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-09-15-reverse-generation-hybrid.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**
