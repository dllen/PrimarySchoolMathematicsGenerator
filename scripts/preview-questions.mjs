#!/usr/bin/env node
/**
 * 多样化题目预览 CLI
 * 跑法:
 *   node scripts/preview-questions.mjs [--count=25] [--grade=3] [--difficulty=medium]
 *                                      [--type=both] [--seed=N]
 *
 * 按模板分组打印 N 道应用题/奥数题,展示类型覆盖情况。
 */

import { createRng } from '../src/utils/rng.js';
import { ApplicationStrategy } from '../src/strategies/ApplicationStrategy.js';
import { OlympiadStrategy } from '../src/strategies/OlympiadStrategy.js';
import {
  buildComposition,
  enumerateSubtypes,
  computeCap,
} from '../src/problemTemplates/diversity.js';
import { levelToBand } from '../src/problemTemplates/helpers.js';

const ARGS = parseArgs(process.argv.slice(2));

function parseArgs(argv) {
  const out = {
    count: 25,
    grade: '3',
    difficulty: 'medium',
    type: 'both',
    seed: Date.now(),
  };
  for (const a of argv) {
    if (a === '--help') { printHelp(); process.exit(0); }
    const m = a.match(/^--(\w+)=(.+)$/);
    if (!m) continue;
    const [, k, v] = m;
    if (k === 'count') out.count = Math.max(1, parseInt(v, 10) || 25);
    else if (k === 'grade') out.grade = String(v);
    else if (k === 'difficulty') out.difficulty = v;
    else if (k === 'type') out.type = v;
    else if (k === 'seed') out.seed = parseInt(v, 10) || Date.now();
  }
  return out;
}

function printHelp() {
  console.log(`用法: node scripts/preview-questions.mjs [options]

选项:
  --count=N               总题数(默认 25)
  --grade=N               年级 1-6(默认 3)
  --difficulty=easy|medium|hard(默认 medium)
  --type=application|olympiad|both(默认 both)
  --seed=N                固定随机种子(默认 Date.now())
  --help                  打印此帮助`);
}

// ---------- 主循环(复用生产端 dedup 思路) ----------

const config = {
  grade: ARGS.grade,
  semester: '上',
  questionTypes: ARGS.type === 'application' ? ['application']
                : ARGS.type === 'olympiad' ? ['olympiad']
                : ['application', 'olympiad'],
  problemCount: ARGS.count,
  difficulty: ARGS.difficulty,
  operations: {},
  digits: {},
  termCount: 2,
  useBrackets: false,
  allowRepeatOperators: true,
  knowledgePoints: [],
};
const composition = buildComposition(config);

// 与 useProblemGenerator.js 保持一致:cap 按 active band 可达的 subtype 数计算
const activeBand = levelToBand({ easy: 1, medium: 2, hard: 3 }[ARGS.difficulty] || 2);
const appSubtypes = enumerateSubtypes('application', ARGS.grade, activeBand);
const olySubtypes = enumerateSubtypes('olympiad', ARGS.grade, activeBand);
const appCap = computeCap(composition.application || 0, appSubtypes.length);
const olyCap = computeCap(composition.olympiad || 0, olySubtypes.length);
const usage = { application: new Map(), olympiad: new Map() };
const capFor = (t) => (t === 'application' ? appCap : olyCap);

const rng = createRng(ARGS.seed);
const results = [];
const STRATEGY = { application: ApplicationStrategy, olympiad: OlympiadStrategy };

for (const [type, count] of Object.entries(composition)) {
  if (!count || count <= 0) continue;
  if (!STRATEGY[type]) continue; // arithmetic 跳过
  const strategy = new STRATEGY[type]({ ...config, problemType: 'result' });
  let produced = 0;
  let attempts = 0;
  while (produced < count && attempts < count * 20) {
    attempts++;
    let p;
    try {
      p = strategy.generate(rng);
    } catch {
      continue;
    }
    if (!p) continue;
    if (!p.subtemplateId) continue;
    const cap = capFor(type);
    const used = usage[type].get(p.subtemplateId) || 0;
    if (used >= cap) continue;
    usage[type].set(p.subtemplateId, used + 1);
    results.push({ type, ...p });
    produced++;
  }
}

// ---------- 输出 ----------

const truncate = (s, n = 30) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

const header = `应用题 + 奥数题 多样化预览
年级: ${ARGS.grade} 年级  难度: ${ARGS.difficulty}  题数: ${ARGS.count}  种子: ${ARGS.seed}`;
console.log('═'.repeat(Math.max(60, header.length + 4)));
console.log(header);
console.log('═'.repeat(Math.max(60, header.length + 4)));
console.log();

for (const type of ['application', 'olympiad']) {
  const subset = results.filter((r) => r.type === type);
  if (subset.length === 0) continue;
  const allSubs = type === 'application' ? appSubtypes : olySubtypes;
  const touched = new Set(subset.map((r) => r.subtemplateId));
  const label = type === 'application' ? '应用题' : '奥数题';
  console.log(`[${label}]  共 ${subset.length} 题,触达 ${touched.size} 个 subtype(共 ${allSubs.length} 个可用)`);
  console.log('─'.repeat(64));
  console.log(`   #  subtemplateId${' '.repeat(15)}band     题面`);
  subset.forEach((p, i) => {
    const n = String(i + 1).padStart(3, ' ');
    const id = p.subtemplateId.padEnd(28, ' ');
    const band = String(p.band || '').padEnd(7, ' ');
    console.log(`  ${n}  ${id}  ${band}  ${truncate(p.question)}`);
  });
  console.log('─'.repeat(64));
  console.log();
}

const totalTouched = new Set(results.filter((r) => r.subtemplateId).map((r) => r.subtemplateId)).size;
const maxSeen = Math.max(0, ...[...usage.application.values(), ...usage.olympiad.values()]);
console.log('摘要');
console.log(`  · 共触达 ${totalTouched} 个不同 subtype`);
console.log(`  · 单 subtype 最多出现 ${maxSeen} 次`);
console.log('═'.repeat(64));
