# 子项目 A: 中文经典情境题型 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增 8 个中文生活情境模板(划船/分糖/图书角/排队/红包/运动会/田园收割/校园值日),全部复用 D 的 `Subtemplate.band` 契约。

**Architecture:** 每个新模板独立文件,含 `*.test.js`;新增 helpers `pickTwoPeople`;`constants/options.js` 新增 8 个 subtype;`index.js` 更新 `APPLICATION_TEMPLATES` 数组。

**Tech Stack:** 纯 JS + Vitest,无新依赖。

**前置 spec:** `docs/superpowers/specs/2026-09-14-enrich-app-olympiad-subproject-a-design.md`

---

## 文件结构

### 新增(8 个模板 + 8 个测试 + helpers)

| 文件 | 职责 |
|---|---|
| `src/problemTemplates/boatCrossing.js` | 划船渡河(3 子模板,easy/medium/hard) |
| `src/problemTemplates/boatCrossing.test.js` | 船数=ceil(人数/每船人数),剩余座位 |
| `src/problemTemplates/shareCandy.js` | 分糖/分水果(3 子模板,easy/medium/hard) |
| `src/problemTemplates/shareCandy.test.js` | 总数=商×人数+余数 |
| `src/problemTemplates/libraryCorner.js` | 班级图书角借还(3 子模板,easy/medium/hard) |
| `src/problemTemplates/libraryCorner.test.js` | 借出-还入=最终数量 |
| `src/problemTemplates/queueProblem.js` | 排队问题(3 子模板,easy/medium/hard) |
| `src/problemTemplates/queueProblem.test.js` | 总人数=前+本人+后 |
| `src/problemTemplates/redPacket.js` | 春节红包收支(3 子模板,easy/medium/hard) |
| `src/problemTemplates/redPacket.test.js` | 余额=收入-支出 |
| `src/problemTemplates/sportsScore.js` | 运动会计分(4 子模板,easy/medium/medium/hard) |
| `src/problemTemplates/sportsScore.test.js` | 总分=胜×3+平×1 |
| `src/problemTemplates/harvestField.js` | 田园收割(3 子模板,easy/medium/hard) |
| `src/problemTemplates/harvestField.test.js` | 总产量=单产×面积 |
| `src/problemTemplates/dutyRoster.js` | 校园值日周期(3 子模板,easy/medium/hard) |
| `src/problemTemplates/dutyRoster.test.js` | (todayIndex+days)%7 星期计算 |

### helpers.js 变更

- 新增 `pickTwoPeople(rng)` — 返回两个不重复的中文人名

### constants/options.js 变更

```js
export const QUESTION_TYPES = [
  'arithmetic', 'application', 'olympiad',
  // A 新增:
  'boat-crossing', 'share-candy', 'library',
  'queue', 'red-packet', 'sports-score',
  'harvest', 'duty-roster',
];
```

### index.js 变更

```js
import { boatCrossingTemplate } from './boatCrossing.js';
import { shareCandyTemplate } from './shareCandy.js';
import { libraryCornerTemplate } from './libraryCorner.js';
import { queueProblemTemplate } from './queueProblem.js';
import { redPacketTemplate } from './redPacket.js';
import { sportsScoreTemplate } from './sportsScore.js';
import { harvestFieldTemplate } from './harvestField.js';
import { dutyRosterTemplate } from './dutyRoster.js';

export const APPLICATION_TEMPLATES = [
  shoppingTemplate, timeTemplate, comparisonTemplate, chickenRabbitTemplate,
  // A 新增:
  boatCrossingTemplate, shareCandyTemplate, libraryCornerTemplate,
  queueProblemTemplate, redPacketTemplate, sportsScoreTemplate,
  harvestFieldTemplate, dutyRosterTemplate,
];
```

---

## 通用模板模式

每个模板的外层 generate 统一如下(与 D 契约一致):

```js
// src/problemTemplates/boatCrossing.js
export const boatCrossingTemplate = {
  id: 'boat-crossing',
  gradeRange: ['3', '4', '5', '6'],
  semester: 'all',
  subtemplates: [
    { id: 'boat-two', band: 'easy', generate(rng) { ... } },
    { id: 'boat-three', band: 'medium', generate(rng) { ... } },
    { id: 'boat-compete', band: 'hard', generate(rng) { ... } },
  ],
  generate(rng, difficultyLevel) {
    const band = levelToBand(difficultyLevel);
    const pool = this.subtemplates.filter(t => t.band === band);
    return rng.pick(pool).generate(rng);
  },
};
```

每个子模板内部统一使用:
- `pickNumberByBand(rng, 'easy'|'medium'|'hard', { min, max })`
- `pickTwoPeople(rng)` (双人情境)
- `pickPerson(rng)` (单人情境)
- `rng.int(min, max)` (精确控制范围)

---

