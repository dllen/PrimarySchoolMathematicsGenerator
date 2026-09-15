# Reverse Generation Hybrid (Phase 1 Infrastructure)

> **Status:** Approved design, ready for implementation plan.
> **Date:** 2026-09-15
> **Owner:** PrimarySchoolMathematicsGenerator core
> **Approach chosen:** **C — Hybrid** (unblock chicken-rabbit MVP + extensible Phase 3 seam)
> **Author scope:** Approach C of three proposed (A: answer-flag only, B: full constraint solver, C: hybrid).

## 1. Goal

Make `reverse generation` a first-class concept across the core engine, **without** implementing the actual constraint solver (which is Phase 3 per `v2-tech-docs/小学数学题智能生成引擎-技术方案.md §26`). The contract for Phase 3 is laid down concretely so the future contributor can fill in `solve()` without re-wiring anything.

### Concrete deliverables

1. `src/core/solver.js` returns the real answer value when `answer.reverse === true` (no more `reversePending`).
2. `src/core/schema.js` validates `strategy: 'reverse'` + `role: 'target'` templates at startup (fail-loud).
3. `src/core/dependency.js` exposes a new `reverseTopologicalOrder(variables)` utility (target-first).
4. `src/core/reverse.js` (NEW) defines the `ReverseStrategy` interface + a default stub that throws "Phase 3" — the seam for Phase 3.
5. `src/core/generate.js` routes `strategy: 'reverse'` to the stub; falls back to forward flow when the stub throws (preserves chicken-rabbit MVP).
6. All existing forward templates (`G3_PRICE_001`, `G3_MIX_001`) are unchanged.
7. Test coverage ≥80% on every touched file (per `vitest.config.js` + `AGENTS.md`).
8. Chicken-rabbit template end-to-end: 10 questions all return real answers, all constraints satisfied.

## 2. Background — Why now

### What the docs describe

- `v2-tech-docs/小学数学题生成 DSLv1.0-统一类型与示例规范.md §19 — Reverse Generator`:
  > "先生成答案 → 反推题目参数 → 构造约束"
- `v2-tech-docs/MathDSLv1.1变量依赖与求值规则.md §44 — Reverse Variable`:
  > Introduces `GenerationRole = 'input' | 'derived' | 'target' | 'unknown'`; target is the answer.
- `v2-tech-docs/MathDSLv1.1变量依赖与求值规则.md §45 — 依赖方向 vs 求解方向`:
  > Forward (price, quantity → total) vs Reverse (total → price, quantity).
- `v2-tech-docs/小学数学题智能生成引擎-技术方案.md §7 — 奥数题核心算法：逆向生成`:
  > "确定解题结构 → 确定答案 → 反向构造条件 → 生成题目 → 自动验证"
- `v2-tech-docs/小学数学题智能生成引擎-技术方案.md §26 — 第三阶段`:
  > Explicitly defers "Reverse Generation + Solver" to Phase 3 alongside Proof Tree, Geometry Engine.

### What's already done (DSL Engine MVP, commit `a09fb00`)

- 11 core modules: `random`, `dependency`, `expression`, `constraint`, `solver`, `renderer`, `difficulty`, `validator`, `schema`, `generate`, `index`
- 3 JSON templates: `G3_PRICE_001` (forward), `G3_MIX_001` (forward), `O23_CHICKEN_RABBIT_001` (uses `answer.reverse: true`)
- `DslStrategy` bridging JSON templates + core engine
- Topological order + cycle detection in `dependency.js`
- Constraint validation (9 types) in `constraint.js`

### What's unimplemented (the gap)

Only one **explicit** TODO in code:

```js
// src/core/solver.js:4
* 本期 MVP 只支持简单 expression 求值；reverse generation 留 TODO
```

```js
// src/core/solver.test.js:15
it('鸡兔同笼反推留 TODO（reverse generation）', () => { ... reversePending === true ... });
```

Additionally:

- `src/core/difficulty.js` comment: "本期 MVP: 只算 operationScore + variableScore + depthScore" (knowledgeScore / reasoningScore / numberScore / readingScore not implemented per DSLv1.0 §35). **Out of scope for this PR** — confirmed during scope clarification.
- `GenerationRole` enum from v1.1 §44: completely absent from `schema.js`.
- `strategy: 'reverse'` in `template.generator`: no runtime support, no schema validation.

