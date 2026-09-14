# 子项目 A: 中文经典情境题型

**项目**: PrimarySchoolMathematicsGenerator
**日期**: 2026-09-14
**状态**: Draft
**优先级**: 高（A/B/C 子项目的独立一条线）
**前置依赖**: D（helpers.js band 契约）✅ 已完成
**作者**: Codex (brainstorming)

---

## 1. 背景与目标

### 1.1 现状

B 和 C 扩展了题型数量（工程、浓度、数论等）和难度梯度，但所有情境仍以"小明买东西"、"老师发苹果"为基础框架。

这类题目有两类问题：
1. **情境同质化** — 所有题目套同一批中文人物名 + 超市/学校模板，缺乏真实感
2. **推理深度不足** — 多是单计算节点，应用题广度和奥数深度扩展了一步推理，但缺少中国孩子日常熟悉场景下的多步骤推理

### 1.2 重构目标

| 目标 | 验证手段 |
|---|---|
| 引入 8–10 种中国孩子熟悉的生活/校园场景 | 新模板文件清单 |
| 每种场景 ≥ 2 个子模板（easy + medium/hard）| `bandCoverage.test.js` |
| 题目均为两步以上推理（部分题需要三步）| 代码 review + 测试断言 |
| 新情境不与 B/C 的纯数学结构重复 | subtype 命名区分 |
| helpers.js 新增中文情境专属辅助函数 | `helpers.test.js` |

---

## 2. 数据模型（沿用 D 契约）

与 D/B/C 契约完全一致，每个场景模板：

```js
{
  id: 'boat-crossing-complex',
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
}
```

---

## 3. 新模板详情

### 3.1 划船渡河（`boatCrossing.js`）

**情境**: 小朋友去公园划船，有双人船和四人船，多少人需要几条船？剩余座位浪费多少？

**核心结构**: 除法取商+取余，一步求船数，一步求剩余座位。

| 子模板 | band | 描述 |
|---|---|---|
| `boat-two` | easy | 已知人数，每船坐 2 人，求船数 |
| `boat-three` | medium | 每船坐 3 人，允许剩 1–2 人，求船数 |
| `boat-compete` | hard | 两组人分别租船，总费用比较 |

**两步推理链**: 人数 → 船数 → 费用

### 3.2 分糖/分水果（`shareCandy.js`）

**情境**: 老师把糖果/水果按一定规则分给小朋友，或小朋友之间互相分。

**核心结构**: 平均分（出发）→ 余数处理；或 已知余数反推总数（逆推）。

| 子模板 | band | 描述 |
|---|---|---|
| `share-candy` | easy | 每人分 N 颗，剩 M 颗，求总数 |
| `share-apple` | medium | 已知总数和每人分得数，有剩余，求人数范围 |
| `share-reduce` | medium | 每次拿走一半，最后剩 1，问原有多少（逆推）|

**两步推理链**: 总数 ÷ 人数 → 检查余数；或 余数条件 → 反推初始

### 3.3 班级图书角（`libraryCorner.js`）

**情境**: 学校图书角藏书、借书、还书的流程，涉及图书数量变化。

**核心结构**: 借出（减）、还入（加）、损坏（减），最终求某状态。

| 子模板 | band | 描述 |
|---|---|---|
| `library-borrow` | easy | 原有书数，借出若干，还回若干，求剩余 |
| `library-damage` | medium | 借出后损坏赔偿，求实际赔款 |
| `library-inventory` | hard | 三次借还操作，求最终数量，已知每次变动，求中间状态 |

**三步推理链**: 原有 → 借出 → 还入 → 最终

### 3.4 排队问题（`queueProblem.js`）

**情境**: 班级排队、电影院购票、食堂打饭等涉及顺序和人数的场景。

**核心结构**: 已知排第几位 + 前后各几人 → 求总人数；或 已知位置关系求某人在队列中的位置。

| 子模板 | band | 描述 |
|---|---|---|
| `queue-position` | easy | 小明排第几，他前面 N 人，后面 M 人，求全队人数 |
| `queue-relative` | medium | 两人位置关系已知，求交换后的位置 |
| `queue-ticket` | hard | 购票排队，有人退票，动态求某人购票时排在第几位 |

**两步推理链**: 位置 + 前后人数 → 总数

### 3.5 春节红包（`redPacket.js`）

**情境**: 过年收红包、给红包、算余额，熟悉的春节经济场景。

**核心结构**: 收入（加）、支出（减）、余额计算；或 给定余额反推收入。

| 子模板 | band | 描述 |
|---|---|---|
| `redpacket-receive` | easy | 收到若干红包，求总收入 |
| `redpacket-spend` | medium | 收入红包，花掉一部分，求剩余 |
| `redpacket-calculate` | hard | 已知三笔收入+两笔支出+最终余额，列出等式求某笔未知数 |

**三步推理链**: 收入1 + 收入2 - 支出1 - 支出2 = 最终余额

### 3.6 运动会/比赛计分（`sportsScore.js`）

**情境**: 班级运动会、个人赛、接力赛的成绩和计分系统。

**核心结构**: 积分制（赢一场 N 分，平一场 M 分）+ 赛季总分 → 推算胜平负。