## Task 1: helpers.js 新增 pickTwoPeople

**Files:**
- Modify: `src/problemTemplates/helpers.js`

- [ ] **Step 1: 添加 pickTwoPeople**

在 `helpers.js` 末尾添加:

```js
/** 生成两个不重复的中文人名(来自 PEOPLE_POOL)。 */
export function pickTwoPeople(rng) {
  const a = rng.pick(PERSON_POOL);
  const pool = PERSON_POOL.filter(p => p !== a);
  return [a, rng.pick(pool)];
}
```

- [ ] **Step 2: 跑 helpers 测试**

Run: `npx vitest run src/problemTemplates/helpers.test.js`
Expected: 全部 PASS(现有 14 个 + 新增 1 个)

- [ ] **Step 3: Commit**

```bash
git add src/problemTemplates/helpers.js
git commit -m "feat(templates): add pickTwoPeople to helpers.js"
```

---

## Task 2: boatCrossing.js + boatCrossing.test.js

**Files:**
- Create: `src/problemTemplates/boatCrossing.js`
- Create: `src/problemTemplates/boatCrossing.test.js`

- [ ] **Step 1: 写 boatCrossing.test.js**

完整内容见「附录 A」。

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/problemTemplates/boatCrossing.test.js`
Expected: FAIL (模块不存在)

- [ ] **Step 3: 写 boatCrossing.js**

完整内容见「附录 A」。

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/problemTemplates/boatCrossing.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/problemTemplates/boatCrossing.js src/problemTemplates/boatCrossing.test.js
git commit -m "feat(templates): add boatCrossing template (3 subtemplates, easy/medium/hard)"
```

---

## Task 3: shareCandy.js + shareCandy.test.js

**Files:**
- Create: `src/problemTemplates/shareCandy.js`
- Create: `src/problemTemplates/shareCandy.test.js`

- [ ] **Step 1–5**: 同 Task 2,内容见「附录 B」。

---

## Task 4: libraryCorner.js + libraryCorner.test.js

**Files:**
- Create: `src/problemTemplates/libraryCorner.js`
- Create: `src/problemTemplates/libraryCorner.test.js`

- [ ] **Step 1–5**: 同 Task 2,内容见「附录 C」。

---

## Task 5: queueProblem.js + queueProblem.test.js

**Files:**
- Create: `src/problemTemplates/queueProblem.js`
- Create: `src/problemTemplates/queueProblem.test.js`

- [ ] **Step 1–5**: 同 Task 2,内容见「附录 D」。

---

## Task 6: redPacket.js + redPacket.test.js

**Files:**
- Create: `src/problemTemplates/redPacket.js`
- Create: `src/problemTemplates/redPacket.test.js`

- [ ] **Step 1–5**: 同 Task 2,内容见「附录 E」。

---

## Task 7: sportsScore.js + sportsScore.test.js

**Files:**
- Create: `src/problemTemplates/sportsScore.js`
- Create: `src/problemTemplates/sportsScore.test.js`

- [ ] **Step 1–5**: 同 Task 2,内容见「附录 F」。

---

## Task 8: harvestField.js + harvestField.test.js

**Files:**
- Create: `src/problemTemplates/harvestField.js`
- Create: `src/problemTemplates/harvestField.test.js`

- [ ] **Step 1–5**: 同 Task 2,内容见「附录 G」。

---

## Task 9: dutyRoster.js + dutyRoster.test.js

**Files:**
- Create: `src/problemTemplates/dutyRoster.js`
- Create: `src/problemTemplates/dutyRoster.test.js`

- [ ] **Step 1–5**: 同 Task 2,内容见「附录 H」。

---

## Task 10: constants/options.js + index.js 更新

**Files:**
- Modify: `src/constants/options.js`
- Modify: `src/problemTemplates/index.js`

- [ ] **Step 1: 更新 constants/options.js**

在 `QUESTION_TYPES` 数组中添加 8 个新 subtype。

- [ ] **Step 2: 更新 index.js**

添加 8 个新模板的 import 和 `APPLICATION_TEMPLATES` 扩展。

- [ ] **Step 3: 跑 bandCoverage 测试**

Run: `npx vitest run src/problemTemplates/bandCoverage.test.js`
Expected: PASS — A 的 8 个新模板全部被覆盖

- [ ] **Step 4: Commit**

```bash
git add src/constants/options.js src/problemTemplates/index.js
git commit -m "feat(templates): register 8 new APPLICATION_TEMPLATES and 8 QUESTION_TYPES"
```

---

## Task 11: numbersInBand.test.js 扩展覆盖 A 新模板

**Files:**
- Modify: `src/problemTemplates/numbersInBand.test.js`

- [ ] **Step 1: 扩展 numbersInBand**

在现有的 6 个模板循环基础上,追加 A 的 8 个新模板到 `ALL_TEMPLATES` 数组。