### Why hybrid (Approach C) won

We considered three approaches. Approach C was chosen because:

- **A (answer-flag only)** would unblock chicken-rabbit but leave schema keys that don't do anything — misleading future readers.
- **B (true reverse generation + solver)** would match the docs fully but requires a non-trivial constraint solver (linear equation solving for chicken-rabbit-style problems), which the docs explicitly mark as Phase 3. Risk of correctness bugs is high; coverage ≥80% would be hard.
- **C (hybrid)** ships real value today (chicken-rabbit works end-to-end, `reversePending` branch gone, schema is honest about what it accepts), AND lays down the seam for Phase 3 — `ReverseStrategy.solve()` is a single function to fill in later, no rewiring.

## 3. Architecture & Module Map

### New / changed modules

| Module | Change | Purpose |
|---|---|---|
| `src/core/solver.js` | **Rewrite** | When `answer.reverse === true`, return `vars[name]` directly. Drop `reversePending` return shape. |
| `src/core/schema.js` | **Extend** | Accept `strategy: 'reverse'` and `role: 'target'`. Add 4 validation rules. |
| `src/core/dependency.js` | **Extend** | Add `reverseTopologicalOrder(variables)`. Existing `buildDependencyGraph` unchanged. |
| `src/core/reverse.js` (NEW) | New | Defines `ReverseStrategy` interface + exported `reverseStrategies` registry. Stub `defaultReverseStrategy.solve()` throws. |
| `src/core/generate.js` | **Simplify** | Remove `reversePending` branch in validation. When `template.generator.strategy === 'reverse'`, call `defaultReverseStrategy.solve(...)`; failure falls through to forward flow. |
| `src/core/index.js` | **Extend** | Export `reverseTopologicalOrder`, `defaultReverseStrategy`, `reverseStrategies`. |
| `src/templates/olympiad/O23_CHICKEN_RABBIT_001.json` | **No change** | Already has `answer.reverse: true`. Will work once `solver.js` is fixed. |
| `src/core/solver.test.js` | **Update** | Replace the `reversePending` test with a real-value assertion. |
| `src/core/schema.test.js` | **Extend** | Cover reverse-strategy + target-role validation. |
| `src/core/dependency.test.js` | **Extend** | Cover `reverseTopologicalOrder`. |
| `src/core/reverse.test.js` (NEW) | New | Stub interface tests. |
| `src/core/generate.test.js` | **Extend** | Reverse-fallback behavior. |
| `src/core/index.test.js` | **Extend** | New exports. |
| `tests/core-e2e.test.js` | **Extend** | Chicken-rabbit end-to-end. |

### Architecture principle

> Two independent concerns, both owned by `generate.js`:
> 1. *What value does the answer have?* — solved by `solver.js` (always, today)
> 2. *How were the variables generated?* — solved by `generate.js` (forward today, reverse tomorrow)
>
> Phase 1 fixes (1) end-to-end. Phase 3 replaces (2). The `ReverseStrategy` interface is the seam.

### Layering

```text
schema.js (validate at startup)
  ↓
generate.js (orchestrate)
  ├── random.js          ← forward generation today
  ├── reverse.js (NEW)   ← reverse generation stub (Phase 3)
  ├── dependency.js      ← topo order + reverseTopologicalOrder
  ├── expression.js      ← derived evaluation
  ├── constraint.js      ← post-generation validation
  ├── solver.js          ← answer resolution (handles reverse flag)
  ├── renderer.js        ← text template
  ├── difficulty.js      ← scoring (untouched this round)
  └── validator.js       ← final QA
```

## 4. Data Flow & Error Handling

### Two paths, one orchestrator

`generateQuestion()` keeps its single entrypoint. Inside, it picks a path based on the **template-level `generator.strategy`** (defaults to `'random'`):

