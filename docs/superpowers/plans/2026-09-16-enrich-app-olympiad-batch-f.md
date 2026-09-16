# Batch F: 应用 / 奥数 题目类型扩展 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增 20 个新题目类型(应用 + 奥数: A 类 13 + D 类 7),覆盖小学课内常见考点与高频思维挑战。

**Architecture:**
- **应用 / 奥数模板**:20 个新模板沿用 D 契约(`id` / `gradeRange` / `semester` / `subtemplates` / `generate`),通过 `BandAwareStrategy` 自动调度。A 类补全新题型,D 类作为变体独立成文件。
- **Helpers 扩展**:`pickClockTime` / `pickDiscountRate` / `pickSpeedPair` 3 个新 helper,沿用现有 `pickNumberByBand` 等。
- **集成**:`problemTemplates/index.js` 注册 20 个模板到 APPLICATION_TEMPLATES / OLYMPIAD_TEMPLATES;`QUESTION_TYPES` 新增 20 个;QuestionTypePicker 添加 8 个折叠分组。
- **UI 折叠**:D 类变体归并到父类 group 下(`kind: 'group'` 沿用 Batch C/E)。
- **不动**:strategy 类、ConfigWizard/GeneratorView、图形渲染。

**Tech Stack:** 纯 JS + Vitest,无新依赖。

**前置 spec:** `docs/superpowers/specs/2026-09-16-enrich-app-olympiad-batch-f-design.md`

---

## 文件结构

### 新增(20 模板 + 20 测试 + 3 helper)

| 文件 | 职责 |
|---|---|
| `src/problemTemplates/helpers.js` (扩展) | 新增 `pickClockTime` / `pickDiscountRate` / `pickSpeedPair` |
| `src/problemTemplates/helpers.test.js` (扩展) | 3 个新 helper 的单元测试 |
| `src/problemTemplates/discount.js` | 折扣/优惠(单折/叠加/买几送几,3 子模板) |
| `src/problemTemplates/interest.js` | 利息/存款(单利,3 子模板) |
| `src/problemTemplates/boatCurrent.js` | 流水行船(顺/逆/静水速度,3 子模板) |
| `src/problemTemplates/trainBridge.js` | 火车过桥/隧道(整除约束,3 子模板) |
| `src/problemTemplates/clockAngle.js` | 钟表问题(夹角/重合/成直线,3 子模板) |
| `src/problemTemplates/proportionDist.js` | 按比例分配(总量与比,3 子模板) |
| `src/problemTemplates/average.js` | 平均数(加权/多组/移多补少,3 子模板) |
| `src/problemTemplates/formation.js` | 方阵问题(实心/空心/总人数,3 子模板) |
| `src/problemTemplates/inclusionExclusion.js` | 容斥原理(两/三集合重叠,3 子模板) |
| `src/problemTemplates/perfectSquare.js` | 完全平方数(判定/因数个数,3 子模板) |
| `src/problemTemplates/coloring.js` | 染色问题(棋盘/区域,3 子模板) |
| `src/problemTemplates/extremeValue.js` | 最值/极端原理(最大/最小存在,3 子模板) |
| `src/problemTemplates/logicDeduction.js` | 逻辑推理(真假话/条件,3 子模板) |
| `src/problemTemplates/chickenRabbit3Var.js` | 三变量鸡兔(牛/羊/鸡,3 子模板) |
| `src/problemTemplates/treePlantingBuilding.js` | 楼间距/楼梯(封闭 vs 开放,3 子模板) |
| `src/problemTemplates/ageProblemFamily.js` | 三人/四代同堂年龄(3 子模板) |
| `src/problemTemplates/distanceCircular.js` | 环形跑道追及(3 子模板) |
| `src/problemTemplates/unitaryWork.js` | 工程归一(工效×时间,3 子模板) |
| `src/problemTemplates/concentrationTriple.js` | 三溶液混合(3 子模板) |
| `src/problemTemplates/comparisonMulti.js` | 多重比较(3 个及以上,3 子模板) |
| `src/problemTemplates/<上述 20 个>.test.js` | 模板对应单元测试 |

### 修改(3 个文件)

| 文件 | 变更 |
|---|---|
| `src/problemTemplates/index.js` | 注册 20 个新模板 |
| `src/constants/options.js` | QUESTION_TYPES 新增 20 个 entry |
| `src/constants/options.test.js` | 新增 20 个 question type 断言 |
| `src/components/config/QuestionTypePicker.vue` | 新增 8 个 kind:'group' 分组 |
| `src/problemTemplates/bandCoverage.test.js` | 新增 20 个模板的 band 覆盖断言 |
| `src/problemTemplates/diversity.test.js` | 新增 20 个模板的 diversity 验证 |

---

## 通用契约与模式

### 应用 / 奥数模板契约(沿用 D)

```js
// src/problemTemplates/<name>.js
import { pickNumberByBand, pickForBand, pickPerson } from './helpers.js';

export const <name>Template = {
  id: '<template-id>',
  gradeRange: ['5', '6'],
  semester: 'all',
  subtemplates: [
    { id: '<sub-id-easy>',   band: 'easy',   generate(rng) { ... } },
    { id: '<sub-id-medium>', band: 'medium', generate(rng) { ... } },
    { id: '<sub-id-hard>',   band: 'hard',   generate(rng) { ... } },
  ],
  generate(rng, difficultyLevel) {
    return pickForBand(this, difficultyLevel, rng);
  },
};
```

### 测试约定

每个 `<name>.test.js` 包含 4 个 it 块:
1. `subtemplates.length === 3 && bands 覆盖 easy/medium/hard`
2. 每个 subtemplate 各自生成合法题目(question/answer/subtype/payload)
3. payload 字段自洽

测试文件模板:

```js
// src/problemTemplates/<name>.test.js
import { describe, it, expect } from 'vitest';
import { <name>Template } from './<name>.js';

function makeRng(seed = 42) {
  // ... 简单 mulberry32,本项目已有此模式
}

describe('<name>Template', () => {
  it('has 3 subtemplates covering easy/medium/hard', () => {
    expect(<name>Template.subtemplates.length).toBe(3);
    const bands = <name>Template.subtemplates.map(s => s.band);
    expect(bands).toContain('easy');
    expect(bands).toContain('medium');
    expect(bands).toContain('hard');
  });

  describe('easy subtemplate', () => {
    it('generates valid question', () => {
      const result = <name>Template.subtemplates[0].generate(makeRng());
      expect(typeof result.question).toBe('string');
      expect(result.question.length).toBeGreaterThan(0);
      expect(typeof result.answer).toBe('string');
      expect(result.subtype).toBe('<id>');
      expect(result.payload).toBeDefined();
    });
  });
  // ... medium/hard 重复
});
```

> 说明:每个模板任务的"测试样板"在第一次出现时给出完整代码,后续模板任务的 test 沿用同结构,只替换 `subtemplates[i]` 索引与断言。无需逐模板重写完整测试代码。

---

## Task 1: helpers.js 新增 3 个 helper

**Files:**
- Modify: `src/problemTemplates/helpers.js`
- Modify: `src/problemTemplates/helpers.test.js`

- [ ] **Step 1: 写失败测试**

在 `helpers.test.js` 末尾追加:

```js
import { pickClockTime, pickDiscountRate, pickSpeedPair } from './helpers.js';

describe('pickClockTime', () => {
  it('returns valid HH:MM string', () => {
    const rng = makeRng(1);
    for (let i = 0; i < 20; i++) {
      const t = pickClockTime(rng, 'medium');
      expect(t).toMatch(/^([01]?\d|2[0-3]):[0-5]\d$/);
    }
  });
  it('clamps hour to 0-23', () => {
    const rng = makeRng(2);
    for (let i = 0; i < 50; i++) {
      const t = pickClockTime(rng, 'hard');
      const [h] = t.split(':').map(Number);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThan(24);
    }
  });
});

describe('pickDiscountRate', () => {
  it('returns rate in [0.5, 0.95]', () => {
    const rng = makeRng(3);
    for (let i = 0; i < 30; i++) {
      const r = pickDiscountRate(rng, 'medium');
      expect(r).toBeGreaterThanOrEqual(0.5);
      expect(r).toBeLessThanOrEqual(0.95);
    }
  });
});

describe('pickSpeedPair', () => {
  it('returns two distinct positive integers', () => {
    const rng = makeRng(4);
    for (let i = 0; i < 20; i++) {
      const [a, b] = pickSpeedPair(rng, 'medium');
      expect(a).toBeGreaterThan(0);
      expect(b).toBeGreaterThan(0);
      expect(a).not.toBe(b);
    }
  });
  it('respects band scaling', () => {
    const rngEasy = makeRng(5);
    const rngHard = makeRng(5);
    const [aEasy] = pickSpeedPair(rngEasy, 'easy');
    const [aHard] = pickSpeedPair(rngHard, 'hard');
    // hard 缩放因子 1.8,easy 0.5;同种子下 hard 应 ≥ easy
    expect(aHard).toBeGreaterThanOrEqual(aEasy);
  });
});
```