- [ ] **Step 2: 跑测试**

Run: `npx vitest run src/problemTemplates/numbersInBand.test.js`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/problemTemplates/numbersInBand.test.js
git commit -m "test(templates): extend numbersInBand to cover 8 new A templates"
```

---

## Task 12: 最终全量回归

- [ ] **Step 1: 全量测试**

Run: `npx vitest run`
Expected: 全部 PASS

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: build 成功

- [ ] **Step 3: 推送**

```bash
git push
```

---

## 自评 checklist

- [x] **Spec coverage**: §3(8 个模板)→Task 2-9; §4(pickTwoPeople)→Task 1; §5(options)→Task 10; §6(index)→Task 10; §7(test)→Tasks 2-9+11
- [x] **Placeholder scan**: 无 TBD/TODO
- [x] **Type consistency**: 所有模板用 `levelToBand`/`pickNumberByBand`/`pickTwoPeople` 一致
- [x] **Band coverage**: 每个新模板 ≥ 3 子模板(easy/medium/hard 各 ≥ 1)
- [x] **Commit granularity**: 每个模板 1 个 commit,共 9 个;Task 10/11 各 1 个

---

## 附录 A: boatCrossing.js + boatCrossing.test.js

### `src/problemTemplates/boatCrossing.js`

```js
import { pickNumberByBand, levelToBand } from './helpers.js';

function generateBoatSubtemplates() {
  return [
    {
      id: 'boat-two',
      band: 'easy',
      generate(rng) {
        const person = pickPerson(rng);
        const people = pickNumberByBand(rng, 'easy', { min: 4, max: 12 });
        const perBoat = 2;
        const boats = Math.ceil(people / perBoat);
        const remain = boats * perBoat - people;
        return {
          question: `${person}和${people - 1}个小朋友一共${people}人,每条船坐${perBoat}人,需要几条船?`,
          answer: `${boats}条`,
          subtype: 'boat-crossing',
          payload: { people, perBoat, boats, remain },
        };
      },
    },
    {
      id: 'boat-three',
      band: 'medium',
      generate(rng) {
        const person = pickPerson(rng);
        const people = pickNumberByBand(rng, 'medium', { min: 8, max: 25 });
        const perBoat = 3;
        const boats = Math.ceil(people / perBoat);
        const remain = boats * perBoat - people;
        return {
          question: `${person}和${people - 1}个小朋友一共${people}人,每条船坐${perBoat}人,需要几条船?还剩几个座位?`,
          answer: `需要${boats}条船,剩${remain}个座位`,
          subtype: 'boat-crossing',
          payload: { people, perBoat, boats, remain },
        };
      },
    },
    {
      id: 'boat-compete',
      band: 'hard',
      generate(rng) {
        const [person1, person2] = pickTwoPeople(rng);
        const people1 = pickNumberByBand(rng, 'hard', { min: 10, max: 30 });
        const people2 = pickNumberByBand(rng, 'hard', { min: 10, max: 30 });
        const perBoat = 4;
        const pricePerBoat = pickNumberByBand(rng, 'hard', { min: 20, max: 50 });
        const boats1 = Math.ceil(people1 / perBoat);
        const boats2 = Math.ceil(people2 / perBoat);
        const total1 = boats1 * pricePerBoat;
        const total2 = boats2 * pricePerBoat;
        return {
          question: `${person1}组织了${people1}人,${person2}组织了${people2}人,每条船坐${perBoat}人,每条船${pricePerBoat}元。${person1}要租几艘船?一共多少钱?`,
          answer: `需要${boats1}条船,共${total1}元`,
          subtype: 'boat-crossing',
          payload: { people1, people2, perBoat, pricePerBoat, boats1, boats2, total1, total2 },
        };
      },
    },
  ];
}

export const boatCrossingTemplate = {
  id: 'boat-crossing',
  gradeRange: ['3', '4', '5', '6'],
  semester: 'all',
  subtemplates: generateBoatSubtemplates(),
  generate(rng, difficultyLevel) {
    const band = levelToBand(difficultyLevel);
    const pool = this.subtemplates.filter(t => t.band === band);
    return rng.pick(pool).generate(rng);
  },
};
```

### `src/problemTemplates/boatCrossing.test.js`

```js
import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { boatCrossingTemplate } from './boatCrossing.js';

describe('boatCrossingTemplate', () => {
  for (const band of ['easy', 'medium', 'hard']) {
    it(`${band}: boats = ceil(people / perBoat)`, () => {
      const level = { easy: 1, medium: 2, hard: 3 }[band];
      const rng = createRng(band);
      const result = boatCrossingTemplate.generate(rng, level);
      const { people, perBoat, boats } = result.payload;
      expect(boats).toBe(Math.ceil(people / perBoat));
    });
    it(`${band}: answer contains boat count`, () => {
      const level = { easy: 1, medium: 2, hard: 3 }[band];
      const rng = createRng(band);
      const result = boatCrossingTemplate.generate(rng, level);
      expect(result.answer).toMatch(/\d+条/);
    });
  }
});
```

---

## 附录 B: shareCandy.js + shareCandy.test.js

### `src/problemTemplates/shareCandy.js`

```js
import { pickNumberByBand, pickPerson, levelToBand } from './helpers.js';