```text
                        generateQuestion(template, seed, index)
                                    │
                  template.generator.strategy ?? 'random'
                                    │
                ┌───────────────────┴───────────────────┐
                │                                       │
          'random' (default)                       'reverse'
                │                                       │
                ▼                                       ▼
       forwardFlow(template,                  reverseFlow(template,
                  order, rng)                             rng)
                │                                       │
                ▼                                       ▼
       for each var in order:               1. find role='target' vars
         random → rng pick                   2. generate target first
         derived → evaluate(expr, vars)      3. call ReverseStrategy
                                              .solve(template, vars, rng)
                                            ─ throws? → log warn, fall
                                              through to forwardFlow
                                            ─ returns? → use as vars
                │                                       │
                └───────────────────┬───────────────────┘
                                    ▼
                        validateConstraints(vars)
                         fail → retry up to MAX_ATTEMPTS (100)
                                    │
                                    ▼
                          solveAnswer(answer, vars)
                                    │
                  ┌─────────────────┴─────────────────┐
                  │                                   │
        answer.reverse === true                  answer.expression
                  │                                   │
                  ▼                                   ▼
        return vars[name]                  return evaluate(expr, vars)
        (variable must exist in vars       (normal forward path)
         else → throw TEMPLATE_BUG)
                                    │
                                    ▼
                          mathValidator / answerValidator
                              (no more reversePending branch)
                                    │
                                    ▼
                            render + return Question
```

### Key contracts

**1. `solver.js` is now honest about reverse**

Input:
```js
{ type: 'integer', expression: { variable 'chickens' }, reverse: true }
// vars = { chickens: 23, rabbits: 12, heads: 35, legs: 94 }
```
Output:
```js
{ ok: true, value: 23, type: 'integer' }
```

- If `answer.reverse === true` and the referenced variable is **in vars**, return it.
- If the variable is **missing from vars**, throw `Error('reverse answer references ungenerated variable: <name>')`. **Template bug** — fail loud.
- The `reversePending` return shape is **deleted**.

**2. `reverse.js` stub contract**

```js
// src/core/reverse.js
export const defaultReverseStrategy = {
  name: 'default',
  /**
   * @param {object} template - DSL template
   * @param {object} rng - SeedableRNG
   * @returns {Record<string, any>} vars map (target already populated)
   * @throws if reverse generation cannot proceed
   */
  solve(template, rng) {
    throw new Error(
      '[reverse] Phase 3 required: implement ReverseStrategy.solve. ' +
      'See docs/superpowers/specs/2026-09-15-reverse-generation-hybrid-design.md §3'
    );
  },
};

export const reverseStrategies = { default: defaultReverseStrategy };
```

Phase 3 fills in `solve()`. Phase 1 just exposes the seam.

**3. `schema.js` validates reverse templates up front**

New rules (startup fail-loud, not runtime surprise):

| # | Rule | Error message |
|---|---|---|
| 1 | `strategy: 'reverse'` in `template.generator` requires ≥1 variable with `role: 'target'` | `reverse strategy requires at least one role='target' variable` |
| 2 | `role: 'target'` only allowed when `type: 'random'` | `role='target' requires type='random'` |
| 3 | `role: 'target'` variable must have a valid `generator` | `role='target' variable <name> needs generator` |
| 4 | `role: 'target'` is exclusive: at most one per template | `multiple role='target' variables not supported` |

Existing templates pass without change — none currently set `strategy: 'reverse'` at the template level.

**4. Error handling matrix**

| Scenario | Behavior |
|---|---|
| `answer.reverse === true` but var missing from vars | `throw` — template bug, fail loud |
| `template.generator.strategy === 'reverse'` and stub throws | `console.warn` + fall through to forward flow (preserves chicken-rabbit MVP) |
| `schema.js` rejects malformed reverse template at startup | `throw` — startup halts |
| Reverse order topo has a cycle | `throw` — same as existing forward cycle detection |
| Constraint fails after reverse generation | Same retry loop as forward (MAX_ATTEMPTS = 100) |

### Why this shape

- **Chicken-rabbit keeps working today**: (a) its template has no top-level `generator.strategy`, so default `'random'` flow runs, and (b) `solver.js` now returns the real `chickens` value, so validation passes.
- **Future contributor doesn't re-wire anything** — only implements `reverseStrategies.default.solve(template, rng)`.
- **No silent fallthrough on template bugs** — only on missing Phase 3 implementation, which is logged loudly.