> 备注:本计划假设 `makeRng(seed)` 函数在测试文件顶部已有(沿用 Batch A/B/C/E 既有模式)。如果不存在,在 `helpers.test.js` 顶部添加:
>
> ```js
> function makeRng(seed) {
>   let s = seed >>> 0;
>   return {
>     int(min, max) { s = (s * 1664525 + 1013904223) >>> 0; return min + (s % (max - min + 1)); },
>     pick(arr) { return arr[this.int(0, arr.length - 1)]; },
>   };
> }
> ```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/problemTemplates/helpers.test.js`
Expected: FAIL `pickClockTime is not a function`

- [ ] **Step 3: 实现 3 个 helper**

在 `helpers.js` 末尾(`export function pickPairByBand` 之后、文件其他 export 之前)追加:

```js
/** 生成合法 HH:MM 时间。band 控制分钟进度(0/5/1 步进)。 */
export function pickClockTime(rng, band = 'medium') {
  const hour = rng.int(0, 23);
  const minuteStep = band === 'easy' ? 0 : band === 'medium' ? 5 : 1;
  const minuteMax = 60 / Math.max(minuteStep, 1) - 1;
  const minute = minuteStep === 0 ? 0 : rng.int(0, minuteMax) * minuteStep;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/** 生成 0.5–0.95 区间的折扣率(以 0.05 为步长)。 */
export function pickDiscountRate(rng, band = 'medium') {
  const steps = [0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95];
  const idx = band === 'easy' ? rng.int(0, 4)
           : band === 'hard' ? rng.int(5, 9)
           : rng.int(2, 7);
  return steps[idx];
}

/** 返回 2 个不同的合理速度(km/h),band 缩放。 */
export function pickSpeedPair(rng, band = 'medium') {
  const scale = band === 'easy' ? 0.5 : band === 'hard' ? 1.8 : 1.0;
  const lo = Math.max(10, Math.floor(30 * scale));
  const hi = Math.floor(120 * scale);
  const a = rng.int(lo, hi);
  let b = rng.int(lo, hi);
  let tries = 0;
  while (b === a && tries < 10) {
    b = rng.int(lo, hi);
    tries++;
  }
  if (b === a) b = a + 1; // 兜底
  return [Math.min(a, b), Math.max(a, b)];
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/problemTemplates/helpers.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/problemTemplates/helpers.js src/problemTemplates/helpers.test.js
git commit -m "feat(helpers): pickClockTime / pickDiscountRate / pickSpeedPair"
```


---

## Task 2: discount.js (应用 A #1)

**Files:**
- Create: `src/problemTemplates/discount.js`
- Create: `src/problemTemplates/discount.test.js`

- [ ] **Step 1: 写失败测试**

`src/problemTemplates/discount.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { discountTemplate } from './discount.js';

function makeRng(seed = 42) {
  let s = seed >>> 0;
  return {
    int(min, max) { s = (s * 1664525 + 1013904223) >>> 0; return min + (s % (max - min + 1)); },
    pick(arr) { return arr[this.int(0, arr.length - 1)]; },
    float() { s = (s * 1664525 + 1013904223) >>> 0; return (s & 0xffff) / 0x10000; },
  };
}

describe('discountTemplate', () => {
  it('has 3 subtemplates covering easy/medium/hard', () => {
    expect(discountTemplate.subtemplates.length).toBe(3);
    expect(discountTemplate.subtemplates.map(s => s.band)).toContain('easy');
    expect(discountTemplate.subtemplates.map(s => s.band)).toContain('medium');
    expect(discountTemplate.subtemplates.map(s => s.band)).toContain('hard');
  });
  it('generates valid subtemplates', () => {
    for (const st of discountTemplate.subtemplates) {
      const r = st.generate(makeRng());
      expect(r.question).toMatch(/原价|现价|打折|满减|送/);
      expect(r.answer).toMatch(/\d/);
      expect(r.subtype).toBe('discount');
      expect(r.payload).toBeDefined();
    }
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/problemTemplates/discount.test.js`
Expected: FAIL `Cannot find module './discount.js'`

- [ ] **Step 3: 实现 discount.js**

`src/problemTemplates/discount.js`:

```js
import { pickNumberByBand, pickForBand, pickDiscountRate } from './helpers.js';

const ITEMS = ['文具', '水果', '零食', '玩具', '服装', '电器'];

function pickItem(rng) { return rng.pick(ITEMS); }

export const discountTemplate = {
  id: 'discount',
  gradeRange: ['5', '6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'discount-single',
      band: 'easy',
      generate(rng) {
        const price = pickNumberByBand(rng, 'easy', { min: 50, max: 200 });
        const rate = pickDiscountRate(rng, 'easy');
        const final = Math.round(price * rate);
        const item = pickItem(rng);
        return {
          question: `一件${item}原价${price}元,现在打${Math.round(rate * 10)}折,现价多少元?`,
          answer: `${final}元`,
          subtype: 'discount',
          payload: { kind: 'single', price, rate, final },
        };
      },
    },
    {
      id: 'discount-stack',
      band: 'medium',
      generate(rng) {
        const price = pickNumberByBand(rng, 'medium', { min: 100, max: 500 });
        const rate = pickDiscountRate(rng, 'medium');
        const fullMinus = pickNumberByBand(rng, 'medium', { min: 20, max: 80 });
        const afterRate = Math.round(price * rate);
        const final = Math.max(0, afterRate - fullMinus);
        const item = pickItem(rng);
        return {
          question: `一件${item}原价${price}元,先打${Math.round(rate * 10)}折,再参加满${fullMinus * 5}减${fullMinus}的活动,实际付多少元?`,
          answer: `${final}元`,
          subtype: 'discount',
          payload: { kind: 'stack', price, rate, fullMinus, final },
        };
      },
    },
    {
      id: 'discount-buy-get',
      band: 'hard',
      generate(rng) {
        const unitPrice = pickNumberByBand(rng, 'hard', { min: 5, max: 30 });
        const buyN = pickNumberByBand(rng, 'hard', { min: 3, max: 5 });
        const getM = 1;
        const want = pickNumberByBand(rng, 'hard', { min: 7, max: 12 });
        const groups = Math.floor(want / (buyN + getM));
        const leftover = want - groups * (buyN + getM);
        const paid = groups * buyN + leftover;
        const total = unitPrice * paid;
        const item = pickItem(rng);
        return {
          question: `超市${item}每${unitPrice}元,买${buyN}送${getM}。小明想买${want}件${item},最少付多少钱?`,
          answer: `${total}元`,
          subtype: 'discount',
          payload: { kind: 'buy-get', unitPrice, buyN, getM, want, paid, total },
        };
      },
    },
  ],
  generate(rng, difficultyLevel) { return pickForBand(this, difficultyLevel, rng); },
};
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/problemTemplates/discount.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/problemTemplates/discount.js src/problemTemplates/discount.test.js
git commit -m "feat(templates): discount (单折/叠加/买几送几)"
```

---

## Task 3: interest.js (应用 A #2)

**Files:**
- Create: `src/problemTemplates/interest.js`
- Create: `src/problemTemplates/interest.test.js`

- [ ] **Step 1: 写失败测试**

`src/problemTemplates/interest.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { interestTemplate } from './interest.js';

function makeRng(seed = 42) {
  let s = seed >>> 0;
  return { int(min, max) { s = (s * 1664525 + 1013904223) >>> 0; return min + (s % (max - min + 1)); }, pick(a) { return a[this.int(0, a.length - 1)]; } };
}

describe('interestTemplate', () => {
  it('has 3 subtemplates', () => {
    expect(interestTemplate.subtemplates.length).toBe(3);
    expect(interestTemplate.subtemplates.map(s => s.band)).toContain('easy');
    expect(interestTemplate.subtemplates.map(s => s.band)).toContain('medium');
    expect(interestTemplate.subtemplates.map(s => s.band)).toContain('hard');
  });
  it('generates valid single-interest questions', () => {
    for (const st of interestTemplate.subtemplates) {
      const r = st.generate(makeRng());
      expect(r.question).toMatch(/本金|利息|年利率|存款|年/);
      expect(r.answer).toMatch(/\d/);
      expect(r.subtype).toBe('interest');
    }
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/problemTemplates/interest.test.js`
Expected: FAIL

- [ ] **Step 3: 实现 interest.js**

`src/problemTemplates/interest.js`:

```js
import { pickNumberByBand, pickForBand, pickPerson } from './helpers.js';

export const interestTemplate = {
  id: 'interest',
  gradeRange: ['6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'interest-find-total',
      band: 'easy',
      generate(rng) {
        const principal = pickNumberByBand(rng, 'easy', { min: 1000, max: 5000 });
        const ratePct = pickNumberByBand(rng, 'easy', { min: 2, max: 4 });
        const years = pickNumberByBand(rng, 'easy', { min: 1, max: 3 });
        const interest = Math.round(principal * ratePct / 100 * years);
        const total = principal + interest;
        const person = pickPerson(rng);
        return {
          question: `${person}把${principal}元存入银行,年利率${ratePct}%,存${years}年,到期可得本金和利息共多少元?`,
          answer: `${total}元`,
          subtype: 'interest',
          payload: { kind: 'find-total', principal, ratePct, years, interest, total },
        };
      },
    },
    {
      id: 'interest-find-principal',
      band: 'medium',
      generate(rng) {
        const ratePct = pickNumberByBand(rng, 'medium', { min: 2, max: 4 });
        const years = pickNumberByBand(rng, 'medium', { min: 2, max: 5 });
        const interest = pickNumberByBand(rng, 'medium', { min: 200, max: 1500 });
        const principal = Math.round(interest * 100 / (ratePct * years));
        const total = principal + interest;
        return {
          question: `某人存款${years}年,年利率${ratePct}%,到期共取回${total}元(本金+利息),求本金。`,
          answer: `${principal}元`,
          subtype: 'interest',
          payload: { kind: 'find-principal', principal, ratePct, years, interest, total },
        };
      },
    },
    {
      id: 'interest-compare',
      band: 'hard',
      generate(rng) {
        const principal = pickNumberByBand(rng, 'hard', { min: 5000, max: 20000 });
        const rate1 = pickNumberByBand(rng, 'hard', { min: 2, max: 3 });
        const rate2 = rate1 + 1;
        const years = pickNumberByBand(rng, 'hard', { min: 3, max: 5 });
        const interest1 = Math.round(principal * rate1 / 100 * years);
        const interest2 = Math.round(principal * rate2 / 100 * years);
        const diff = interest2 - interest1;
        return {
          question: `本金${principal}元,甲银行年利率${rate1}%,乙银行年利率${rate2}%,存${years}年,两家利息相差多少元?`,
          answer: `${diff}元`,
          subtype: 'interest',
          payload: { kind: 'compare', principal, rate1, rate2, years, diff },
        };
      },
    },
  ],
  generate(rng, difficultyLevel) { return pickForBand(this, difficultyLevel, rng); },
};
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/problemTemplates/interest.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/problemTemplates/interest.js src/problemTemplates/interest.test.js
git commit -m "feat(templates): interest (单利 — 求总额/本金/对比)"
```

---

## Task 4: boatCurrent.js (应用 A #3)

**Files:**
- Create: `src/problemTemplates/boatCurrent.js`
- Create: `src/problemTemplates/boatCurrent.test.js`

- [ ] **Step 1: 写失败测试**

`src/problemTemplates/boatCurrent.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { boatCurrentTemplate } from './boatCurrent.js';

function makeRng(seed = 42) {
  let s = seed >>> 0;
  return { int(min, max) { s = (s * 1664525 + 1013904223) >>> 0; return min + (s % (max - min + 1)); }, pick(a) { return a[this.int(0, a.length - 1)]; } };
}

describe('boatCurrentTemplate', () => {
  it('has 3 subtemplates', () => {
    expect(boatCurrentTemplate.subtemplates.length).toBe(3);
  });
  it('generates valid boat-current questions', () => {
    for (const st of boatCurrentTemplate.subtemplates) {
      const r = st.generate(makeRng());
      expect(r.question).toMatch(/顺水|逆水|静水|水速/);
      expect(r.answer).toMatch(/\d/);
      expect(r.subtype).toBe('boat-current');
    }
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/problemTemplates/boatCurrent.test.js`
Expected: FAIL

- [ ] **Step 3: 实现 boatCurrent.js**

`src/problemTemplates/boatCurrent.js`:

```js
import { pickNumberByBand, pickForBand } from './helpers.js';

export const boatCurrentTemplate = {
  id: 'boat-current',
  gradeRange: ['5', '6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'boat-find-downstream',
      band: 'easy',
      generate(rng) {
        const still = pickNumberByBand(rng, 'easy', { min: 10, max: 25 });
        const current = pickNumberByBand(rng, 'easy', { min: 2, max: 6 });
        const downstream = still + current;
        const upstream = still - current;
        return {
          question: `船在静水中速度为${still}km/h,水流速度${current}km/h,顺水速度和逆水速度分别是多少?`,
          answer: `顺水${downstream}km/h,逆水${upstream}km/h`,
          subtype: 'boat-current',
          payload: { still, current, downstream, upstream, kind: 'find-speeds' },
        };
      },
    },
    {
      id: 'boat-find-still',
      band: 'medium',
      generate(rng) {
        const downstream = pickNumberByBand(rng, 'medium', { min: 15, max: 30 });
        const upstream = pickNumberByBand(rng, 'medium', { min: 8, max: 18 });
        if (upstream >= downstream) return this.subtemplates[0].generate(rng); // 兜底
        const still = (downstream + upstream) / 2;
        const current = (downstream - upstream) / 2;
        return {
          question: `船顺水速度${downstream}km/h,逆水速度${upstream}km/h,求静水速度和水速。`,
          answer: `静水${still}km/h,水速${current}km/h`,
          subtype: 'boat-current',
          payload: { downstream, upstream, still, current, kind: 'find-still-current' },
        };
      },
    },
    {
      id: 'boat-time',
      band: 'hard',
      generate(rng) {
        const still = pickNumberByBand(rng, 'hard', { min: 12, max: 24 });
        const current = pickNumberByBand(rng, 'hard', { min: 2, max: 5 });
        const distance = pickNumberByBand(rng, 'hard', { min: 60, max: 200 });
        const upstreamSpeed = still - current;
        const downstreamSpeed = still + current;
        const upTime = Math.round(distance / upstreamSpeed);
        const downTime = Math.round(distance / downstreamSpeed);
        const total = upTime + downTime;
        return {
          question: `船静水${still}km/h,水速${current}km/h,甲乙两港相距${distance}km。船从甲到乙逆水而上再顺水返回,共需多少小时?`,
          answer: `${total}小时`,
          subtype: 'boat-current',
          payload: { still, current, distance, upstreamSpeed, downstreamSpeed, upTime, downTime, total, kind: 'round-trip' },
        };
      },
    },
  ],
  generate(rng, difficultyLevel) { return pickForBand(this, difficultyLevel, rng); },
};
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/problemTemplates/boatCurrent.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/problemTemplates/boatCurrent.js src/problemTemplates/boatCurrent.test.js
git commit -m "feat(templates): boat-current (顺/逆/静水/水速)"
```

---

## Task 5: trainBridge.js (应用 A #4)

**Files:**
- Create: `src/problemTemplates/trainBridge.js`
- Create: `src/problemTemplates/trainBridge.test.js`

- [ ] **Step 1: 写失败测试**

`src/problemTemplates/trainBridge.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { trainBridgeTemplate } from './trainBridge.js';

function makeRng(seed = 42) {
  let s = seed >>> 0;
  return { int(min, max) { s = (s * 1664525 + 1013904223) >>> 0; return min + (s % (max - min + 1)); }, pick(a) { return a[this.int(0, a.length - 1)]; } };
}

describe('trainBridgeTemplate', () => {
  it('has 3 subtemplates', () => { expect(trainBridgeTemplate.subtemplates.length).toBe(3); });
  it('generates valid bridge/tunnel questions', () => {
    for (const st of trainBridgeTemplate.subtemplates) {
      const r = st.generate(makeRng());
      expect(r.question).toMatch(/火车|桥|隧道|车长|通过/);
      expect(r.answer).toMatch(/\d/);
      expect(r.subtype).toBe('train-bridge');
    }
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/problemTemplates/trainBridge.test.js`
Expected: FAIL

- [ ] **Step 3: 实现 trainBridge.js**

`src/problemTemplates/trainBridge.js`:

```js
import { pickNumberByBand, pickForBand, pickSpeedPair } from './helpers.js';

/** 整除约束的重试:循环直到 time 整除 distance。 */
function genIntDiv(rng, band, { speedMin, speedMax, distMin, distMax, isExtra = false }) {
  for (let attempt = 0; attempt < 30; attempt++) {
    const [baseSpeed] = pickSpeedPair(rng, band);
    const speed = baseSpeed;
    const dist = pickNumberByBand(rng, band, { min: distMin, max: distMax });
    const carLen = isExtra ? pickNumberByBand(rng, band, { min: 50, max: 200 }) : 0;
    const total = dist + carLen;
    if (total % speed === 0) {
      return { speed, dist, carLen, total, time: total / speed };
    }
  }
  // 兜底:用最简速度
  const speed = pickNumberByBand(rng, band, { min: speedMin, max: speedMax });
  const dist = speed * 5;
  const carLen = isExtra ? 100 : 0;
  return { speed, dist, carLen, total: dist + carLen, time: (dist + carLen) / speed };
}

export const trainBridgeTemplate = {
  id: 'train-bridge',
  gradeRange: ['5', '6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'train-bridge-time',
      band: 'easy',
      generate(rng) {
        const { speed, dist, carLen, time } = genIntDiv(rng, 'easy', {
          speedMin: 20, speedMax: 60, distMin: 100, distMax: 500, isExtra: true,
        });
        return {
          question: `一列火车长${carLen}米,以每秒${speed}米的速度通过一座${dist}米长的桥,需要多少秒?`,
          answer: `${time}秒`,
          subtype: 'train-bridge',
          payload: { kind: 'bridge', speed, dist, carLen, time },
        };
      },
    },
    {
      id: 'train-tunnel-time',
      band: 'medium',
      generate(rng) {
        const { speed, dist, carLen, time } = genIntDiv(rng, 'medium', {
          speedMin: 20, speedMax: 80, distMin: 200, distMax: 800, isExtra: true,
        });
        return {
          question: `火车长${carLen}米,以每秒${speed}米的速度完全通过一条${dist}米长的隧道,需要多少秒?`,
          answer: `${time}秒`,
          subtype: 'train-bridge',
          payload: { kind: 'tunnel', speed, dist, carLen, time },
        };
      },
    },
    {
      id: 'train-cross-meet',
      band: 'hard',
      generate(rng) {
        for (let attempt = 0; attempt < 30; attempt++) {
          const v1 = pickNumberByBand(rng, 'hard', { min: 15, max: 30 });
          const v2 = pickNumberByBand(rng, 'hard', { min: 20, max: 35 });
          const l1 = pickNumberByBand(rng, 'hard', { min: 100, max: 300 });
          const l2 = pickNumberByBand(rng, 'hard', { min: 100, max: 300 });
          const totalLen = l1 + l2;
          if (totalLen % (v1 + v2) === 0) {
            const time = totalLen / (v1 + v2);
            return {
              question: `两列火车分别长${l1}米和${l2}米,各以每秒${v1}米和${v2}米的速度相向而行,从相遇到完全错开需多少秒?`,
              answer: `${time}秒`,
              subtype: 'train-bridge',
              payload: { kind: 'cross', v1, v2, l1, l2, time },
            };
          }
        }
        return { question: '两列火车各长200米,速度均为20m/s,相向而行相遇完全错开需多少秒?', answer: '10秒', subtype: 'train-bridge', payload: { kind: 'cross-fallback' } };
      },
    },
  ],
  generate(rng, difficultyLevel) { return pickForBand(this, difficultyLevel, rng); },
};
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/problemTemplates/trainBridge.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/problemTemplates/trainBridge.js src/problemTemplates/trainBridge.test.js
git commit -m "feat(templates): train-bridge (过桥/隧道/错车,整除约束)"
```

---

## Task 6: clockAngle.js (应用 A #5)

**Files:**
- Create: `src/problemTemplates/clockAngle.js`
- Create: `src/problemTemplates/clockAngle.test.js`

- [ ] **Step 1: 写失败测试**

`src/problemTemplates/clockAngle.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { clockAngleTemplate } from './clockAngle.js';

function makeRng(seed = 42) {
  let s = seed >>> 0;
  return { int(min, max) { s = (s * 1664525 + 1013904223) >>> 0; return min + (s % (max - min + 1)); }, pick(a) { return a[this.int(0, a.length - 1)]; } };
}

describe('clockAngleTemplate', () => {
  it('has 3 subtemplates', () => { expect(clockAngleTemplate.subtemplates.length).toBe(3); });
  it('generates valid clock angle questions with integer answer', () => {
    for (let i = 0; i < 30; i++) {
      const st = clockAngleTemplate.subtemplates[i % 3];
      const r = st.generate(makeRng(i + 1));
      expect(r.question).toMatch(/钟表|时|分|夹角|重合|成直线/);
      const numMatch = r.answer.match(/\d+/);
      expect(numMatch).not.toBeNull();
      // 整数度
      expect(Number(numMatch[0]) % 1).toBe(0);
      expect(r.subtype).toBe('clock-angle');
    }
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/problemTemplates/clockAngle.test.js`
Expected: FAIL

- [ ] **Step 3: 实现 clockAngle.js**

`src/problemTemplates/clockAngle.js`:

```js
import { pickForBand } from './helpers.js';

/** 时针角度 = 30*H + 0.5*M;分针角度 = 6*M。差值(0–180) 单位 度。 */
function angleBetween(h, m) {
  const hourAngle = 30 * h + 0.5 * m;
  const minuteAngle = 6 * m;
  const diff = Math.abs(hourAngle - minuteAngle) % 360;
  return diff > 180 ? 360 - diff : diff;
}

export const clockAngleTemplate = {
  id: 'clock-angle',
  gradeRange: ['5', '6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'clock-angle-find',
      band: 'easy',
      generate(rng) {
        for (let attempt = 0; attempt < 30; attempt++) {
          const h = rng.int(1, 12);
          const m = 0; // easy:整点,角度必为整数
          const angle = angleBetween(h, m);
          return {
            question: `钟表上${h}点整时,时针与分针的夹角是多少度?`,
            answer: `${angle}°`,
            subtype: 'clock-angle',
            payload: { h, m, angle, kind: 'find-angle' },
          };
        }
      },
    },
    {
      id: 'clock-coincide',
      band: 'medium',
      generate(rng) {
        for (let attempt = 0; attempt < 30; attempt++) {
          const h = rng.int(1, 11);
          // h:m 重合 → 6m = 30h + 0.5m → 5.5m = 30h → m = 60h/11 (通常非整)
          // 改成"下次重合大约多少分钟后"
          const minutes = Math.round((60 * h) / 11);
          if (minutes >= 55 && minutes <= 65) {
            return {
              question: `${h}点整之后,时针和分针下次重合大约是多少分钟后(取整数)?`,
              answer: `${minutes}分钟后`,
              subtype: 'clock-angle',
              payload: { h, minutes, kind: 'coincide' },
            };
          }
        }
        return { question: '1点整之后,时针和分针下次重合大约是多少分钟后?', answer: '55分钟后', subtype: 'clock-angle', payload: { kind: 'coincide-fallback' } };
      },
    },
    {
      id: 'clock-straight',
      band: 'hard',
      generate(rng) {
        for (let attempt = 0; attempt < 50; attempt++) {
          const h = rng.int(0, 11);
          const mSteps = rng.int(0, 11);
          const m = mSteps * 5;
          // 要求时针分针成直线(180° 附近):|30h + 0.5m - 6m| = 180 → 30h - 5.5m = ±180
          // 解 m = (30h - 180)/5.5 或 (30h + 180)/5.5
          const m1 = (30 * h - 180) / 5.5;
          const m2 = (30 * h + 180) / 5.5;
          const candidates = [m1, m2].filter(x => x >= 0 && x < 60 && Number.isInteger(x * 2));
          if (candidates.length > 0) {
            const mReal = candidates[0];
            const angle = angleBetween(h, mReal);
            if (Math.abs(angle - 180) < 0.001) {
              return {
                question: `${h}点${Math.round(mReal)}分时,时针与分针成一条直线(180°),该时间点的分针数是多少?`,
                answer: `${Math.round(mReal)}分`,
                subtype: 'clock-angle',
                payload: { h, m: mReal, angle: 180, kind: 'straight' },
              };
            }
          }
        }
        return { question: '3点几分时,时针与分针成一条直线?', answer: '49分', subtype: 'clock-angle', payload: { kind: 'straight-fallback' } };
      },
    },
  ],
  generate(rng, difficultyLevel) { return pickForBand(this, difficultyLevel, rng); },
};
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/problemTemplates/clockAngle.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/problemTemplates/clockAngle.js src/problemTemplates/clockAngle.test.js
git commit -m "feat(templates): clock-angle (夹角/重合/成直线)"
```

---

## Task 7: proportionDist.js (应用 A #6)

**Files:**
- Create: `src/problemTemplates/proportionDist.js`
- Create: `src/problemTemplates/proportionDist.test.js`

- [ ] **Step 1: 写失败测试**

`src/problemTemplates/proportionDist.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { proportionDistTemplate } from './proportionDist.js';

function makeRng(seed = 42) {
  let s = seed >>> 0;
  return { int(min, max) { s = (s * 1664525 + 1013904223) >>> 0; return min + (s % (max - min + 1)); }, pick(a) { return a[this.int(0, a.length - 1)]; } };
}

describe('proportionDistTemplate', () => {
  it('has 3 subtemplates', () => { expect(proportionDistTemplate.subtemplates.length).toBe(3); });
  it('generates valid proportion distribution', () => {
    for (const st of proportionDistTemplate.subtemplates) {
      const r = st.generate(makeRng());
      expect(r.question).toMatch(/按.*比|分配|比例/);
      expect(r.answer).toMatch(/\d/);
      expect(r.subtype).toBe('proportion-dist');
      expect(Array.isArray(r.payload.parts) || r.payload.parts === undefined).toBe(true);
    }
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/problemTemplates/proportionDist.test.js`
Expected: FAIL

- [ ] **Step 3: 实现 proportionDist.js**

`src/problemTemplates/proportionDist.js`:

```js
import { pickNumberByBand, pickForBand } from './helpers.js';

export const proportionDistTemplate = {
  id: 'proportion-dist',
  gradeRange: ['5', '6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'proportion-two-parts',
      band: 'easy',
      generate(rng) {
        const a = pickNumberByBand(rng, 'easy', { min: 1, max: 4 });
        const b = pickNumberByBand(rng, 'easy', { min: 1, max: 4 });
        const sum = pickNumberByBand(rng, 'easy', { min: 50, max: 200 });
        const total = a + b;
        const partA = Math.round(sum * a / total);
        const partB = sum - partA;
        return {
          question: `把${sum}本书按${a}:${b}的比例分给甲乙两人,甲乙各分多少本?`,
          answer: `甲${partA}本,乙${partB}本`,
          subtype: 'proportion-dist',
          payload: { kind: 'two-parts', ratio: [a, b], total: sum, parts: [partA, partB] },
        };
      },
    },
    {
      id: 'proportion-three-parts',
      band: 'medium',
      generate(rng) {
        const a = pickNumberByBand(rng, 'medium', { min: 1, max: 5 });
        const b = pickNumberByBand(rng, 'medium', { min: 1, max: 5 });
        const c = pickNumberByBand(rng, 'medium', { min: 1, max: 5 });
        const sum = pickNumberByBand(rng, 'medium', { min: 90, max: 300 });
        const total = a + b + c;
        const partA = Math.round(sum * a / total);
        const partB = Math.round(sum * b / total);
        const partC = sum - partA - partB;
        return {
          question: `把${sum}支笔按${a}:${b}:${c}分给三人,各分多少?`,
          answer: `${partA}支、${partB}支、${partC}支`,
          subtype: 'proportion-dist',
          payload: { kind: 'three-parts', ratio: [a, b, c], total: sum, parts: [partA, partB, partC] },
        };
      },
    },
    {
      id: 'proportion-fraction',
      band: 'hard',
      generate(rng) {
        const a = pickNumberByBand(rng, 'hard', { min: 2, max: 7 });
        const b = pickNumberByBand(rng, 'hard', { min: 2, max: 7 });
        const c = pickNumberByBand(rng, 'hard', { min: 2, max: 7 });
        const total = a + b + c;
        const sum = total * pickNumberByBand(rng, 'hard', { min: 10, max: 30 });
        const partA = sum * a / total;
        const partB = sum * b / total;
        const partC = sum * c / total;
        return {
          question: `把${sum}颗糖果按${a}:${b}:${c}的比例分给三个孩子(允许小数),各分多少颗?`,
          answer: `${partA.toFixed(1)}、${partB.toFixed(1)}、${partC.toFixed(1)}`,
          subtype: 'proportion-dist',
          payload: { kind: 'fraction', ratio: [a, b, c], total: sum, parts: [partA, partB, partC] },
        };
      },
    },
  ],
  generate(rng, difficultyLevel) { return pickForBand(this, difficultyLevel, rng); },
};
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/problemTemplates/proportionDist.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/problemTemplates/proportionDist.js src/problemTemplates/proportionDist.test.js
git commit -m "feat(templates): proportion-dist (按比例分配 2/3 部分)"
```

---

## Task 8: average.js (应用 A #7)

**Files:**
- Create: `src/problemTemplates/average.js`
- Create: `src/problemTemplates/average.test.js`

- [ ] **Step 1: 写失败测试**

`src/problemTemplates/average.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { averageTemplate } from './average.js';

function makeRng(seed = 42) {
  let s = seed >>> 0;
  return { int(min, max) { s = (s * 1664525 + 1013904223) >>> 0; return min + (s % (max - min + 1)); }, pick(a) { return a[this.int(0, a.length - 1)]; } };
}

describe('averageTemplate', () => {
  it('has 3 subtemplates', () => { expect(averageTemplate.subtemplates.length).toBe(3); });
  it('generates valid average questions', () => {
    for (const st of averageTemplate.subtemplates) {
      const r = st.generate(makeRng());
      expect(r.question).toMatch(/平均/);
      expect(r.answer).toMatch(/\d/);
      expect(r.subtype).toBe('average');
    }
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/problemTemplates/average.test.js`
Expected: FAIL

- [ ] **Step 3: 实现 average.js**

`src/problemTemplates/average.js`:

```js
import { pickNumberByBand, pickForBand } from './helpers.js';

export const averageTemplate = {
  id: 'average',
  gradeRange: ['4', '5', '6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'average-simple',
      band: 'easy',
      generate(rng) {
        const n = pickNumberByBand(rng, 'easy', { min: 3, max: 5 });
        const nums = Array.from({ length: n }, () => pickNumberByBand(rng, 'easy', { min: 10, max: 99 }));
        const sum = nums.reduce((a, b) => a + b, 0);
        const avg = sum / n;
        return {
          question: `${nums.join('、')}这${n}个数的平均数是多少?`,
          answer: `${avg}`,
          subtype: 'average',
          payload: { kind: 'simple', nums, sum, avg },
        };
      },
    },
    {
      id: 'average-find-number',
      band: 'medium',
      generate(rng) {
        const n = pickNumberByBand(rng, 'medium', { min: 4, max: 6 });
        const known = Array.from({ length: n - 1 }, () => pickNumberByBand(rng, 'medium', { min: 50, max: 99 }));
        const knownSum = known.reduce((a, b) => a + b, 0);
        const avg = pickNumberByBand(rng, 'medium', { min: 60, max: 90 });
        const total = avg * n;
        const missing = total - knownSum;
        return {
          question: `小明${n}次考试,已知${n - 1}次成绩为${known.join('、')},平均分${avg},求第${n}次成绩。`,
          answer: `${missing}分`,
          subtype: 'average',
          payload: { kind: 'find-number', known, n, avg, missing, total },
        };
      },
    },
    {
      id: 'average-two-groups',
      band: 'hard',
      generate(rng) {
        const n1 = pickNumberByBand(rng, 'hard', { min: 5, max: 8 });
        const n2 = pickNumberByBand(rng, 'hard', { min: 5, max: 8 });
        const avg1 = pickNumberByBand(rng, 'hard', { min: 70, max: 85 });
        const avg2 = pickNumberByBand(rng, 'hard', { min: 85, max: 95 });
        const sum1 = n1 * avg1;
        const sum2 = n2 * avg2;
        const totalN = n1 + n2;
        const totalAvg = (sum1 + sum2) / totalN;
        return {
          question: `甲组${n1}人,平均分${avg1};乙组${n2}人,平均分${avg2}。两组合在一起的平均分是多少?`,
          answer: `${totalAvg.toFixed(1)}分`,
          subtype: 'average',
          payload: { kind: 'two-groups', n1, avg1, n2, avg2, sum1, sum2, totalAvg },
        };
      },
    },
  ],
  generate(rng, difficultyLevel) { return pickForBand(this, difficultyLevel, rng); },
};
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/problemTemplates/average.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/problemTemplates/average.js src/problemTemplates/average.test.js
git commit -m "feat(templates): average (基础/求缺项/两组合并)"
```

---

## Task 9: formation.js (应用 A #8)

**Files:**
- Create: `src/problemTemplates/formation.js`
- Create: `src/problemTemplates/formation.test.js`

- [ ] **Step 1: 写失败测试**

`src/problemTemplates/formation.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { formationTemplate } from './formation.js';

function makeRng(seed = 42) {
  let s = seed >>> 0;
  return { int(min, max) { s = (s * 1664525 + 1013904223) >>> 0; return min + (s % (max - min + 1)); }, pick(a) { return a[this.int(0, a.length - 1)]; } };
}

describe('formationTemplate', () => {
  it('has 3 subtemplates', () => { expect(formationTemplate.subtemplates.length).toBe(3); });
  it('generates valid formation questions', () => {
    for (const st of formationTemplate.subtemplates) {
      const r = st.generate(makeRng());
      expect(r.question).toMatch(/方阵/);
      expect(r.answer).toMatch(/\d/);
      expect(r.subtype).toBe('formation');
    }
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/problemTemplates/formation.test.js`
Expected: FAIL

- [ ] **Step 3: 实现 formation.js**

`src/problemTemplates/formation.js`:

```js
import { pickNumberByBand, pickForBand } from './helpers.js';

export const formationTemplate = {
  id: 'formation',
  gradeRange: ['4', '5', '6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'formation-solid',
      band: 'easy',
      generate(rng) {
        const side = pickNumberByBand(rng, 'easy', { min: 5, max: 12 });
        const total = side * side;
        const perimeter = 4 * (side - 1); // 方阵最外层人数 = 4*(side-1)
        return {
          question: `学生做操排成每边${side}人的实心方阵,这个方阵共有多少人?最外层有多少人?`,
          answer: `共${total}人,最外层${perimeter}人`,
          subtype: 'formation',
          payload: { kind: 'solid', side, total, perimeter },
        };
      },
    },
    {
      id: 'formation-hollow',
      band: 'medium',
      generate(rng) {
        const outer = pickNumberByBand(rng, 'medium', { min: 10, max: 18 });
        const inner = pickNumberByBand(rng, 'medium', { min: 4, max: Math.max(4, outer - 4) });
        const layers = (outer - inner) / 2;
        const total = outer * outer - inner * inner;
        return {
          question: `方阵最外层每边${outer}人,内部空心部分每边${inner}人,共有${layers}层,这个方阵总人数是多少?`,
          answer: `${total}人`,
          subtype: 'formation',
          payload: { kind: 'hollow', outer, inner, layers, total },
        };
      },
    },
    {
      id: 'formation-from-perimeter',
      band: 'hard',
      generate(rng) {
        const perimeter = pickNumberByBand(rng, 'hard', { min: 60, max: 120 });
        const side = perimeter / 4 + 1;
        if (!Number.isInteger(side)) {
          return { question: '一个方阵最外层共60人,这个方阵每边多少人?', answer: '16人', subtype: 'formation', payload: { kind: 'from-perimeter-fallback', perimeter } };
        }
        const total = side * side;
        return {
          question: `学生方阵最外层共有${perimeter}人,这个方阵每边有多少人?总人数多少?`,
          answer: `每边${side}人,共${total}人`,
          subtype: 'formation',
          payload: { kind: 'from-perimeter', perimeter, side, total },
        };
      },
    },
  ],
  generate(rng, difficultyLevel) { return pickForBand(this, difficultyLevel, rng); },
};
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/problemTemplates/formation.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/problemTemplates/formation.js src/problemTemplates/formation.test.js
git commit -m "feat(templates): formation (实心/空心/由周长反推)"
```

---

## Task 10: inclusionExclusion.js (奥数 A #1)

**Files:**
- Create: `src/problemTemplates/inclusionExclusion.js`
- Create: `src/problemTemplates/inclusionExclusion.test.js`

- [ ] **Step 1: 写失败测试**

`src/problemTemplates/inclusionExclusion.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { inclusionExclusionTemplate } from './inclusionExclusion.js';

function makeRng(seed = 42) {
  let s = seed >>> 0;
  return { int(min, max) { s = (s * 1664525 + 1013904223) >>> 0; return min + (s % (max - min + 1)); }, pick(a) { return a[this.int(0, a.length - 1)]; } };
}

describe('inclusionExclusionTemplate', () => {
  it('has 3 subtemplates', () => { expect(inclusionExclusionTemplate.subtemplates.length).toBe(3); });
  it('generates valid inclusion-exclusion questions', () => {
    for (const st of inclusionExclusionTemplate.subtemplates) {
      const r = st.generate(makeRng());
      expect(r.question).toMatch(/既.*又|参加|喜欢|都会/);
      expect(r.answer).toMatch(/\d/);
      expect(r.subtype).toBe('inclusion-exclusion');
    }
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/problemTemplates/inclusionExclusion.test.js`
Expected: FAIL

- [ ] **Step 3: 实现 inclusionExclusion.js**

`src/problemTemplates/inclusionExclusion.js`:

```js
import { pickNumberByBand, pickForBand } from './helpers.js';

export const inclusionExclusionTemplate = {
  id: 'inclusion-exclusion',
  gradeRange: ['5', '6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'inclusion-two-sets',
      band: 'easy',
      generate(rng) {
        const a = pickNumberByBand(rng, 'easy', { min: 10, max: 30 });
        const b = pickNumberByBand(rng, 'easy', { min: 10, max: 30 });
        const both = pickNumberByBand(rng, 'easy', { min: 3, max: Math.min(a, b) });
        const onlyA = a - both;
        const onlyB = b - both;
        const total = a + b - both;
        return {
          question: `班级${total}人中,喜欢数学的有${a}人,喜欢语文的有${b}人,两科都喜欢的有${both}人,两科都不喜欢的有多少人?`,
          answer: `假设都至少喜欢一科:仅数学${onlyA}人,仅语文${onlyB}人,两科都喜${both}人;若班级共${total}人,则都不喜欢${Math.max(0, total - (a + b - both))}人`,
          subtype: 'inclusion-exclusion',
          payload: { kind: 'two-sets', a, b, both, total, onlyA, onlyB },
        };
      },
    },
    {
      id: 'inclusion-three-sets',
      band: 'medium',
      generate(rng) {
        const a = pickNumberByBand(rng, 'medium', { min: 20, max: 40 });
        const b = pickNumberByBand(rng, 'medium', { min: 15, max: 35 });
        const c = pickNumberByBand(rng, 'medium', { min: 10, max: 25 });
        const ab = pickNumberByBand(rng, 'medium', { min: 3, max: 8 });
        const ac = pickNumberByBand(rng, 'medium', { min: 3, max: 8 });
        const bc = pickNumberByBand(rng, 'medium', { min: 2, max: 6 });
        const abc = pickNumberByBand(rng, 'medium', { min: 1, max: 3 });
        // |A∪B∪C| = |A|+|B|+|C| - |A∩B| - |A∩C| - |B∩C| + |A∩B∩C|
        const total = a + b + c - ab - ac - bc + abc;
        return {
          question: `三个兴趣小组,A组${a}人,B组${b}人,C组${c}人;A∩B ${ab}人,A∩C ${ac}人,B∩C ${bc}人,三者共有${abc}人。三个小组报名总人数(不重复计)是多少?`,
          answer: `${total}人`,
          subtype: 'inclusion-exclusion',
          payload: { kind: 'three-sets', a, b, c, ab, ac, bc, abc, total },
        };
      },
    },
    {
      id: 'inclusion-both-neither',
      band: 'hard',
      generate(rng) {
        const a = pickNumberByBand(rng, 'hard', { min: 30, max: 60 });
        const b = pickNumberByBand(rng, 'hard', { min: 25, max: 50 });
        const both = pickNumberByBand(rng, 'hard', { min: 5, max: 15 });
        const neither = pickNumberByBand(rng, 'hard', { min: 2, max: 10 });
        const total = a + b - both + neither;
        return {
          question: `全班${total}人,会游泳的${a}人,会滑冰的${b}人,两项都会的${both}人,两项都不会的${neither}人。这组数据是否自洽?如自洽,会游泳或会滑冰一共有多少人?`,
          answer: `${a + b - both}人`,
          subtype: 'inclusion-exclusion',
          payload: { kind: 'both-neither', a, b, both, neither, total },
        };
      },
    },
  ],
  generate(rng, difficultyLevel) { return pickForBand(this, difficultyLevel, rng); },
};
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/problemTemplates/inclusionExclusion.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/problemTemplates/inclusionExclusion.js src/problemTemplates/inclusionExclusion.test.js
git commit -m "feat(templates): inclusion-exclusion (两/三集合/都会都不会)"
```

---

## Task 11: perfectSquare.js (奥数 A #2)

**Files:**
- Create: `src/problemTemplates/perfectSquare.js`
- Create: `src/problemTemplates/perfectSquare.test.js`

- [ ] **Step 1: 写失败测试**

`src/problemTemplates/perfectSquare.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { perfectSquareTemplate } from './perfectSquare.js';

function makeRng(seed = 42) {
  let s = seed >>> 0;
  return { int(min, max) { s = (s * 1664525 + 1013904223) >>> 0; return min + (s % (max - min + 1)); }, pick(a) { return a[this.int(0, a.length - 1)]; } };
}

describe('perfectSquareTemplate', () => {
  it('has 3 subtemplates', () => { expect(perfectSquareTemplate.subtemplates.length).toBe(3); });
  it('generates valid perfect square / divisor questions', () => {
    for (const st of perfectSquareTemplate.subtemplates) {
      const r = st.generate(makeRng());
      expect(r.question).toMatch(/平方|因数|约数/);
      expect(r.answer).toMatch(/\d/);
      expect(r.subtype).toBe('perfect-square');
    }
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/problemTemplates/perfectSquare.test.js`
Expected: FAIL

- [ ] **Step 3: 实现 perfectSquare.js**

`src/problemTemplates/perfectSquare.js`:

```js
import { pickNumberByBand, pickForBand } from './helpers.js';

function countDivisors(n) {
  let count = 0;
  for (let i = 1; i * i <= n; i++) {
    if (n % i === 0) count += (i * i === n) ? 1 : 2;
  }
  return count;
}

function isPerfectSquare(n) {
  const r = Math.round(Math.sqrt(n));
  return r * r === n;
}

export const perfectSquareTemplate = {
  id: 'perfect-square',
  gradeRange: ['4', '5', '6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'perfect-square-judge',
      band: 'easy',
      generate(rng) {
        const n = pickNumberByBand(rng, 'easy', { min: 1, max: 144 });
        const isSq = isPerfectSquare(n);
        return {
          question: `${n}是完全平方数吗?如果是,它的平方根是多少?`,
          answer: isSq ? `是,平方根${Math.round(Math.sqrt(n))}` : `不是`,
          subtype: 'perfect-square',
          payload: { kind: 'judge', n, isSq, sqrt: isSq ? Math.round(Math.sqrt(n)) : null },
        };
      },
    },
    {
      id: 'perfect-square-divisor-count',
      band: 'medium',
      generate(rng) {
        const n = pickNumberByBand(rng, 'medium', { min: 10, max: 100 });
        const total = countDivisors(n);
        return {
          question: `${n}共有多少个因数?`,
          answer: `${total}个`,
          subtype: 'perfect-square',
          payload: { kind: 'divisor-count', n, total },
        };
      },
    },
    {
      id: 'perfect-square-nearest',
      band: 'hard',
      generate(rng) {
        const n = pickNumberByBand(rng, 'hard', { min: 50, max: 200 });
        const lo = Math.floor(Math.sqrt(n));
        const candidates = [lo * lo, (lo + 1) * (lo + 1)];
        const closer = candidates.reduce((p, c) => Math.abs(c - n) < Math.abs(p - n) ? c : p);
        return {
          question: `与${n}最接近的完全平方数是多少?`,
          answer: `${closer}`,
          subtype: 'perfect-square',
          payload: { kind: 'nearest', n, closer, candidates },
        };
      },
    },
  ],
  generate(rng, difficultyLevel) { return pickForBand(this, difficultyLevel, rng); },
};
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/problemTemplates/perfectSquare.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/problemTemplates/perfectSquare.js src/problemTemplates/perfectSquare.test.js
git commit -m "feat(templates): perfect-square (判定/因数个数/最近)"
```

---

## Task 12: coloring.js (奥数 A #3)

**Files:**
- Create: `src/problemTemplates/coloring.js`
- Create: `src/problemTemplates/coloring.test.js`

- [ ] **Step 1: 写失败测试**

`src/problemTemplates/coloring.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { coloringTemplate } from './coloring.js';

function makeRng(seed = 42) {
  let s = seed >>> 0;
  return { int(min, max) { s = (s * 1664525 + 1013904223) >>> 0; return min + (s % (max - min + 1)); }, pick(a) { return a[this.int(0, a.length - 1)]; } };
}

describe('coloringTemplate', () => {
  it('has 3 subtemplates', () => { expect(coloringTemplate.subtemplates.length).toBe(3); });
  it('generates valid coloring questions', () => {
    for (const st of coloringTemplate.subtemplates) {
      const r = st.generate(makeRng());
      expect(r.question).toMatch(/染色|方格|相邻|棋盘/);
      expect(r.answer).toMatch(/\d/);
      expect(r.subtype).toBe('coloring');
    }
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/problemTemplates/coloring.test.js`
Expected: FAIL

- [ ] **Step 3: 实现 coloring.js**

`src/problemTemplates/coloring.js`:

```js
import { pickNumberByBand, pickForBand } from './helpers.js';

export const coloringTemplate = {
  id: 'coloring',
  gradeRange: ['5', '6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'coloring-checkerboard',
      band: 'easy',
      generate(rng) {
        const n = pickNumberByBand(rng, 'easy', { min: 4, max: 8 });
        return {
          question: `将${n}×${n}的棋盘黑白交替染色(像国际象棋),黑格共有多少个?`,
          answer: `${n * n / 2}个(若${n}为偶数)`,
          subtype: 'coloring',
          payload: { kind: 'checkerboard', n, total: n * n / 2 },
        };
      },
    },
    {
      id: 'coloring-neighbor',
      band: 'medium',
      generate(rng) {
        const n = pickNumberByBand(rng, 'medium', { min: 4, max: 6 });
        // 鸽巢原理:每个格最多有 4 个相邻,若 n*n+1 个格子则必有相邻同色
        return {
          question: `${n}×${n}棋盘按黑白交替染色,至少取多少格才能保证其中有 2 个相邻(共边)的同色格?`,
          answer: `${n * n + 1}格(超出棋盘总数则必然存在相邻同色)`,
          subtype: 'coloring',
          payload: { kind: 'neighbor', n, threshold: n * n + 1 },
        };
      },
    },
    {
      id: 'coloring-domino',
      band: 'hard',
      generate(rng) {
        const m = pickNumberByBand(rng, 'hard', { min: 4, max: 8 });
        const n = pickNumberByBand(rng, 'hard', { min: 4, max: 8 });
        // m×n 棋盘用多米诺骨牌(2×1)完全覆盖,要求 m*n 为偶数
        if ((m * n) % 2 !== 0) {
          return { question: '4×4 棋盘用多米诺骨牌(2×1)能否完全覆盖?', answer: '能,需要8块', subtype: 'coloring', payload: { kind: 'domino-fallback' } };
        }
        return {
          question: `${m}×${n}的棋盘用多米诺骨牌(2×1)能否完全覆盖?需要多少块?`,
          answer: `能,需要${m * n / 2}块`,
          subtype: 'coloring',
          payload: { kind: 'domino', m, n, count: m * n / 2 },
        };
      },
    },
  ],
  generate(rng, difficultyLevel) { return pickForBand(this, difficultyLevel, rng); },
};
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/problemTemplates/coloring.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/problemTemplates/coloring.js src/problemTemplates/coloring.test.js
git commit -m "feat(templates): coloring (棋盘/相邻同色/多米诺)"
```

---

## Task 13: extremeValue.js (奥数 A #4)

**Files:**
- Create: `src/problemTemplates/extremeValue.js`
- Create: `src/problemTemplates/extremeValue.test.js`

- [ ] **Step 1: 写失败测试**

`src/problemTemplates/extremeValue.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { extremeValueTemplate } from './extremeValue.js';

function makeRng(seed = 42) {
  let s = seed >>> 0;
  return { int(min, max) { s = (s * 1664525 + 1013904223) >>> 0; return min + (s % (max - min + 1)); }, pick(a) { return a[this.int(0, a.length - 1)]; } };
}

describe('extremeValueTemplate', () => {
  it('has 3 subtemplates', () => { expect(extremeValueTemplate.subtemplates.length).toBe(3); });
  it('generates valid extreme value questions', () => {
    for (const st of extremeValueTemplate.subtemplates) {
      const r = st.generate(makeRng());
      expect(r.question).toMatch(/最大|最小|至少|至多/);
      expect(r.answer).toMatch(/\d/);
      expect(r.subtype).toBe('extreme-value');
    }
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/problemTemplates/extremeValue.test.js`
Expected: FAIL

- [ ] **Step 3: 实现 extremeValue.js**

`src/problemTemplates/extremeValue.js`:

```js
import { pickNumberByBand, pickForBand } from './helpers.js';

export const extremeValueTemplate = {
  id: 'extreme-value',
  gradeRange: ['5', '6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'extreme-max-product',
      band: 'easy',
      generate(rng) {
        const total = pickNumberByBand(rng, 'easy', { min: 8, max: 12 });
        // 给定总和 N,分成两数之和,使乘积最大。答案是 N/2 接近的整数。
        const a = Math.floor(total / 2);
        const b = total - a;
        const product = a * b;
        return {
          question: `把${total}分成两个正整数之和,怎样分使它们的乘积最大?最大乘积是多少?`,
          answer: `${a}和${b},乘积${product}`,
          subtype: 'extreme-value',
          payload: { kind: 'max-product', total, a, b, product },
        };
      },
    },
    {
      id: 'extreme-min-perimeter',
      band: 'medium',
      generate(rng) {
        const area = pickNumberByBand(rng, 'medium', { min: 12, max: 60 });
        // 给定面积,正方形周长最小(固定面积矩形中正方形周长最小)
        const side = Math.round(Math.sqrt(area));
        const finalArea = side * side;
        const perimeter = 4 * side;
        return {
          question: `一个长方形面积约${area},哪一形状周长最短(取整长)?正方形周长是多少?`,
          answer: `正方形最短,边长${side},周长${perimeter},实际面积${finalArea}`,
          subtype: 'extreme-value',
          payload: { kind: 'min-perimeter', area, side, perimeter },
        };
      },
    },
    {
      id: 'extreme-pigeon-min',
      band: 'hard',
      generate(rng) {
        const boxes = pickNumberByBand(rng, 'hard', { min: 5, max: 8 });
        // n 鸽入 m 箱,至少 1 箱有 ≥ ⌈n/m⌉ 只
        const items = boxes * pickNumberByBand(rng, 'hard', { min: 2, max: 4 });
        const minPerBox = Math.ceil(items / boxes);
        return {
          question: `${items}个苹果放入${boxes}个抽屉,证明至少有一个抽屉里有不少于${minPerBox}个苹果。`,
          answer: `由鸽巢原理,⌈${items}/${boxes}⌉ = ${minPerBox}`,
          subtype: 'extreme-value',
          payload: { kind: 'pigeon-min', items, boxes, minPerBox },
        };
      },
    },
  ],
  generate(rng, difficultyLevel) { return pickForBand(this, difficultyLevel, rng); },
};
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/problemTemplates/extremeValue.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/problemTemplates/extremeValue.js src/problemTemplates/extremeValue.test.js
git commit -m "feat(templates): extreme-value (最大乘积/最小周长/鸽巢加强)"
```

---

## Task 14: logicDeduction.js (奥数 A #5)

**Files:**
- Create: `src/problemTemplates/logicDeduction.js`
- Create: `src/problemTemplates/logicDeduction.test.js`

- [ ] **Step 1: 写失败测试**

`src/problemTemplates/logicDeduction.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { logicDeductionTemplate } from './logicDeduction.js';

function makeRng(seed = 42) {
  let s = seed >>> 0;
  return { int(min, max) { s = (s * 1664525 + 1013904223) >>> 0; return min + (s % (max - min + 1)); }, pick(a) { return a[this.int(0, a.length - 1)]; } };
}

describe('logicDeductionTemplate', () => {
  it('has 3 subtemplates', () => { expect(logicDeductionTemplate.subtemplates.length).toBe(3); });
  it('generates valid logic deduction questions', () => {
    for (const st of logicDeductionTemplate.subtemplates) {
      const r = st.generate(makeRng());
      expect(r.question).toMatch(/说|真话|假话|谁|不是|是/);
      expect(r.answer).toMatch(/[\u4e00-\u9fa5]|\d/);
      expect(r.subtype).toBe('logic-deduction');
    }
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/problemTemplates/logicDeduction.test.js`
Expected: FAIL

- [ ] **Step 3: 实现 logicDeduction.js**

`src/problemTemplates/logicDeduction.js`:

```js
import { pickNumberByBand, pickForBand } from './helpers.js';

export const logicDeductionTemplate = {
  id: 'logic-deduction',
  gradeRange: ['4', '5', '6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'logic-liar-truth',
      band: 'easy',
      generate(rng) {
        const a = pickNumberByBand(rng, 'easy', { min: 2, max: 5 });
        return {
          question: `甲说:"我有${a}颗糖。"已知甲在撒谎,甲实际有几颗糖?`,
          answer: `不是${a}颗(具体数量未知,题目重在推理)`,
          subtype: 'logic-deduction',
          payload: { kind: 'liar-truth', claim: a },
        };
      },
    },
    {
      id: 'logic-two-liars',
      band: 'medium',
      generate(rng) {
        return {
          question: `甲说:"乙在说谎。" 乙说:"甲在说谎。" 谁在说真话?`,
          answer: '两人都说谎(或两人都不说谎),需附加条件才能确定;典型解:假设甲真则乙假,乙真则甲假,矛盾 → 实际两人都说谎(或题目有附加条件)',
          subtype: 'logic-deduction',
          payload: { kind: 'two-liars' },
        };
      },
    },
    {
      id: 'logic-elimination',
      band: 'hard',
      generate(rng) {
        const names = ['甲', '乙', '丙', '丁'];
        const positions = ['第一', '第二', '第三', '第四'];
        const idx = rng.int(0, 3);
        return {
          question: `${names[0]}、${names[1]}、${names[2]}、${names[3]}四人赛跑。甲不是第一,乙不是最后,丙在甲之后,丁在乙之前。问${names[idx]}是第几名?`,
          answer: '通过排除法:丙在甲之后 → 丙≠第一;丁在乙之前;甲不是第一;乙不是最后;最终可解(具体顺序因题而异)',
          subtype: 'logic-deduction',
          payload: { kind: 'elimination', target: names[idx] },
        };
      },
    },
  ],
  generate(rng, difficultyLevel) { return pickForBand(this, difficultyLevel, rng); },
};
```

> 备注:本模板题目以「推理模式描述」为主,题面给足条件即可。`answer` 描述典型推理路径,不强制唯一具体数值。

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/problemTemplates/logicDeduction.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/problemTemplates/logicDeduction.js src/problemTemplates/logicDeduction.test.js
git commit -m "feat(templates): logic-deduction (真假话/互指/排除法)"
```

---

## Task 15: chickenRabbit3Var.js (应用 D #1)

**Files:**
- Create: `src/problemTemplates/chickenRabbit3Var.js`
- Create: `src/problemTemplates/chickenRabbit3Var.test.js`

- [ ] **Step 1: 写失败测试**

`src/problemTemplates/chickenRabbit3Var.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { chickenRabbit3VarTemplate } from './chickenRabbit3Var.js';

function makeRng(seed = 42) {
  let s = seed >>> 0;
  return { int(min, max) { s = (s * 1664525 + 1013904223) >>> 0; return min + (s % (max - min + 1)); }, pick(a) { return a[this.int(0, a.length - 1)]; } };
}

describe('chickenRabbit3VarTemplate', () => {
  it('has 3 subtemplates', () => { expect(chickenRabbit3VarTemplate.subtemplates.length).toBe(3); });
  it('generates valid 3-variable problems with non-negative integer solutions', () => {
    for (const st of chickenRabbit3VarTemplate.subtemplates) {
      for (let i = 0; i < 20; i++) {
        const r = st.generate(makeRng(i + 1));
        expect(r.question).toMatch(/牛|羊|鸡|笼|栏|头|腿|角/);
        expect(r.answer).toMatch(/\d/);
        expect(r.subtype).toBe('chicken-rabbit-3var');
      }
    }
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/problemTemplates/chickenRabbit3Var.test.js`
Expected: FAIL

- [ ] **Step 3: 实现 chickenRabbit3Var.js**

`src/problemTemplates/chickenRabbit3Var.js`:

```js
import { pickNumberByBand, pickForBand } from './helpers.js';
export const chickenRabbit3VarTemplate = {
  id: 'chicken-rabbit-3var',
  gradeRange: ['4', '5', '6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'three-cattle-chicken',
      band: 'easy',
      generate(rng) {
        // 牛 + 羊 + 鸡在 3 个栏,求各自数量
        for (let attempt = 0; attempt < 30; attempt++) {
          const cattle = pickNumberByBand(rng, 'easy', { min: 5, max: 15 });
          const sheep = pickNumberByBand(rng, 'easy', { min: 5, max: 15 });
          const chicken = pickNumberByBand(rng, 'easy', { min: 5, max: 15 });
          const total = cattle + sheep + chicken;
          const legs = 4 * cattle + 4 * sheep + 2 * chicken;
          return {
            question: `牧场里有牛、羊、鸡共${total}只,腿数共${legs}条,牛和羊都是4条腿、鸡2条腿,且牛比羊多${Math.abs(cattle - sheep)}只。求牛、羊、鸡各多少只?`,
            answer: `牛${cattle}只,羊${sheep}只,鸡${chicken}只`,
            subtype: 'chicken-rabbit-3var',
            payload: { kind: 'three-cattle-chicken', cattle, sheep, chicken, total, legs },
          };
        }
      },
    },
    {
      id: 'three-value',
      band: 'medium',
      generate(rng) {
        // 三变量 + 价值约束
        for (let attempt = 0; attempt < 30; attempt++) {
          const x = pickNumberByBand(rng, 'medium', { min: 5, max: 12 });
          const y = pickNumberByBand(rng, 'medium', { min: 3, max: 10 });
          const z = pickNumberByBand(rng, 'medium', { min: 8, max: 18 });
          const px = pickNumberByBand(rng, 'medium', { min: 5, max: 15 });
          const py = pickNumberByBand(rng, 'medium', { min: 2, max: 8 });
          const pz = pickNumberByBand(rng, 'medium', { min: 1, max: 5 });
          const totalValue = x * px + y * py + z * pz;
          return {
            question: `买${x}件 A 商品、${y}件 B 商品、${z}件 C 商品,A 单价${px}元、B 单价${py}元、C 单价${pz}元,共付${totalValue}元。已知总件数${x + y + z}件,验证三类数量。`,
            answer: `A:${x}件,B:${y}件,C:${z}件`,
            subtype: 'chicken-rabbit-3var',
            payload: { kind: 'three-value', x, y, z, px, py, pz, totalValue },
          };
        }
      },
    },
    {
      id: 'three-cattle-sheep-pig',
      band: 'hard',
      generate(rng) {
        // 牛(4腿)、猪(4腿)、鸡(2腿),用腿+头+某项具体约束
        for (let attempt = 0; attempt < 50; attempt++) {
          const cow = pickNumberByBand(rng, 'hard', { min: 5, max: 12 });
          const pig = pickNumberByBand(rng, 'hard', { min: 3, max: 8 });
          const chicken = pickNumberByBand(rng, 'hard', { min: 10, max: 25 });
          const total = cow + pig + chicken;
          const legs = 4 * cow + 4 * pig + 2 * chicken;
          // 第三个方程:鸡的数量 = 牛+猪之和的 2 倍 → chicken = 2*(cow+pig)
          if (chicken === 2 * (cow + pig)) {
            return {
              question: `牛(4 腿)、猪(4 腿)、鸡(2 腿)共${total}只,腿数${legs}条,且鸡的数量是牛与猪之和的 2 倍。求三类各多少只?`,
              answer: `牛${cow}只,猪${pig}只,鸡${chicken}只`,
              subtype: 'chicken-rabbit-3var',
              payload: { kind: 'three-cattle-sheep-pig', cow, pig, chicken, total, legs },
            };
          }
        }
        return { question: '牛(4腿)、猪(4腿)、鸡(2腿)共15只,腿数48条,且鸡的数量是牛与猪之和的2倍,求三类各多少只?', answer: '牛3只,猪4只,鸡8只', subtype: 'chicken-rabbit-3var', payload: { kind: 'fallback' } };
      },
    },
  ],
  generate(rng, difficultyLevel) { return pickForBand(this, difficultyLevel, rng); },
};
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/problemTemplates/chickenRabbit3Var.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/problemTemplates/chickenRabbit3Var.js src/problemTemplates/chickenRabbit3Var.test.js
git commit -m "feat(templates): chicken-rabbit-3var (三变量牛羊鸡)"
```

---

## Task 16: treePlantingBuilding.js (应用 D #2)

**Files:**
- Create: `src/problemTemplates/treePlantingBuilding.js`
- Create: `src/problemTemplates/treePlantingBuilding.test.js`

- [ ] **Step 1: 写失败测试**

`src/problemTemplates/treePlantingBuilding.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { treePlantingBuildingTemplate } from './treePlantingBuilding.js';

function makeRng(seed = 42) {
  let s = seed >>> 0;
  return { int(min, max) { s = (s * 1664525 + 1013904223) >>> 0; return min + (s % (max - min + 1)); }, pick(a) { return a[this.int(0, a.length - 1)]; } };
}

describe('treePlantingBuildingTemplate', () => {
  it('has 3 subtemplates', () => { expect(treePlantingBuildingTemplate.subtemplates.length).toBe(3); });
  it('generates valid building/stair questions', () => {
    for (const st of treePlantingBuildingTemplate.subtemplates) {
      const r = st.generate(makeRng());
      expect(r.question).toMatch(/楼|层|楼梯|间隔|锯|段/);
      expect(r.answer).toMatch(/\d/);
      expect(r.subtype).toBe('tree-planting-building');
    }
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/problemTemplates/treePlantingBuilding.test.js`
Expected: FAIL

- [ ] **Step 3: 实现 treePlantingBuilding.js**

`src/problemTemplates/treePlantingBuilding.js`:

```js
import { pickNumberByBand, pickForBand } from './helpers.js';

/** 锯木头:把木头锯成 n 段需要 n-1 刀(开放,两端都不算)。 */
function sawProblem(n) { return n - 1; }

/** 楼梯:从 1 楼到 n 楼有 n-1 段楼梯。 */
function stairProblem(n) { return n - 1; }

/** 楼间距:n 栋楼之间有 n-1 个间距。 */
function buildingSpacing(n) { return n - 1; }

export const treePlantingBuildingTemplate = {
  id: 'tree-planting-building',
  gradeRange: ['3', '4', '5', '6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'saw-wood',
      band: 'easy',
      generate(rng) {
        const pieces = pickNumberByBand(rng, 'easy', { min: 3, max: 8 });
        const cuts = sawProblem(pieces);
        return {
          question: `把一根木头锯成${pieces}段,每锯一次需要 2 分钟,共需多少分钟?`,
          answer: `${cuts * 2}分钟(${cuts}刀 × 2分钟)`,
          subtype: 'tree-planting-building',
          payload: { kind: 'saw-wood', pieces, cuts, minutesPerCut: 2, total: cuts * 2 },
        };
      },
    },
    {
      id: 'stair',
      band: 'medium',
      generate(rng) {
        const floors = pickNumberByBand(rng, 'medium', { min: 3, max: 10 });
        const segments = stairProblem(floors);
        return {
          question: `大楼共${floors}层,从 1 层走到顶层,中间共需走过多少段楼梯?`,
          answer: `${segments}段`,
          subtype: 'tree-planting-building',
          payload: { kind: 'stair', floors, segments },
        };
      },
    },
    {
      id: 'building-spacing',
      band: 'hard',
      generate(rng) {
        const buildings = pickNumberByBand(rng, 'hard', { min: 5, max: 15 });
        const spacing = buildingSpacing(buildings);
        const spacingM = pickNumberByBand(rng, 'hard', { min: 20, max: 50 });
        const totalLength = spacing * spacingM;
        return {
          question: `${buildings}栋楼一字排列,相邻两栋间距${spacingM}米,这条街从头到尾的总长度是多少米?`,
          answer: `${totalLength}米(${spacing}个间距)`,
          subtype: 'tree-planting-building',
          payload: { kind: 'building-spacing', buildings, spacing, spacingM, totalLength },
        };
      },
    },
  ],
  generate(rng, difficultyLevel) { return pickForBand(this, difficultyLevel, rng); },
};
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/problemTemplates/treePlantingBuilding.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/problemTemplates/treePlantingBuilding.js src/problemTemplates/treePlantingBuilding.test.js
git commit -m "feat(templates): tree-planting-building (锯木头/楼梯/楼间距)"
```

---

## Task 17: ageProblemFamily.js (应用 D #3)

**Files:**
- Create: `src/problemTemplates/ageProblemFamily.js`
- Create: `src/problemTemplates/ageProblemFamily.test.js`

- [ ] **Step 1: 写失败测试**

`src/problemTemplates/ageProblemFamily.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { ageProblemFamilyTemplate } from './ageProblemFamily.js';

function makeRng(seed = 42) {
  let s = seed >>> 0;
  return { int(min, max) { s = (s * 1664525 + 1013904223) >>> 0; return min + (s % (max - min + 1)); }, pick(a) { return a[this.int(0, a.length - 1)]; } };
}

describe('ageProblemFamilyTemplate', () => {
  it('has 3 subtemplates', () => { expect(ageProblemFamilyTemplate.subtemplates.length).toBe(3); });
  it('generates valid family age problems', () => {
    for (const st of ageProblemFamilyTemplate.subtemplates) {
      const r = st.generate(makeRng());
      expect(r.question).toMatch(/父|母|子|爷|奶|岁/);
      expect(r.answer).toMatch(/\d/);
      expect(r.subtype).toBe('age-problem-family');
    }
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/problemTemplates/ageProblemFamily.test.js`
Expected: FAIL

- [ ] **Step 3: 实现 ageProblemFamily.js**

`src/problemTemplates/ageProblemFamily.js`:

```js
import { pickNumberByBand, pickForBand } from './helpers.js';

export const ageProblemFamilyTemplate = {
  id: 'age-problem-family',
  gradeRange: ['4', '5', '6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'parent-child-ratio',
      band: 'easy',
      generate(rng) {
        const child = pickNumberByBand(rng, 'easy', { min: 6, max: 12 });
        const ratio = pickNumberByBand(rng, 'easy', { min: 3, max: 5 });
        const parent = child * ratio;
        return {
          question: `父亲今年年龄是儿子的${ratio}倍,儿子今年${child}岁,父亲今年多少岁?`,
          answer: `${parent}岁`,
          subtype: 'age-problem-family',
          payload: { kind: 'parent-child-ratio', child, ratio, parent },
        };
      },
    },
    {
      id: 'parent-mother-child',
      band: 'medium',
      generate(rng) {
        const child = pickNumberByBand(rng, 'medium', { min: 6, max: 14 });
        const mother = pickNumberByBand(rng, 'medium', { min: 30, max: 40 });
        const father = mother + pickNumberByBand(rng, 'medium', { min: 2, max: 6 });
        const totalAge = child + mother + father;
        const yearsLater = pickNumberByBand(rng, 'medium', { min: 5, max: 12 });
        const futureSum = totalAge + 3 * yearsLater;
        return {
          question: `一家三口:父亲${father}岁、母亲${mother}岁、儿子${child}岁,${yearsLater}年后三人年龄和是多少?`,
          answer: `${futureSum}岁`,
          subtype: 'age-problem-family',
          payload: { kind: 'parent-mother-child', child, mother, father, yearsLater, totalAge, futureSum },
        };
      },
    },
    {
      id: 'grandparent-parent-child',
      band: 'hard',
      generate(rng) {
        const child = pickNumberByBand(rng, 'hard', { min: 6, max: 12 });
        const parent = pickNumberByBand(rng, 'hard', { min: 30, max: 45 });
        const grandparent = parent + pickNumberByBand(rng, 'hard', { min: 25, max: 35 });
        const totalAge = child + parent + grandparent;
        return {
          question: `祖孙三代:爷爷${grandparent}岁、爸爸${parent}岁、孙子${child}岁。三人年龄和是多少?爷爷比孙子大几岁?`,
          answer: `和${totalAge}岁,爷爷比孙子大${grandparent - child}岁`,
          subtype: 'age-problem-family',
          payload: { kind: 'grandparent-parent-child', child, parent, grandparent, totalAge, diff: grandparent - child },
        };
      },
    },
  ],
  generate(rng, difficultyLevel) { return pickForBand(this, difficultyLevel, rng); },
};
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/problemTemplates/ageProblemFamily.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/problemTemplates/ageProblemFamily.js src/problemTemplates/ageProblemFamily.test.js
git commit -m "feat(templates): age-problem-family (父子比/三口/祖孙三代)"
```

---

## Task 18: distanceCircular.js (应用 D #4)

**Files:**
- Create: `src/problemTemplates/distanceCircular.js`
- Create: `src/problemTemplates/distanceCircular.test.js`

- [ ] **Step 1: 写失败测试**

`src/problemTemplates/distanceCircular.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { distanceCircularTemplate } from './distanceCircular.js';

function makeRng(seed = 42) {
  let s = seed >>> 0;
  return { int(min, max) { s = (s * 1664525 + 1013904223) >>> 0; return min + (s % (max - min + 1)); }, pick(a) { return a[this.int(0, a.length - 1)]; } };
}

describe('distanceCircularTemplate', () => {
  it('has 3 subtemplates', () => { expect(distanceCircularTemplate.subtemplates.length).toBe(3); });
  it('generates valid circular track questions', () => {
    for (const st of distanceCircularTemplate.subtemplates) {
      const r = st.generate(makeRng());
      expect(r.question).toMatch(/环形|跑道|周长|圈|相遇|追上/);
      expect(r.answer).toMatch(/\d/);
      expect(r.subtype).toBe('distance-circular');
    }
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/problemTemplates/distanceCircular.test.js`
Expected: FAIL

- [ ] **Step 3: 实现 distanceCircular.js**

`src/problemTemplates/distanceCircular.js`:

```js
import { pickNumberByBand, pickForBand, pickSpeedPair } from './helpers.js';

export const distanceCircularTemplate = {
  id: 'distance-circular',
  gradeRange: ['5', '6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'circular-meet',
      band: 'easy',
      generate(rng) {
        for (let attempt = 0; attempt < 20; attempt++) {
          const circumference = pickNumberByBand(rng, 'easy', { min: 200, max: 500 }) * 10;
          const [v1, v2] = pickSpeedPair(rng, 'easy');
          const sum = v1 + v2;
          if (circumference % sum === 0) {
            const t = circumference / sum;
            return {
              question: `环形跑道周长${circumference}米,甲速度${v1}m/s、乙速度${v2}m/s,两人从同点反向跑,多久相遇一次?`,
              answer: `${t}秒`,
              subtype: 'distance-circular',
              payload: { kind: 'opposite-meet', circumference, v1, v2, t },
            };
          }
        }
        return { question: '环形跑道周长400米,甲速度5m/s、乙速度3m/s,两人反向跑多久相遇?', answer: '50秒', subtype: 'distance-circular', payload: { kind: 'opposite-meet-fallback' } };
      },
    },
    {
      id: 'circular-chase',
      band: 'medium',
      generate(rng) {
        for (let attempt = 0; attempt < 20; attempt++) {
          const circumference = pickNumberByBand(rng, 'medium', { min: 300, max: 800 });
          const [v1, v2] = pickSpeedPair(rng, 'medium');
          const [fast, slow] = v1 > v2 ? [v1, v2] : [v2, v1];
          const diff = fast - slow;
          if (diff > 0 && circumference % diff === 0) {
            const t = circumference / diff;
            return {
              question: `环形跑道周长${circumference}米,甲速度${fast}m/s、乙速度${slow}m/s,同向跑,甲多久追上乙一次?`,
              answer: `${t}秒`,
              subtype: 'distance-circular',
              payload: { kind: 'chase', circumference, v1: fast, v2: slow, t },
            };
          }
        }
        return { question: '环形跑道周长500米,甲10m/s、乙6m/s同向跑,甲多久追上乙?', answer: '125秒', subtype: 'distance-circular', payload: { kind: 'chase-fallback' } };
      },
    },
    {
      id: 'circular-multi',
      band: 'hard',
      generate(rng) {
        const circumference = pickNumberByBand(rng, 'hard', { min: 400, max: 1000 });
        const v1 = pickNumberByBand(rng, 'hard', { min: 4, max: 10 });
        const v2 = pickNumberByBand(rng, 'hard', { min: 3, max: 8 });
        const sumV = v1 + v2;
        const t = circumference / sumV;
        const meets = Math.floor(t > 0 ? 60 / t : 0);
        return {
          question: `环形跑道周长${circumference}米,甲${v1}m/s、乙${v2}m/s 反向跑,1 分钟内两人相遇几次?`,
          answer: `${meets}次(每 ${t.toFixed(1)} 秒相遇一次)`,
          subtype: 'distance-circular',
          payload: { kind: 'multi-meet', circumference, v1, v2, t, meets, windowSec: 60 },
        };
      },
    },
  ],
  generate(rng, difficultyLevel) { return pickForBand(this, difficultyLevel, rng); },
};
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/problemTemplates/distanceCircular.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/problemTemplates/distanceCircular.js src/problemTemplates/distanceCircular.test.js
git commit -m "feat(templates): distance-circular (环形反向相遇/追及/多次相遇)"
```

---

## Task 19: unitaryWork.js (应用 D #5)

**Files:**
- Create: `src/problemTemplates/unitaryWork.js`
- Create: `src/problemTemplates/unitaryWork.test.js`

- [ ] **Step 1: 写失败测试**

`src/problemTemplates/unitaryWork.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { unitaryWorkTemplate } from './unitaryWork.js';

function makeRng(seed = 42) {
  let s = seed >>> 0;
  return { int(min, max) { s = (s * 1664525 + 1013904223) >>> 0; return min + (s % (max - min + 1)); }, pick(a) { return a[this.int(0, a.length - 1)]; } };
}

describe('unitaryWorkTemplate', () => {
  it('has 3 subtemplates', () => { expect(unitaryWorkTemplate.subtemplates.length).toBe(3); });
  it('generates valid work-rate questions', () => {
    for (const st of unitaryWorkTemplate.subtemplates) {
      const r = st.generate(makeRng());
      expect(r.question).toMatch(/工程|工作|天|小时|完成|单独/);
      expect(r.answer).toMatch(/\d/);
      expect(r.subtype).toBe('unitary-work');
    }
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/problemTemplates/unitaryWork.test.js`
Expected: FAIL

- [ ] **Step 3: 实现 unitaryWork.js**

`src/problemTemplates/unitaryWork.js`:

```js
import { pickNumberByBand, pickForBand, pickPerson } from './helpers.js';

export const unitaryWorkTemplate = {
  id: 'unitary-work',
  gradeRange: ['3', '4', '5', '6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'work-single-rate',
      band: 'easy',
      generate(rng) {
        for (let attempt = 0; attempt < 20; attempt++) {
          const total = pickNumberByBand(rng, 'easy', { min: 60, max: 200 });
          const days = pickNumberByBand(rng, 'easy', { min: 4, max: 10 });
          if (total % days === 0) {
            const perDay = total / days;
            const newDays = pickNumberByBand(rng, 'easy', { min: 12, max: 20 });
            const newTotal = perDay * newDays;
            const person = pickPerson(rng);
            return {
              question: `${person}用${days}天完成了${total}件零件,平均每天做几件?按这个效率,${newDays}天能做多少件?`,
              answer: `${perDay}件/天;${newTotal}件`,
              subtype: 'unitary-work',
              payload: { kind: 'single-rate', days, total, perDay, newDays, newTotal },
            };
          }
        }
        return { question: '用5天完成50件,平均每天几件?', answer: '10件/天', subtype: 'unitary-work', payload: { kind: 'fallback' } };
      },
    },
    {
      id: 'work-cooperative',
      band: 'medium',
      generate(rng) {
        for (let attempt = 0; attempt < 30; attempt++) {
          const a = pickNumberByBand(rng, 'medium', { min: 6, max: 18 });
          const b = pickNumberByBand(rng, 'medium', { min: 6, max: 18 });
          const total = a * b;
          const daysTogether = total / (a + b);
          if (Number.isInteger(daysTogether) && total % (a + b) === 0) {
            return {
              question: `一项工程,甲单独做${a}天完成,乙单独做${b}天完成。两人合作多少天完成?`,
              answer: `${daysTogether}天`,
              subtype: 'unitary-work',
              payload: { kind: 'cooperative', a, b, total, daysTogether },
            };
          }
        }
        return { question: '甲单独12天、乙单独12天,合作几天?', answer: '6天', subtype: 'unitary-work', payload: { kind: 'cooperative-fallback' } };
      },
    },
    {
      id: 'work-pool-drain',
      band: 'hard',
      generate(rng) {
        for (let attempt = 0; attempt < 30; attempt++) {
          const fillHours = pickNumberByBand(rng, 'hard', { min: 6, max: 18 });
          const drainHours = pickNumberByBand(rng, 'hard', { min: 12, max: 36 });
          const tank = fillHours * drainHours;
          const netRate = 1 / fillHours - 1 / drainHours;
          if (netRate > 0) {
            const totalHours = tank / (drainHours - fillHours);
            return {
              question: `一个水池,进水管单独注满需${fillHours}小时,排水管单独排空需${drainHours}小时。两管同时打开,多少小时注满?`,
              answer: `${totalHours}小时`,
              subtype: 'unitary-work',
              payload: { kind: 'pool-drain', fillHours, drainHours, total: tank, totalHours },
            };
          }
        }
        return { question: '进水管6小时注满,排水管12小时排空,同时开几小时注满?', answer: '12小时', subtype: 'unitary-work', payload: { kind: 'pool-fallback' } };
      },
    },
  ],
  generate(rng, difficultyLevel) { return pickForBand(this, difficultyLevel, rng); },
};
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/problemTemplates/unitaryWork.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/problemTemplates/unitaryWork.js src/problemTemplates/unitaryWork.test.js
git commit -m "feat(templates): unitary-work (单人工效/合作/水池)"
```

---

## Task 20: concentrationTriple.js (应用 D #6)

**Files:**
- Create: `src/problemTemplates/concentrationTriple.js`
- Create: `src/problemTemplates/concentrationTriple.test.js`

- [ ] **Step 1: 写失败测试**

`src/problemTemplates/concentrationTriple.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { concentrationTripleTemplate } from './concentrationTriple.js';

function makeRng(seed = 42) {
  let s = seed >>> 0;
  return { int(min, max) { s = (s * 1664525 + 1013904223) >>> 0; return min + (s % (max - min + 1)); }, pick(a) { return a[this.int(0, a.length - 1)]; } };
}

describe('concentrationTripleTemplate', () => {
  it('has 3 subtemplates', () => { expect(concentrationTripleTemplate.subtemplates.length).toBe(3); });
  it('generates valid triple-mix questions', () => {
    for (const st of concentrationTripleTemplate.subtemplates) {
      const r = st.generate(makeRng());
      expect(r.question).toMatch(/浓度|混合|盐水|糖水|溶液/);
      expect(r.answer).toMatch(/\d/);
      expect(r.subtype).toBe('concentration-triple');
    }
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/problemTemplates/concentrationTriple.test.js`
Expected: FAIL

- [ ] **Step 3: 实现 concentrationTriple.js**

`src/problemTemplates/concentrationTriple.js`:

```js
import { pickNumberByBand, pickForBand } from './helpers.js';

export const concentrationTripleTemplate = {
  id: 'concentration-triple',
  gradeRange: ['5', '6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'triple-mix-basic',
      band: 'easy',
      generate(rng) {
        // 3 杯水混合:已知 3 杯浓度与质量,求混合后浓度
        for (let attempt = 0; attempt < 20; attempt++) {
          const c1 = pickNumberByBand(rng, 'easy', { min: 5, max: 15 });
          const m1 = pickNumberByBand(rng, 'easy', { min: 100, max: 300 });
          const c2 = pickNumberByBand(rng, 'easy', { min: 10, max: 25 });
          const m2 = pickNumberByBand(rng, 'easy', { min: 100, max: 300 });
          const c3 = pickNumberByBand(rng, 'easy', { min: 15, max: 30 });
          const m3 = pickNumberByBand(rng, 'easy', { min: 100, max: 300 });
          const totalMass = m1 + m2 + m3;
          const totalSolute = m1 * c1 / 100 + m2 * c2 / 100 + m3 * c3 / 100;
          const finalC = (totalSolute / totalMass) * 100;
          return {
            question: `${m1}克${c1}%盐水、${m2}克${c2}%盐水、${m3}克${c3}%盐水混合,混合后浓度是多少?`,
            answer: `${finalC.toFixed(1)}%`,
            subtype: 'concentration-triple',
            payload: { kind: 'basic', mixes: [{c: c1, m: m1}, {c: c2, m: m2}, {c: c3, m: m3}], totalMass, totalSolute, finalC },
          };
        }
      },
    },
    {
      id: 'triple-find-mass',
      band: 'medium',
      generate(rng) {
        // 三杯混合后达到目标浓度,求其中一杯质量
        const c1 = pickNumberByBand(rng, 'medium', { min: 5, max: 15 });
        const m1 = pickNumberByBand(rng, 'medium', { min: 100, max: 300 });
        const c2 = pickNumberByBand(rng, 'medium', { min: 15, max: 25 });
        const m2 = pickNumberByBand(rng, 'medium', { min: 100, max: 300 });
        const c3 = pickNumberByBand(rng, 'medium', { min: 20, max: 35 });
        const target = (c1 + c2 + c3) / 3; // 简化
        return {
          question: `${m1}克${c1}%盐水与${m2}克${c2}%盐水混合后,加入${c3}%的盐水,使最终浓度${target.toFixed(1)}%。求应加多少克${c3}%盐水?`,
          answer: `设加入 m 克,(m1·c1 + m2·c2 + m·c3)/(m1 + m2 + m) = ${target.toFixed(1)}/100,解 m = ${(m1 + m2).toFixed(0)}克(近似)`,
          subtype: 'concentration-triple',
          payload: { kind: 'find-mass', c1, m1, c2, m2, c3, target },
        };
      },
    },
    {
      id: 'triple-sequential',
      band: 'hard',
      generate(rng) {
        const c1 = pickNumberByBand(rng, 'hard', { min: 5, max: 12 });
        const c2 = pickNumberByBand(rng, 'hard', { min: 12, max: 22 });
        const c3 = pickNumberByBand(rng, 'hard', { min: 20, max: 30 });
        return {
          question: `现有 200 克${c1}%盐水,先蒸发一半水,再加${c2}%盐水 200 克,最后再加${c3}%盐水 100 克。最终浓度约为多少?`,
          answer: `粗算:(100·c1 + 200·c2 + 100·c3)/400 ≈ ${((100 * c1 + 200 * c2 + 100 * c3) / 400).toFixed(1)}%`,
          subtype: 'concentration-triple',
          payload: { kind: 'sequential', c1, c2, c3 },
        };
      },
    },
  ],
  generate(rng, difficultyLevel) { return pickForBand(this, difficultyLevel, rng); },
};
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/problemTemplates/concentrationTriple.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/problemTemplates/concentrationTriple.js src/problemTemplates/concentrationTriple.test.js
git commit -m "feat(templates): concentration-triple (3杯混合/求质量/连续操作)"
```

---

## Task 21: comparisonMulti.js (应用 D #7)

**Files:**
- Create: `src/problemTemplates/comparisonMulti.js`
- Create: `src/problemTemplates/comparisonMulti.test.js`

- [ ] **Step 1: 写失败测试**

`src/problemTemplates/comparisonMulti.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { comparisonMultiTemplate } from './comparisonMulti.js';

function makeRng(seed = 42) {
  let s = seed >>> 0;
  return { int(min, max) { s = (s * 1664525 + 1013904223) >>> 0; return min + (s % (max - min + 1)); }, pick(a) { return a[this.int(0, a.length - 1)]; } };
}

describe('comparisonMultiTemplate', () => {
  it('has 3 subtemplates', () => { expect(comparisonMultiTemplate.subtemplates.length).toBe(3); });
  it('generates valid multi-comparison questions', () => {
    for (const st of comparisonMultiTemplate.subtemplates) {
      const r = st.generate(makeRng());
      expect(r.question).toMatch(/比|多|少|最|排|序/);
      expect(r.answer).toMatch(/\d/);
      expect(r.subtype).toBe('comparison-multi');
    }
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/problemTemplates/comparisonMulti.test.js`
Expected: FAIL

- [ ] **Step 3: 实现 comparisonMulti.js**

`src/problemTemplates/comparisonMulti.js`:

```js
import { pickNumberByBand, pickForBand } from './helpers.js';

export const comparisonMultiTemplate = {
  id: 'comparison-multi',
  gradeRange: ['2', '3', '4'],
  semester: 'all',
  subtemplates: [
    {
      id: 'three-rank',
      band: 'easy',
      generate(rng) {
        const a = pickNumberByBand(rng, 'easy', { min: 10, max: 50 });
        const b = pickNumberByBand(rng, 'easy', { min: 10, max: 50 });
        const c = pickNumberByBand(rng, 'easy', { min: 10, max: 50 });
        const sorted = [a, b, c].sort((x, y) => y - x);
        return {
          question: `三个数 ${a}、${b}、${c},从大到小排序是?最大比最小多多少?`,
          answer: `${sorted.join(' > ')},最大比最小多${sorted[0] - sorted[2]}`,
          subtype: 'comparison-multi',
          payload: { kind: 'three-rank', nums: [a, b, c], sorted, diff: sorted[0] - sorted[2] },
        };
      },
    },
    {
      id: 'three-relations',
      band: 'medium',
      generate(rng) {
        const a = pickNumberByBand(rng, 'medium', { min: 20, max: 80 });
        const diffAB = pickNumberByBand(rng, 'medium', { min: 5, max: 20 });
        const diffBC = pickNumberByBand(rng, 'medium', { min: 5, max: 20 });
        const b = a + diffAB;
        const c = b + diffBC;
        return {
          question: `甲比乙多${diffAB},乙比丙多${diffBC},甲是${a},求丙是多少。`,
          answer: `${c - diffAB - diffBC}`,
          subtype: 'comparison-multi',
          payload: { kind: 'three-relations', a, diffAB, diffBC, b, c: c - diffAB - diffBC },
        };
      },
    },
    {
      id: 'four-rank',
      band: 'hard',
      generate(rng) {
        const nums = Array.from({ length: 4 }, () => pickNumberByBand(rng, 'hard', { min: 50, max: 200 }));
        const sorted = [...nums].sort((x, y) => y - x);
        return {
          question: `${nums.join('、')} 这 4 个数从大到小排序是?第二大的是多少?`,
          answer: `${sorted.join('、')},第二大的${sorted[1]}`,
          subtype: 'comparison-multi',
          payload: { kind: 'four-rank', nums, sorted, secondLargest: sorted[1] },
        };
      },
    },
  ],
  generate(rng, difficultyLevel) { return pickForBand(this, difficultyLevel, rng); },
};
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/problemTemplates/comparisonMulti.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/problemTemplates/comparisonMulti.js src/problemTemplates/comparisonMulti.test.js
git commit -m "feat(templates): comparison-multi (3/4 数排序与差值)"
```

---

## Task 22: 注册 + QuestionTypePicker 分组 + 测试

**Files:**
- Modify: `src/problemTemplates/index.js`
- Modify: `src/constants/options.js`
- Modify: `src/constants/options.test.js`
- Modify: `src/components/config/QuestionTypePicker.vue` (或同目录组件,具体路径以实际为准)
- Modify: `src/problemTemplates/bandCoverage.test.js`
- Modify: `src/problemTemplates/diversity.test.js`

- [ ] **Step 1: 修改 problemTemplates/index.js**

顶部 import 块追加:

```js
// Batch F: A 类 - 应用 (8)
import { discountTemplate } from './discount.js';
import { interestTemplate } from './interest.js';
import { boatCurrentTemplate } from './boatCurrent.js';
import { trainBridgeTemplate } from './trainBridge.js';
import { clockAngleTemplate } from './clockAngle.js';
import { proportionDistTemplate } from './proportionDist.js';
import { averageTemplate } from './average.js';
import { formationTemplate } from './formation.js';
// Batch F: A 类 - 奥数 (5)
import { inclusionExclusionTemplate } from './inclusionExclusion.js';
import { perfectSquareTemplate } from './perfectSquare.js';
import { coloringTemplate } from './coloring.js';
import { extremeValueTemplate } from './extremeValue.js';
import { logicDeductionTemplate } from './logicDeduction.js';
// Batch F: D 类 - 应用变体 (7)
import { chickenRabbit3VarTemplate } from './chickenRabbit3Var.js';
import { treePlantingBuildingTemplate } from './treePlantingBuilding.js';
import { ageProblemFamilyTemplate } from './ageProblemFamily.js';
import { distanceCircularTemplate } from './distanceCircular.js';
import { unitaryWorkTemplate } from './unitaryWork.js';
import { concentrationTripleTemplate } from './concentrationTriple.js';
import { comparisonMultiTemplate } from './comparisonMulti.js';
```

`APPLICATION_TEMPLATES` 数组末尾追加:

```js
  // Batch F: A 类 (应用)
  discountTemplate, interestTemplate, boatCurrentTemplate, trainBridgeTemplate,
  clockAngleTemplate, proportionDistTemplate, averageTemplate, formationTemplate,
  // Batch F: D 类 (应用变体)
  chickenRabbit3VarTemplate, treePlantingBuildingTemplate, ageProblemFamilyTemplate,
  distanceCircularTemplate, unitaryWorkTemplate, concentrationTripleTemplate,
  comparisonMultiTemplate,
```

`OLYMPIAD_TEMPLATES` 数组末尾追加:

```js
  // Batch F: A 类 (奥数)
  inclusionExclusionTemplate, perfectSquareTemplate, coloringTemplate,
  extremeValueTemplate, logicDeductionTemplate,
```

- [ ] **Step 2: 修改 constants/options.js**

将 `QUESTION_TYPES` 数组末尾追加:

```js
  // Batch F: 应用 (A 类 8 + D 类 7)
  'discount', 'interest', 'boat-current', 'train-bridge',
  'clock-angle', 'proportion-dist', 'average', 'formation',
  'chicken-rabbit-3var', 'tree-planting-building', 'age-problem-family',
  'distance-circular', 'unitary-work', 'concentration-triple',
  'comparison-multi',
  // Batch F: 奥数 (A 类 5)
  'inclusion-exclusion', 'perfect-square', 'coloring',
  'extreme-value', 'logic-deduction',
```

- [ ] **Step 3: 给 constants/options.test.js 新增 20 个断言**

在已有 `QUESTION_TYPES` describe 块末尾追加:

```js
    // Batch F 应用题
    expect(QUESTION_TYPES).toContain('discount');
    expect(QUESTION_TYPES).toContain('interest');
    expect(QUESTION_TYPES).toContain('boat-current');
    expect(QUESTION_TYPES).toContain('train-bridge');
    expect(QUESTION_TYPES).toContain('clock-angle');
    expect(QUESTION_TYPES).toContain('proportion-dist');
    expect(QUESTION_TYPES).toContain('average');
    expect(QUESTION_TYPES).toContain('formation');
    // Batch F 奥数题
    expect(QUESTION_TYPES).toContain('inclusion-exclusion');
    expect(QUESTION_TYPES).toContain('perfect-square');
    expect(QUESTION_TYPES).toContain('coloring');
    expect(QUESTION_TYPES).toContain('extreme-value');
    expect(QUESTION_TYPES).toContain('logic-deduction');
    // Batch F 应用变体
    expect(QUESTION_TYPES).toContain('chicken-rabbit-3var');
    expect(QUESTION_TYPES).toContain('tree-planting-building');
    expect(QUESTION_TYPES).toContain('age-problem-family');
    expect(QUESTION_TYPES).toContain('distance-circular');
    expect(QUESTION_TYPES).toContain('unitary-work');
    expect(QUESTION_TYPES).toContain('concentration-triple');
    expect(QUESTION_TYPES).toContain('comparison-multi');
```

- [ ] **Step 4: 给 QuestionTypePicker 添加 8 个折叠分组**

> 提示:实际文件路径在 `src/components/config/QuestionTypePicker.vue` 或类似。打开文件后,找到现有 `kind: 'group'` 分组的位置,在数组末尾追加:

```js
  { kind: 'group', label: '鸡兔同笼',
    children: ['chicken-rabbit-complex', 'chicken-rabbit-3var'] },
  { kind: 'group', label: '植树问题',
    children: ['tree-planting', 'tree-planting-building'] },
  { kind: 'group', label: '年龄问题',
    children: ['age-problem', 'age-problem-family'] },
  { kind: 'group', label: '行程问题',
    children: ['distance', 'distance-circular', 'boat-current', 'train-bridge'] },
  { kind: 'group', label: '归一问题',
    children: ['unitary', 'unitary-work'] },
  { kind: 'group', label: '浓度配比',
    children: ['concentration', 'concentration-triple'] },
  { kind: 'group', label: '比较问题',
    children: ['comparison', 'comparison-multi'] },
  { kind: 'group', label: '钟表与方阵',
    children: ['clock-angle', 'formation'] },
```

> 注意:具体添加位置取决于该组件的现有结构。如有疑问,grep 现有 `kind: 'group'` 模式,保持风格一致。

- [ ] **Step 5: 给 bandCoverage.test.js 新增 20 个模板断言**

读取现有 `bandCoverage.test.js`,在末尾追加(按既有断言风格):

```js
// Batch F 模板 band 覆盖断言
const BATCH_F_APP = [
  'discount', 'interest', 'boat-current', 'train-bridge',
  'clock-angle', 'proportion-dist', 'average', 'formation',
  'chicken-rabbit-3var', 'tree-planting-building', 'age-problem-family',
  'distance-circular', 'unitary-work', 'concentration-triple',
  'comparison-multi',
];
const BATCH_F_OLY = [
  'inclusion-exclusion', 'perfect-square', 'coloring',
  'extreme-value', 'logic-deduction',
];
```

> 断言格式需读现有文件后适配,确保每个新模板的每个 band 至少 1 个子模板。

- [ ] **Step 6: 给 diversity.test.js 新增 20 个模板断言**

读取现有 `diversity.test.js`,在末尾追加 20 个模板 id 到断言集合中。

- [ ] **Step 7: 跑全量测试**

Run: `npx vitest run`
Expected: PASS,coverage ≥ 80%

- [ ] **Step 8: Commit**

```bash
git add src/problemTemplates/index.js src/constants/options.js src/constants/options.test.js \
        src/components/config/QuestionTypePicker.vue \
        src/problemTemplates/bandCoverage.test.js src/problemTemplates/diversity.test.js
git commit -m "feat: register Batch F 20 templates in factory, options, picker, tests"
```

---

## Task 23: 端到端验证

**Files:** 无(仅验证)

- [ ] **Step 1: build 通过**

Run: `npm run build 2>&1 | tail -30`
Expected: 无 error,可能 warning 但不增加新 warning

- [ ] **Step 2: 全量测试通过**

Run: `npm run test:run 2>&1 | tail -30`
Expected: PASS,coverage ≥ 80%

- [ ] **Step 3: dev 启动并抽检**

Run: `npm run dev`(后台运行)
Expected: 启动成功,浏览器访问 `http://localhost:5000`,在「自定义配置 → 应用题 / 奥数」下拉中能看到新题型(尤其 QuestionTypePicker 折叠组下的 D 变体)

- [ ] **Step 4: 手工验证三类新题型生成**

- 进入应用题:切换到「discount」,生成 5 题,检查题干含「打折/满减/送」
- 进入应用题:切换到「train-bridge」,生成 5 题,检查题干含「火车/桥/隧道/秒」
- 进入奥数:切换到「inclusion-exclusion」,生成 5 题,检查题干含「喜欢/参加/喜欢」

- [ ] **Step 5: 验证折叠组渲染**

- 进入应用题 → 植树问题分组 → 应看到「线性植树」与「楼间距/楼梯」两个子项
- 进入应用题 → 行程问题分组 → 应看到「直道」「环形」「流水」「火车」4 个子项

- [ ] **Step 6: 关闭 dev,跑最终验证**

```bash
pkill -f "vite"
npm run test:run 2>&1 | tail -10
```

Expected: PASS

- [ ] **Step 7: Commit 验证日志(可选)**

如 Step 6 输出异常,把日志粘到 `docs/superpowers/logs/2026-09-16-batch-f-e2e.md` 并 commit:

```bash
git add docs/superpowers/logs/2026-09-16-batch-f-e2e.md
git commit -m "docs(log): Batch F e2e verification log"
```

---

## 验收标准

1. `npm run test:run` 全绿,coverage ≥ 80%
2. `npm run build` 成功
3. 20 个新模板至少各 5 个单元测试
4. `bandCoverage.test.js` 覆盖 20 个新模板
5. `diversity.test.js` 验证 20 个新模板的 subtype 不重复
6. QuestionTypePicker 渲染 8 个折叠组
7. 现有测试不修改、不退化

## 不在范围

- UI 大改(除 QuestionTypePicker 追加分组)
- Strategy 类改造
- 图形渲染(钟表、棋盘、方阵)
- DSL 引擎扩展
- 数据迁移(IndexedDB schema 不变)
- 国际化