function generateShareSubtemplates() {
  return [
    {
      id: 'share-give',
      band: 'easy',
      generate(rng) {
        const person = pickPerson(rng);
        const each = pickNumberByBand(rng, 'easy', { min: 2, max: 6 });
        const people = pickNumberByBand(rng, 'easy', { min: 2, max: 5 });
        const total = each * people;
        return {
          question: `${person}给每位小朋友分${each}颗糖,分给了${people}位小朋友,一共分了多少颗糖?`,
          answer: `${total}颗`,
          subtype: 'share-candy',
          payload: { each, people, total },
        };
      },
    },
    {
      id: 'share-remaining',
      band: 'medium',
      generate(rng) {
        const person = pickPerson(rng);
        const people = pickNumberByBand(rng, 'medium', { min: 3, max: 8 });
        const each = pickNumberByBand(rng, 'medium', { min: 3, max: 7 });
        const total = people * each + pickNumberByBand(rng, 'medium', { min: 1, max: people - 1 });
        return {
          question: `${person}有一些糖,每位小朋友分${each}颗,分给了${people}位小朋友,还剩${total - people * each}颗。${person}原来有多少颗糖?`,
          answer: `${total}颗`,
          subtype: 'share-candy',
          payload: { people, each, total, remain: total - people * each },
        };
      },
    },
    {
      id: 'share-half',
      band: 'hard',
      generate(rng) {
        const person = pickPerson(rng);
        const final = pickNumberByBand(rng, 'hard', { min: 3, max: 10 });
        const steps = pickNumberByBand(rng, 'hard', { min: 2, max: 4 });
        // 逆推:每次拿走一半剩1,求原有
        let current = final;
        for (let i = 0; i < steps; i++) {
          current = current * 2 + 1;
        }
        return {
          question: `${person}有一些糖,每次拿走一半多1颗,拿了${steps}次后剩${final}颗。原来有多少颗?`,
          answer: `${current}颗`,
          subtype: 'share-candy',
          payload: { steps, final, original: current },
        };
      },
    },
  ];
}

export const shareCandyTemplate = {
  id: 'share-candy',
  gradeRange: ['2', '3', '4', '5'],
  semester: 'all',
  subtemplates: generateShareSubtemplates(),
  generate(rng, difficultyLevel) {
    const band = levelToBand(difficultyLevel);
    const pool = this.subtemplates.filter(t => t.band === band);
    return rng.pick(pool).generate(rng);
  },
};
```

### `src/problemTemplates/shareCandy.test.js`

```js
import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { shareCandyTemplate } from './shareCandy.js';

describe('shareCandyTemplate', () => {
  for (const band of ['easy', 'medium', 'hard']) {
    it(`${band}: total = each * people (easy) or answer is integer`, () => {
      const level = { easy: 1, medium: 2, hard: 3 }[band];
      const rng = createRng(band);
      const result = shareCandyTemplate.generate(rng, level);
      expect(result.answer).toMatch(/\d+颗/);
    });
  }
  it('hard: inverse half-back formula', () => {
    const rng = createRng(42);
    const result = shareCandyTemplate.generate(rng, 3);
    const { steps, final, original } = result.payload;
    // 逆推验证
    let cur = final;
    for (let i = 0; i < steps; i++) cur = cur * 2 + 1;
    expect(cur).toBe(original);
  });
});
```

---

## 附录 C: libraryCorner.js + libraryCorner.test.js

### `src/problemTemplates/libraryCorner.js`

```js
import { pickNumberByBand, pickPerson, levelToBand } from './helpers.js';