## 5. Testing Strategy

Per `AGENTS.md`: Vitest + jsdom, `*.test.js` next to source, `describe` + `it('should ...')`, **≥80% coverage** (branches / functions / lines / statements).

### File-by-file test plan

| File | Status | New / changed tests |
|---|---|---|
| `src/core/solver.test.js` | **Rewrite 1 test** | Replace `reversePending` test. Add throw-on-missing test. Keep 2 forward tests. |
| `src/core/schema.test.js` | **Extend** | 6 new reverse-validation tests. Keep all existing tests (regression guard). |
| `src/core/dependency.test.js` | **Extend** | 5 new `reverseTopologicalOrder` tests. Keep all existing tests. |
| `src/core/reverse.test.js` (NEW) | New | 3 stub interface tests. |
| `src/core/generate.test.js` | **Extend** | 2 reverse-fallback behavior tests. Keep existing tests. |
| `src/core/index.test.js` | **Extend** | 1 new-exports test. |
| `tests/core-e2e.test.js` | **Extend** | Chicken-rabbit end-to-end block: 10 questions, all constraints. |

### Per-test details

**`solver.test.js`** (the only **destructive** change — old test gets replaced):

```js
// REPLACES the existing '鸡兔同笼反推留 TODO（reverse generation）' test
it('should return vars[name] when answer.reverse is true and variable exists', () => {
  const def = { type: 'integer', expression: { type: 'variable', name: 'chickens' }, reverse: true };
  const r = solveAnswer(def, { chickens: 23, rabbits: 12, heads: 35, legs: 94 });
  expect(r.ok).toBe(true);
  expect(r.value).toBe(23);
  expect(r.type).toBe('integer');
  expect(r.reversePending).toBeUndefined(); // critical: no more reversePending
});

it('should throw when reverse answer references ungenerated variable', () => {
  const def = { type: 'integer', expression: { type: 'variable', name: 'ghosts' }, reverse: true };
  expect(() => solveAnswer(def, { chickens: 5 })).toThrow(/ungenerated variable.*ghosts/);
});
```

**`schema.test.js`** (new reverse-validation cases):

```js
describe('reverse strategy validation', () => {
  const baseTpl = {
    id: 'X',
    metadata: { name: 'x', type: 'olympiad', grade: 4 },
    variables: { t: { type: 'random', valueType: 'integer', role: 'target',
                       generator: { strategy: 'range', min: 1, max: 10 } } },
    answer: { type: 'integer', expression: 't' },
    renderer: { question: '{{t}}' },
  };

  it('should accept valid template with strategy=reverse + role=target', () => { /* ok */ });
  it('should reject strategy=reverse without any role=target', () => { /* fail */ });
  it('should reject role=target on derived variable', () => { /* fail */ });
  it('should reject role=target without generator', () => { /* fail */ });
  it('should reject multiple role=target variables', () => { /* fail */ });
  it('should still accept existing forward templates (regression)', () => { /* G3_PRICE_001 shape */ });
});
```

**`dependency.test.js`** (new reverse-topo cases):

```js
describe('reverseTopologicalOrder', () => {
  it('should place role=target variables first', () => { /* 2 inputs, 1 target */ });
  it('should preserve topo within non-target subgraph', () => { /* mixed */ });
  it('should put lone target with no deps first', () => { /* size=1 */ });
  it('should throw on cycle involving target', () => { /* cycle detection */ });
  it('should not change order when no role=target present', () => { /* forward-only */ });
});
```

**`reverse.test.js`** (NEW):

```js
import { describe, it, expect } from 'vitest';
import { defaultReverseStrategy, reverseStrategies } from './reverse.js';

describe('defaultReverseStrategy', () => {
  it('should have name "default"', () => expect(defaultReverseStrategy.name).toBe('default'));
  it('should be registered in reverseStrategies', () => expect(reverseStrategies.default).toBe(defaultReverseStrategy));
  it('should throw Phase 3 message when solve() is called', () => {
    expect(() => defaultReverseStrategy.solve({}, {})).toThrow(/Phase 3/);
  });
});
```

**`generate.test.js`** (new fallback behavior):

