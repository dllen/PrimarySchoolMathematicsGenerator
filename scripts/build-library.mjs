#!/usr/bin/env node
/**
 * Pre-generates 3000 problems for each (grade × semester × type × difficulty) combo.
 *
 * Output: public/library/{grade}-{UP|DOWN}-{type}-{easy|medium|hard}.json
 * Total: 6 × 2 × 3 × 3 = 108 files, ~3,000 problems each (after dedup).
 *
 * Run with: node scripts/build-library.mjs
 * Or: npm run build:library
 */

import { writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createRng } from '../src/utils/rng.js';
import { ProblemGeneratorFactory } from '../src/strategies/ProblemGeneratorFactory.js';
import { GRADES, SEMESTERS, QUESTION_TYPES, DIFFICULTIES } from '../src/constants/options.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'public', 'library');
const TARGET_PER_COMBO = 3000;
const MAX_ATTEMPTS_MULTIPLIER = 2;

const DIFFICULTY_TO_LEVEL = { easy: 1, medium: 2, hard: 3 };

function comboKey(grade, semester, type, difficulty) {
  const sem = semester === '上' ? 'UP' : 'DOWN';
  return `${grade}-${sem}-${type}-${difficulty}`;
}

function comboFilename(grade, semester, type, difficulty) {
  return join(OUT_DIR, `${comboKey(grade, semester, type, difficulty)}.json`);
}

function problemConfig(grade, semester, type, difficulty) {
  const cfg = {
    grade: String(grade),
    semester,
    difficulty,
    problemType: 'result',
    termCount: 2,
    operations: { add: true, subtract: true, multiply: true, divide: false },
    digits: { add: 2, subtract: 2, multiply: 1, divide: 1 },
    useBrackets: false,
    allowRepeatOperators: true,
    knowledgePoints: [],
  };

  if (type === 'arithmetic') {
    if (difficulty === 'easy') {
      cfg.operations = { add: true, subtract: true, multiply: false, divide: false };
      cfg.digits = { add: 2, subtract: 1, multiply: 1, divide: 1 };
    } else if (difficulty === 'medium') {
      cfg.operations = { add: true, subtract: true, multiply: true, divide: false };
      cfg.digits = { add: 2, subtract: 2, multiply: 1, divide: 1 };
    } else {
      cfg.operations = { add: true, subtract: true, multiply: true, divide: false };
      cfg.digits = { add: 3, subtract: 3, multiply: 2, divide: 1 };
    }
  }

  return cfg;
}

function generateOneCombo(grade, semester, type, difficulty) {
  const cfg = problemConfig(grade, semester, type, difficulty);
  const strategy = ProblemGeneratorFactory.createStrategy(type, cfg);

  const problems = [];
  const seen = new Set();
  let attempt = 0;
  const maxAttempts = TARGET_PER_COMBO * MAX_ATTEMPTS_MULTIPLIER;
  let seed = 0;

  while (problems.length < TARGET_PER_COMBO && attempt < maxAttempts) {
    attempt++;
    seed++;
    const rng = createRng(seed * 1000 + problems.length);
    let result;
    try {
      result = strategy.generate(rng);
    } catch (e) {
      continue;
    }
    if (!result || !result.question) continue;
    if (seen.has(result.question)) continue;
    seen.add(result.question);
    problems.push({ q: result.question, a: String(result.answer) });
  }

  return {
    grade: String(grade),
    semester,
    type,
    difficulty,
    count: problems.length,
    problems,
  };
}

function main() {
  const args = process.argv.slice(2);
  const onlyArg = args.find((a) => a.startsWith('--only='));
  const only = onlyArg ? onlyArg.slice('--only='.length).split(',') : null;
  const target = parseInt(args.find((a) => a.startsWith('--target='))?.slice('--target='.length) ?? '', 10);
  const PER_COMBO = Number.isFinite(target) && target > 0 ? target : TARGET_PER_COMBO;

  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  let total = 0;
  const combos = [];
  for (const grade of GRADES) {
    for (const semester of SEMESTERS) {
      for (const type of QUESTION_TYPES) {
        for (const difficulty of DIFFICULTIES) {
          combos.push({ grade, semester, type, difficulty });
        }
      }
    }
  }

  const selected = only ? combos.filter((c) => only.includes(comboKey(c.grade, c.semester, c.type, c.difficulty))) : combos;

  console.log(`[build-library] Generating ${selected.length} combo(s) × ${PER_COMBO} problems each → ${OUT_DIR}`);
  const t0 = Date.now();

  for (let i = 0; i < selected.length; i++) {
    const c = selected[i];
    const { grade, semester, type, difficulty } = c;
    const out = generateOneCombo(grade, semester, type, difficulty);
    // If PER_COMBO differs from default, slice
    if (PER_COMBO < out.problems.length) {
      out.problems = out.problems.slice(0, PER_COMBO);
      out.count = out.problems.length;
    }
    const file = comboFilename(grade, semester, type, difficulty);
    writeFileSync(file, JSON.stringify(out));
    total += out.problems.length;
    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    const sizeKb = (statSync(file).size / 1024).toFixed(1);
    process.stdout.write(`[${i + 1}/${selected.length}] ${comboKey(grade, semester, type, difficulty)} → ${out.problems.length} problems (${sizeKb} KB)  [${elapsed}s]\n`);
  }

  const dt = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n[build-library] Done. ${selected.length} files, ${total} problems total in ${dt}s`);
}

main();