function generateLibrarySubtemplates() {
  return [
    {
      id: 'library-borrow',
      band: 'easy',
      generate(rng) {
        const person = pickPerson(rng);
        const total = pickNumberByBand(rng, 'easy', { min: 20, max: 50 });
        const borrow = pickNumberByBand(rng, 'easy', { min: 5, max: 15 });
        const back = pickNumberByBand(rng, 'easy', { min: 3, max: 10 });
        const remain = total - borrow + back;
        return {
          question: `图书角有${total}本书,${person}借走了${borrow}本,后来又还了${back}本。还剩多少本?`,
          answer: `${remain}本`,
          subtype: 'library',
          payload: { total, borrow, back, remain },
        };
      },
    },
    {
      id: 'library-fine',
      band: 'medium',
      generate(rng) {
        const person = pickPerson(rng);
        const borrow = pickNumberByBand(rng, 'medium', { min: 10, max: 30 });
        const daysLate = pickNumberByBand(rng, 'medium', { min: 3, max: 10 });
        const finePerDay = pickNumberByBand(rng, 'medium', { min: 1, max: 3 });
        const fine = borrow * daysLate * finePerDay;
        return {
          question: `${person}借了${borrow}本书,每本每天超期罚款${finePerDay}角,迟了${daysLate}天,应付多少角罚款?`,
          answer: `${fine}角`,
          subtype: 'library',
          payload: { borrow, daysLate, finePerDay, fine },
        };
      },
    },
    {
      id: 'library-inventory',
      band: 'hard',
      generate(rng) {
        const person = pickPerson(rng);
        const start = pickNumberByBand(rng, 'hard', { min: 50, max: 100 });
        const op1 = pickNumberByBand(rng, 'hard', { min: 15, max: 30 });
        const op2 = pickNumberByBand(rng, 'hard', { min: 10, max: 25 });
        const final = start - op1 + op2;
        return {
          question: `${person}图书角原有${start}本,先借出${op1}本,又还入${op2}本。现在有多少本?`,
          answer: `${final}本`,
          subtype: 'library',
          payload: { start, op1, op2, final },
        };
      },
    },
  ];
}

export const libraryCornerTemplate = {
  id: 'library',
  gradeRange: ['2', '3', '4', '5'],
  semester: 'all',
  subtemplates: generateLibrarySubtemplates(),
  generate(rng, difficultyLevel) {
    const band = levelToBand(difficultyLevel);
    const pool = this.subtemplates.filter(t => t.band === band);
    return rng.pick(pool).generate(rng);
  },
};
```

### `src/problemTemplates/libraryCorner.test.js`

```js
import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { libraryCornerTemplate } from './libraryCorner.js';

describe('libraryCornerTemplate', () => {
  for (const band of ['easy', 'medium', 'hard']) {
    it(`${band}: answer is positive integer`, () => {
      const level = { easy: 1, medium: 2, hard: 3 }[band];
      const rng = createRng(band);
      const result = libraryCornerTemplate.generate(rng, level);
      expect(result.payload.final ?? result.payload.remain).toBeGreaterThan(0);
    });
  }
});
```

---

## 附录 D: queueProblem.js + queueProblem.test.js

### `src/problemTemplates/queueProblem.js`

```js
import { pickNumberByBand, pickPerson, pickTwoPeople, levelToBand } from './helpers.js';

function generateQueueSubtemplates() {
  return [
    {
      id: 'queue-position',
      band: 'easy',
      generate(rng) {
        const person = pickPerson(rng);
        const front = pickNumberByBand(rng, 'easy', { min: 1, max: 5 });
        const behind = pickNumberByBand(rng, 'easy', { min: 1, max: 5 });
        const total = front + 1 + behind;
        return {
          question: `${person}排队,前面有${front}人,后面有${behind}人。这一队一共多少人?`,
          answer: `${total}人`,
          subtype: 'queue',
          payload: { person, front, behind, total },
        };
      },
    },
    {
      id: 'queue-swap',
      band: 'medium',
      generate(rng) {
        const [a, b] = pickTwoPeople(rng);
        const posA = pickNumberByBand(rng, 'medium', { min: 1, max: 8 });
        const posB = pickNumberByBand(rng, 'medium', { min: 1, max: 8 });
        const swap = Math.abs(posA - posB);
        return {
          question: `${a}排在第${posA}位,${b}排在第${posB}位。如果交换位置,${a}比${b}靠前多少位?`,
          answer: `${swap}位`,
          subtype: 'queue',
          payload: { a, b, posA, posB, swap },
        };
      },
    },
    {
      id: 'queue-ticket',
      band: 'hard',
      generate(rng) {
        const person = pickPerson(rng);
        const total = pickNumberByBand(rng, 'hard', { min: 10, max: 30 });
        const pos = pickNumberByBand(rng, 'hard', { min: 2, max: total - 1 });
        const skip = pickNumberByBand(rng, 'hard', { min: 1, max: 5 });
        const behind = total - pos - skip;
        return {
          question: `${person}购票时前面有${total - pos}人,每1人购票需要${skip}分钟,轮到他时需要等多少分钟?`,
          answer: `${(total - pos) * skip}分钟`,
          subtype: 'queue',
          payload: { total, pos, skip, wait: (total - pos) * skip },
        };
      },
    },
  ];
}

export const queueProblemTemplate = {
  id: 'queue',
  gradeRange: ['1', '2', '3', '4', '5'],
  semester: 'all',
  subtemplates: generateQueueSubtemplates(),
  generate(rng, difficultyLevel) {
    const band = levelToBand(difficultyLevel);
    const pool = this.subtemplates.filter(t => t.band === band);
    return rng.pick(pool).generate(rng);
  },
};
```

### `src/problemTemplates/queueProblem.test.js`

```js
import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { queueProblemTemplate } from './queueProblem.js';