```js
describe('generateQuestion reverse strategy', () => {
  it('should log warn and fall through to forward when reverse stub throws', () => {
    const tpl = { ...chickenRabbitTpl, generator: { strategy: 'reverse' } };
    const q = generateQuestion({ template: tpl, seed: 1 });
    expect(q.answer.value).toBeDefined(); // forward succeeded
  });

  it('should use returned vars when reverse stub returns vars (Phase 3 path simulation)', () => {
    // mock defaultReverseStrategy.solve to return a fixed vars map; verify it's used
  });
});
```

### Coverage expectations

| File | Expected coverage | Notes |
|---|---|---|
| `solver.js` | ~95% | Tiny function, both branches + error path covered |
| `schema.js` | ~90% | All new validation rules + existing rules covered |
| `dependency.js` | ~90% | Existing + new `reverseTopologicalOrder` paths |
| `reverse.js` | 100% | Only stub interface |
| `generate.js` | ~85% | Existing + new reverse-fallback branches |

**Verification command:**
```bash
npm run test:run
```
Expected: all green, coverage ≥80% on touched files. CI runs this on every push.

## 6. Migration, Rollout & Risk

### Branch & base

- **Branch name:** `feat/dsl-reverse-generation-hybrid`
- **Base:** `main` (latest commit `f5862b6` — the v2-tech-docs intro)

### Commit strategy (TDD, 10 commits)

| # | Commit | Files |
|---|---|---|
| 1 | `test(core): schema accepts strategy=reverse + role=target with validation rules` | `schema.test.js` |
| 2 | `feat(core): schema validation for reverse strategy + target role` | `schema.js`, `schema.test.js` |
| 3 | `test(core): reverseTopologicalOrder places role=target first` | `dependency.test.js` |
| 4 | `feat(core): reverseTopologicalOrder in dependency.js` | `dependency.js`, `dependency.test.js` |
| 5 | `feat(core): reverse.js — ReverseStrategy interface + default stub` | `reverse.js`, `reverse.test.js` |
| 6 | `test(core): solver returns vars[name] when answer.reverse=true (replaces reversePending)` | `solver.test.js` |
| 7 | `fix(core): solver returns real answer when reverse=true` | `solver.js`, `solver.test.js` |
| 8 | `feat(core): generate.js routes strategy=reverse with fallback` | `generate.js`, `generate.test.js` |
| 9 | `feat(core): export reverse API from index.js` | `index.js`, `index.test.js` |
| 10 | `test(e2e): chicken-rabbit end-to-end produces real answers, validates constraints` | `tests/core-e2e.test.js` |

Optional final commit:

| 11 | `docs(core): CHANGELOG entry for reverse generation hybrid` | `CHANGELOG.md` |

### PR title & body

**Title:** `feat(core): reverse generation hybrid (Phase 1 infrastructure, Phase 3 deferred)`

**Body sketch:**

```markdown
## 背景
v2-tech-docs 三件套 (v1.0 §19, v1.1 §44-45, 技术方案 §7) 描述了"逆向生成"
作为奥数题的核心算法。docs §26 明确把真正的 Reverse Generation + Solver 放在
第三阶段。本 PR 完成第一阶段基础设施，让鸡兔同笼模板的 answer.reverse
真正生效，同时为 Phase 3 的 Solver 实现铺好接口。

## 关键决策
- solver.js: 当 answer.reverse=true 时直接从 vars 取值，删掉 reversePending。
- schema.js: 接受 strategy='reverse' 与 role='target'，加 4 条校验规则（启动期 fail-loud）。
- dependency.js: 新增 reverseTopologicalOrder（target-first），不改动现有 buildDependencyGraph。
- reverse.js (NEW): ReverseStrategy 接口 + 默认 stub 抛 "Phase 3" 错误。
- generate.js: 增加 reverse 分支，stub 抛错时降级到 forward 流（保鸡兔同笼 MVP）。

## 不在本 PR
- 真正的 target-first 反向生成（含线性方程 Solver）—— 见 v2-tech-docs §26 第三阶段。
- difficulty.js 的 knowledgeScore 等 4 项补齐 —— 已在 scope 决定中排除。

## 验证
- [x] npm run test:run —— all green, coverage ≥80% on touched files
- [x] npm run build —— production build OK
- [x] 鸡兔同笼模板 10 题端到端：answer.value 都是整数，chickens+rabbits===heads，2*chickens+4*rabbits===legs
- [x] G3_PRICE / G3_MIX forward 模板回归通过

Refs: docs/superpowers/specs/2026-09-15-reverse-generation-hybrid-design.md
Refs: v2-tech-docs/MathDSLv1.1 §44-45, 小学数学题生成 DSLv1.0 §19,
       小学数学题智能生成引擎-技术方案 §7/§26
```

