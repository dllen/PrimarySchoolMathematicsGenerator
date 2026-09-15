import { createRng } from '../utils/rng.js';
import { ProblemGeneratorFactory } from '../strategies/ProblemGeneratorFactory.js';
import { useProblemLibrary } from './useProblemLibrary.js';
import { usePreloadedLibrary } from './usePreloadedLibrary.js';
import { queryLibrary } from '../db.js';
import { buildComposition, computeCap, enumerateSubtypes } from '../problemTemplates/diversity.js';
import { levelToBand } from '../problemTemplates/helpers.js';

const ARITHMETIC_DEFAULT_PROBLEM_TYPE = 'result';

let rngCounter = 0;

async function generateOneLive(type, config) {
  const innerConfig = { ...config };
  if (type === 'arithmetic' && !innerConfig.problemType) {
    innerConfig.problemType = ARITHMETIC_DEFAULT_PROBLEM_TYPE;
  }
  const strategy = ProblemGeneratorFactory.createStrategy(type, innerConfig);
  return strategy.generate(createRng(Math.floor(Math.random() * 1e9) + ++rngCounter));
}

export function useProblemGenerator() {
  const library = useProblemLibrary();
  const preloaded = usePreloadedLibrary();

  async function generate(config) {
    const composition = buildComposition(config);
    // 多样化 dedup:预计算 cap 与使用计数
    // cap 必须按「active band 可达的 subtype 数」计算,否则高年级 + 少 subtype 的 band 会算出一个
    // 看起来合理但实际永远触不到的天花板,导致题目数永远凑不够。详见 2026-09-15 任务说明。
    const activeBand = levelToBand(difficultyToLevel(config.difficulty));
    const appSubtypes = enumerateSubtypes('application', config.grade, activeBand);
    const olySubtypes = enumerateSubtypes('olympiad', config.grade, activeBand);
    const appCap = computeCap(composition.application || 0, appSubtypes.length);
    const olyCap = computeCap(composition.olympiad || 0, olySubtypes.length);
    const usage = {
      application: new Map(),  // subtemplateId -> count
      olympiad: new Map(),
    };
    const capFor = (type) => (type === 'application' ? appCap : olyCap);
    const seen = new Set();
    const results = [];

    const historyCache = new Map();
    async function getHistoryQuestions(type) {
      if (historyCache.has(type)) return historyCache.get(type);
      try {
        const history = await queryLibrary({
          grade: config.grade,
          semester: config.semester,
          type: type,
          difficulty: difficultyToLevel(config.difficulty),
        });
        const questions = new Set(history.map(p => p.question));
        historyCache.set(type, questions);
        return questions;
      } catch {
        return new Set();
      }
    }

    for (const [type, count] of Object.entries(composition)) {
      if (!count || count <= 0) continue;

      const historyQuestions = await getHistoryQuestions(type);
      for (const q of historyQuestions) {
        seen.add(q);
      }

      const cached = await preloaded.get(config.grade, config.semester, type, config.difficulty);
      const availablePreloaded = cached
        ? cached.filter(p => !seen.has(p.q))
        : [];
      const sampled = preloaded.sample(availablePreloaded, Math.min(count, availablePreloaded.length), ++rngCounter);

      let produced = 0;
      for (const s of sampled) {
        if (produced >= count) break;
        if (seen.has(s.question)) continue;
        seen.add(s.question);
        results.push({
          type,
          subtype: type,
          question: s.question,
          answer: s.answer,
          payload: {},
        });
        produced++;
      }

      const needFromLive = count - produced;
      let attempts = 0;
      const GENERATION_TIMEOUT_MS = 5000;  // 5 second timeout
      const generationStart = Date.now();
      while (produced < needFromLive && attempts < needFromLive * 20) {
        // Timeout check
        if (Date.now() - generationStart > GENERATION_TIMEOUT_MS) {
          console.warn(
            `[useProblemGenerator] Generation timeout for ${type} after ${attempts} attempts`
          );
          break;
        }

        attempts++;
        try {
          const p = await generateOneLive(type, config);
          if (seen.has(p.question)) continue;
          // 多样化 dedup:仅 application/olympiad(arithmetic 不走模板)
          if ((type === 'application' || type === 'olympiad') && p.subtemplateId) {
            const cap = capFor(type);
            const used = usage[type].get(p.subtemplateId) || 0;
            if (used >= cap) continue;  // 超额,跳过,继续 retry
            usage[type].set(p.subtemplateId, used + 1);
          }
          seen.add(p.question);
          const result = {
            type,
            subtype: p.subtype,
            question: p.question,
            answer: p.answer,
            payload: p.payload || {},
          };
          if (p.subtemplateId) result.subtemplateId = p.subtemplateId;
          if (p.band) result.band = p.band;
          results.push(result);
          produced++;
        } catch (err) {
          // grade/template mismatch — skip
        }
      }
    }

    await persistToLibrary(results, config);
    return results;
  }

  async function persistToLibrary(results, config) {
    const baseRecord = {
      grade: config.grade,
      semester: config.semester,
      difficulty: difficultyToLevel(config.difficulty),
      knowledgePoints: config.knowledgePoints || [],
      source: 'generated',
    };
    for (const r of results) {
      try {
        await library.save({
          ...baseRecord,
          type: r.type,
          subtype: r.subtype,
          question: r.question,
          answer: r.answer,
          payload: r.payload,
        });
      } catch (e) {
        // skip duplicates silently
      }
    }
  }

  return { generate };
}

function difficultyToLevel(d) {
  return { easy: 1, medium: 2, hard: 3 }[d] || 2;
}