describe('queueProblemTemplate', () => {
  for (const band of ['easy', 'medium', 'hard']) {
    it(`${band}: front + 1 + behind = total`, () => {
      const level = { easy: 1, medium: 2, hard: 3 }[band];
      const rng = createRng(band);
      const result = queueProblemTemplate.generate(rng, level);
      if (band === 'easy') {
        const { front, behind, total } = result.payload;
        expect(front + 1 + behind).toBe(total);
      }
    });
  }
});
```

---

## 附录 E: redPacket.js + redPacket.test.js

### `src/problemTemplates/redPacket.js`

```js
import { pickNumberByBand, levelToBand } from './helpers.js';

function generateRedPacketSubtemplates() {
  return [
    {
      id: 'redpacket-receive',
      band: 'easy',
      generate(rng) {
        const r1 = pickNumberByBand(rng, 'easy', { min: 5, max: 20 });
        const r2 = pickNumberByBand(rng, 'easy', { min: 5, max: 20 });
        const total = r1 + r2;
        return {
          question: `过年了,小明收到${r1}元和${r2}元红包,一共收到多少钱?`,
          answer: `${total}元`,
          subtype: 'red-packet',
          payload: { r1, r2, total },
        };
      },
    },
    {
      id: 'redpacket-spend',
      band: 'medium',
      generate(rng) {
        const income = pickNumberByBand(rng, 'medium', { min: 20, max: 80 });
        const spend = pickNumberByBand(rng, 'medium', { min: 5, max: income - 10 });
        const remain = income - spend;
        return {
          question: `小红收到红包${income}元,买玩具花了${spend}元,还剩多少元?`,
          answer: `${remain}元`,
          subtype: 'red-packet',
          payload: { income, spend, remain },
        };
      },
    },
    {
      id: 'redpacket-balance',
      band: 'hard',
      generate(rng) {
        const i1 = pickNumberByBand(rng, 'hard', { min: 20, max: 50 });
        const i2 = pickNumberByBand(rng, 'hard', { min: 10, max: 40 });
        const s1 = pickNumberByBand(rng, 'hard', { min: 5, max: i1 - 5 });
        const s2 = pickNumberByBand(rng, 'hard', { min: 3, max: i2 - 3 });
        const final = i1 + i2 - s1 - s2;
        return {
          question: `小华收到两个红包${i1}元和${i2}元,买书花了${s1}元,买文具花了${s2}元。还剩多少元?`,
          answer: `${final}元`,
          subtype: 'red-packet',
          payload: { i1, i2, s1, s2, final },
        };
      },
    },
  ];
}

export const redPacketTemplate = {
  id: 'red-packet',
  gradeRange: ['1', '2', '3', '4', '5'],
  semester: 'all',
  subtemplates: generateRedPacketSubtemplates(),
  generate(rng, difficultyLevel) {
    const band = levelToBand(difficultyLevel);
    const pool = this.subtemplates.filter(t => t.band === band);
    return rng.pick(pool).generate(rng);
  },
};
```

### `src/problemTemplates/redPacket.test.js`

```js
import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { redPacketTemplate } from './redPacket.js';

describe('redPacketTemplate', () => {
  for (const band of ['easy', 'medium', 'hard']) {
    it(`${band}: income - spend = remain`, () => {
      const level = { easy: 1, medium: 2, hard: 3 }[band];
      const rng = createRng(band);
      const result = redPacketTemplate.generate(rng, level);
      if (band !== 'easy') {
        const { income, spend, remain } = result.payload;
        expect(income - spend).toBe(remain);
      }
    });
  }
});
```

---

## 附录 F: sportsScore.js + sportsScore.test.js

### `src/problemTemplates/sportsScore.js`

```js
import { pickNumberByBand, levelToBand } from './helpers.js';