### Risk assessment

| Risk | Likelihood | Mitigation |
|---|---|---|
| `solver.js` change breaks existing test | Low | Test in same commit; `reversePending` test replaced, not silently deleted |
| `schema.js` new rules reject a previously-valid template | Low | Existing templates have no top-level `generator.strategy='reverse'` — no rule fires; existing tests stay green as regression guard |
| `generate.js` orchestrator change breaks other paths | Medium | Only **adds** a branch; existing forward path byte-for-byte unchanged. New branch has 2 dedicated tests + e2e |
| Coverage dips below 80% on touched files | Medium | Per-file coverage table in §5; CI gate |
| `reverseTopologicalOrder` has subtle bug affecting forward templates | Low | Function is additive — `buildDependencyGraph` unchanged. Forward templates never invoke it |
| Phase 3 contributor needs to rewire `generate.js` | None | Interface contract locked in this PR; Phase 3 only edits `reverse.js`'s stub |

### Backward compatibility

- **Public API (`src/core/index.js`):** only **adds** exports. No removal.
- **Template shape:** existing 3 JSON templates unchanged. New keys (`strategy: 'reverse'`, `role: 'target'`) accepted but not required.
- **`DslStrategy`:** no contract change. Behavior identical for existing templates.
- **Frontend (Vue views/components):** zero impact — `reversePending` was never consumed outside `generate.js`.

### Rollout checklist (post-PR-merge)

1. Merge to `main` via standard PR review
2. CI on `.github/workflows/deploy.yml` builds & deploys to GitHub Pages — no special config
3. Spot-check on the deployed site: open 鸡兔同笼 generator, verify the answer renders a real number (not `undefined` or `待求`)
4. If GH Pages shows any regression, revert via `git revert <merge-commit>` — no schema migrations needed (Dexie untouched)

## 7. Out of Scope

These are **explicitly NOT** part of this PR. They are documented so future contributors don't conflate them with the current work:

- **True target-first reverse generation with constraint solving** — see v2-tech-docs §26 第三阶段 (Phase 3). Requires implementing `ReverseStrategy.solve()` for at least the linear-equation case (chicken-rabbit, and差倍问题).
- **`difficulty.js` — knowledgeScore, reasoningScore, numberScore, readingScore** — explicitly excluded during scope clarification (Option B was declined).
- **Geometry DSL, Logic DSL, Proof Tree, Equation Solver, Symbolic Solver, Tree Search, LLM Renderer, Semantic Validator, Embedding Dedup** — all v2.0 features per DSLv1.0 §45. Future PRs.
- **Reverse-direction cycle detection algorithm optimization** — current cycle detection in `buildDependencyGraph` works for both forward and reverse topo; no special algorithm needed in Phase 1.

## 8. References

- `v2-tech-docs/小学数学题智能生成引擎-技术方案.md §7` — 奥数题核心算法：逆向生成
- `v2-tech-docs/小学数学题智能生成引擎-技术方案.md §26` — 第三阶段（Reverse Generation + Solver）
- `v2-tech-docs/小学数学题生成 DSLv1.0-统一类型与示例规范.md §19` — Reverse Generator
- `v2-tech-docs/MathDSLv1.1变量依赖与求值规则.md §44` — Reverse Variable / GenerationRole
- `v2-tech-docs/MathDSLv1.1变量依赖与求值规则.md §45` — 依赖方向 vs 求解方向
- `docs/superpowers/plans/2026-09-15-dsl-engine-mvp.md` — Prior MVP plan (a09fb00)
- `docs/superpowers/specs/2026-09-15-dsl-engine-mvp-design.md` — Prior MVP design
- `AGENTS.md` — repo coding standards, commit conventions, testing rules