| 子模板 | band | 描述 |
|---|---|---|
| `sports-team` | medium | 已知胜平负场数，求总分 |
| `sports-rank` | medium | 已知若干队积分，推算排名关系 |
| `sports-relay` | hard | 接力赛每人时间求和，与记录比较 |

**两步推理链**: 胜×3 + 平×1 → 总分

### 3.7 田园收割（`harvestField.js`）

**情境**: 农村/田园题材，收割稻谷/小麦/玉米，涉及重量、单产、面积关系。

**核心结构**: 单产 × 面积 = 总产量；或 总产量 ÷ 单产 = 面积。

| 子模板 | band | 描述 |
|---|---|---|
| `harvest-grain` | easy | 已知稻谷亩产量和亩数，求总产量 |
| `harvest-area` | medium | 已知总产量和单产，求种植面积 |
| `harvest-compare` | hard | 两块地分别算产量，比较哪种收益高 |

**两步推理链**: 单产 × 面积 → 总产量，比较大小

### 3.8 校园值日（`dutyRoster.js`）

**情境**: 班级值日表排班、轮流、每周循环，涉及周期和余数。

**核心结构**: 周期问题（同余）的变形，周期长度通常为 5–7（对应周一到周五）。

| 子模板 | band | 描述 |
|---|---|---|
| `duty-weekly` | easy | 今天是星期几，再过 N 天是星期几 |
| `duty-roster` | medium | 值日顺序已知，某同学排在第 K 位，求对应星期几 |
| `duty-teacher` | hard | 老师指定某同学值日，已知该同学序号和周期，求日期 |

**两步推理链**: 序号 → 周数取余 → 对应星期

---

## 4. helpers.js 扩展

新增两个中文情境专属函数：

```js
/**
 * 生成不重复的两个人物名（来自 PEOPLE_POOL）
 */
export function pickTwoPeople(rng) {
  const a = pickPerson(rng);
  const b = pickPerson(rng);
  return a === b ? pickTwoPeople(rng) : [a, b];
}

/**
 * 生成一个随机的中国节日/季节场景关键词
 */
export function pickScenario() {
  // 用于题目文本润色，可选：春节、中秋、国庆、暑假、农历新年等
}
```

---

## 5. constants/options.js 变更

```js
// A 新增
export const QUESTION_TYPES = [
  'arithmetic', 'application', 'olympiad',
  // A 新增：
  'boat-crossing', 'share-candy', 'library',
  'queue', 'red-packet', 'sports-score',
  'harvest', 'duty-roster',
];
```

---

## 6. index.js 变更

```js
// A 新增
import { boatCrossingTemplate } from './boatCrossing.js';
import { shareCandyTemplate } from './shareCandy.js';
import { libraryCornerTemplate } from './libraryCorner.js';
import { queueProblemTemplate } from './queueProblem.js';
import { redPacketTemplate } from './redPacket.js';
import { sportsScoreTemplate } from './sportsScore.js';
import { harvestFieldTemplate } from './harvestField.js';
import { dutyRosterTemplate } from './dutyRoster.js';

// APPLICATION_TEMPLATES 扩展
export const APPLICATION_TEMPLATES = [
  shoppingTemplate, timeTemplate, comparisonTemplate, chickenRabbitTemplate,
  // B 新增：engineering, concentration, distance, ratio, statistics
  // A 新增：
  boatCrossingTemplate, shareCandyTemplate, libraryCornerTemplate,
  queueProblemTemplate, redPacketTemplate, sportsScoreTemplate,
  harvestFieldTemplate, dutyRosterTemplate,
];
```

---

## 7. 测试

| 文件 | 内容 |
|---|---|
| `boatCrossing.test.js` | 断言船数 = ceil(人数/每船人数) |
| `shareCandy.test.js` | 断言总数 = 商×人数 + 余数 |
| `libraryCorner.test.js` | 断言借还操作后数量正确 |
| `queueProblem.test.js` | 断言总人数 = 前 + 本人 + 后 |
| `redPacket.test.js` | 断言余额 = 收入 - 支出 |
| `sportsScore.test.js` | 断言总分 = 胜×3 + 平×1 |
| `harvestField.test.js` | 断言总产量 = 单产 × 面积 |
| `dutyRoster.test.js` | 断言星期计算 (todayIndex + days) % 7 正确 |
| `bandCoverage.test.js` | 扩展：每个 A 新模板三 band 各 ≥ 1 子模板 |
| `numbersInBand.test.js` | 扩展：每个 A 新模板各难度生成 200 次 |

---

## 8. 显式不在范围

| 不做 | 留给 |
|---|---|
| 需要画图的几何证明/面积题 | 后续版本 |
| 涉及汇率/货币换算（现实复杂）| 后续版本 |
| 超出小学知识范围的经济概念 | 后续版本 |
| UI 按情境类型过滤 | UI 子项目 |

---

## 9. 交付物清单

- 新文件：`boatCrossing.js`、`shareCandy.js`、`libraryCorner.js`、`queueProblem.js`、`redPacket.js`、`sportsScore.js`、`harvestField.js`、`dutyRoster.js`
- helpers.js 新增 `pickTwoPeople`、`pickScenario`
- `constants/options.js` 新增 8 个 subtype
- `index.js` 更新 `APPLICATION_TEMPLATES`
- 每个新模板对应 `*.test.js`
- `bandCoverage.test.js`、`numbersInBand.test.js` 扩展覆盖新模板