function generateSportsSubtemplates() {
  return [
    {
      id: 'sports-single',
      band: 'easy',
      generate(rng) {
        const win = pickNumberByBand(rng, 'easy', { min: 1, max: 4 });
        const score = win * 3;
        return {
          question: `球队赢了${win}场比赛(每场3分),总积分是多少?`,
          answer: `${score}分`,
          subtype: 'sports-score',
          payload: { win, score },
        };
      },
    },
    {
      id: 'sports-team',
      band: 'medium',
      generate(rng) {
        const win = pickNumberByBand(rng, 'medium', { min: 2, max: 8 });
        const draw = pickNumberByBand(rng, 'medium', { min: 1, max: 5 });
        const score = win * 3 + draw;
        return {
          question: `球队赢了${win}场(每场3分),平了${draw}场(每场1分),球队总积分是多少?`,
          answer: `${score}分`,
          subtype: 'sports-score',
          payload: { win, draw, score },
        };
      },
    },
    {
      id: 'sports-rank',
      band: 'medium',
      generate(rng) {
        const a = pickNumberByBand(rng, 'medium', { min: 5, max: 15 });
        const b = pickNumberByBand(rng, 'medium', { min: 3, max: a - 1 });
        const c = pickNumberByBand(rng, 'medium', { min: 1, max: b - 1 });
        return {
          question: `三支球队积分分别是${a}分、${b}分、${c}分,前三名是谁?`,
          answer: `第一名${a}分,第二名${b}分,第三名${c}分`,
          subtype: 'sports-score',
          payload: { a, b, c },
        };
      },
    },
    {
      id: 'sports-relay',
      band: 'hard',
      generate(rng) {
        const t1 = pickNumberByBand(rng, 'hard', { min: 10, max: 30 });
        const t2 = pickNumberByBand(rng, 'hard', { min: 10, max: 30 });
        const t3 = pickNumberByBand(rng, 'hard', { min: 10, max: 30 });
        const total = t1 + t2 + t3;
        const record = total + pickNumberByBand(rng, 'hard', { min: 1, max: 20 });
        const diff = record - total;
        return {
          question: `接力赛三人分别用时${t1}秒、${t2}秒、${t3}秒,总成绩是多少秒?比纪录${record}秒快几秒?`,
          answer: `总成绩${total}秒,快${diff}秒`,
          subtype: 'sports-score',
          payload: { t1, t2, t3, total, record, diff },
        };
      },
    },
  ];
}

export const sportsScoreTemplate = {
  id: 'sports-score',
  gradeRange: ['3', '4', '5', '6'],
  semester: 'all',
  subtemplates: generateSportsSubtemplates(),
  generate(rng, difficultyLevel) {
    const band = levelToBand(difficultyLevel);
    const pool = this.subtemplates.filter(t => t.band === band);
    return rng.pick(pool).generate(rng);
  },
};
```

### `src/problemTemplates/sportsScore.test.js`

```js
import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { sportsScoreTemplate } from './sportsScore.js';

describe('sportsScoreTemplate', () => {
  for (const [band, level] of [['easy', 1], ['medium', 2], ['hard', 3]]) {
    it(`${band}: answer is non-empty string`, () => {
      const rng = createRng(band);
      const result = sportsScoreTemplate.generate(rng, level);
      expect(typeof result.answer).toBe('string');
      expect(result.answer.length).toBeGreaterThan(0);
    });
  }
  it('medium: score = win*3 + draw', () => {
    const rng = createRng(1);
    const result = sportsScoreTemplate.generate(rng, 2);
    const { win, draw, score } = result.payload;
    expect(score).toBe(win * 3 + draw);
  });
  it('easy: score = win * 3', () => {
    const rng = createRng(1);
    const result = sportsScoreTemplate.generate(rng, 1);
    const { win, score } = result.payload;
    expect(score).toBe(win * 3);
  });
  it('hard: total = sum of three times', () => {
    const rng = createRng(3);
    const result = sportsScoreTemplate.generate(rng, 3);
    const { t1, t2, t3, total } = result.payload;
    expect(total).toBe(t1 + t2 + t3);
  });
});
```

---

## 附录 G: harvestField.js + harvestField.test.js

### `src/problemTemplates/harvestField.js`

```js
import { pickNumberByBand, levelToBand } from './helpers.js';

function generateHarvestSubtemplates() {
  return [
    {
      id: 'harvest-grain',
      band: 'easy',
      generate(rng) {
        const yield_ = pickNumberByBand(rng, 'easy', { min: 50, max: 150 });
        const area = pickNumberByBand(rng, 'easy', { min: 2, max: 8 });
        const total = yield_ * area;
        return {
          question: `稻谷亩产量是${yield_}公斤,${area}亩收了稻谷多少公斤?`,
          answer: `${total}公斤`,
          subtype: 'harvest',
          payload: { yield_, area, total },
        };
      },
    },
    {
      id: 'harvest-area',
      band: 'medium',
      generate(rng) {
        const total = pickNumberByBand(rng, 'medium', { min: 500, max: 2000 });
        const yield_ = pickNumberByBand(rng, 'medium', { min: 80, max: 200 });
        const area = Math.round(total / yield_ * 10) / 10;
        return {
          question: `收了稻谷${total}公斤,亩产量是${yield_}公斤,种了多少亩?`,
          answer: `${area}亩`,
          subtype: 'harvest',
          payload: { total, yield_, area },
        };
      },
    },
    {
      id: 'harvest-compare',
      band: 'hard',
      generate(rng) {
        const y1 = pickNumberByBand(rng, 'hard', { min: 100, max: 200 });
        const a1 = pickNumberByBand(rng, 'hard', { min: 3, max: 8 });
        const y2 = pickNumberByBand(rng, 'hard', { min: 80, max: y1 - 10 });
        const a2 = a1 + pickNumberByBand(rng, 'hard', { min: 1, max: 3 });
        const t1 = y1 * a1;
        const t2 = y2 * a2;
        const diff = Math.abs(t1 - t2);
        const better = t1 > t2 ? '第一块' : '第二块';
        return {
          question: `第一块亩产${y1}公斤,面积${a1}亩;第二块亩产${y2}公斤,面积${a2}亩。哪块地产量高?高多少?`,
          answer: `${better}高${diff}公斤`,
          subtype: 'harvest',
          payload: { y1, a1, y2, a2, t1, t2, diff },
        };
      },
    },
  ];
}

export const harvestFieldTemplate = {
  id: 'harvest',
  gradeRange: ['3', '4', '5', '6'],
  semester: 'all',
  subtemplates: generateHarvestSubtemplates(),
  generate(rng, difficultyLevel) {
    const band = levelToBand(difficultyLevel);
    const pool = this.subtemplates.filter(t => t.band === band);
    return rng.pick(pool).generate(rng);
  },
};
```

### `src/problemTemplates/harvestField.test.js`

```js
import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { harvestFieldTemplate } from './harvestField.js';

describe('harvestFieldTemplate', () => {
  it('easy: total = yield * area', () => {
    const rng = createRng(1);
    const result = harvestFieldTemplate.generate(rng, 1);
    const { yield_, area, total } = result.payload;
    expect(total).toBe(yield_ * area);
  });
  it('hard: t1 = y1 * a1', () => {
    const rng = createRng(3);
    const result = harvestFieldTemplate.generate(rng, 3);
    const { y1, a1, t1 } = result.payload;
    expect(t1).toBe(y1 * a1);
  });
});
```

---

## 附录 H: dutyRoster.js + dutyRoster.test.js

### `src/problemTemplates/dutyRoster.js`

```js
import { pickNumberByBand, levelToBand } from './helpers.js';

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

function dayName(offset) {
  return WEEKDAYS[offset % 7];
}

function generateDutySubtemplates() {
  return [
    {
      id: 'duty-weekday',
      band: 'easy',
      generate(rng) {
        const today = pickNumberByBand(rng, 'easy', { min: 0, max: 4 }); // 周一到周五
        const later = pickNumberByBand(rng, 'easy', { min: 1, max: 5 });
        const target = (today + later) % 7;
        return {
          question: `今天是星期${WEEKDAYS[today]},再过${later}天是星期几?`,
          answer: `星期${dayName(target)}`,
          subtype: 'duty-roster',
          payload: { today, later, target },
        };
      },
    },
    {
      id: 'duty-roster',
      band: 'medium',
      generate(rng) {
        const K = pickNumberByBand(rng, 'medium', { min: 3, max: 8 });
        const cycle = 5;
        const dayIndex = K % cycle;
        return {
          question: `班级值日按周一至周五循环,小明了第${K}个值日,那天是星期几?`,
          answer: `星期${WEEKDAYS[dayIndex]}五`,
          subtype: 'duty-roster',
          payload: { K, cycle, dayIndex },
        };
      },
    },
    {
      id: 'duty-last',
      band: 'hard',
      generate(rng) {
        const today = pickNumberByBand(rng, 'hard', { min: 0, max: 4 });
        const later = pickNumberByBand(rng, 'hard', { min: 1, max: 14 });
        const target = (today + later) % 7;
        return {
          question: `今天是星期${WEEKDAYS[today]},小华要在${later}天后的值日,那天是星期几?`,
          answer: `星期${dayName(target)}`,
          subtype: 'duty-roster',
          payload: { today, later, target },
        };
      },
    },
  ];
}

export const dutyRosterTemplate = {
  id: 'duty-roster',
  gradeRange: ['2', '3', '4', '5', '6'],
  semester: 'all',
  subtemplates: generateDutySubtemplates(),
  generate(rng, difficultyLevel) {
    const band = levelToBand(difficultyLevel);
    const pool = this.subtemplates.filter(t => t.band === band);
    return rng.pick(pool).generate(rng);
  },
};
```

### `src/problemTemplates/dutyRoster.test.js`

```js
import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { dutyRosterTemplate } from './dutyRoster.js';

describe('dutyRosterTemplate', () => {
  it('(today + later) % 7 matches answer', () => {
    const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];
    for (const band of ['easy', 'medium', 'hard']) {
      const level = { easy: 1, medium: 2, hard: 3 }[band];
      const rng = createRng(band);
      const result = dutyRosterTemplate.generate(rng, level);
      const { today, later, target } = result.payload;
      expect((today + later) % 7).toBe(target);
    }
  });
});
```
