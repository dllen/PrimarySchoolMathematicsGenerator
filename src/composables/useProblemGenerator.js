import { createRng } from '../utils/rng.js';
import { ProblemGeneratorFactory } from '../strategies/ProblemGeneratorFactory.js';
import { useProblemLibrary } from './useProblemLibrary.js';
import { usePreloadedLibrary } from './usePreloadedLibrary.js';
import { queryLibrary } from '../db.js';

const ARITHMETIC_DEFAULT_PROBLEM_TYPE = 'result';

function buildComposition(config) {
  if (config.composition && Object.values(config.composition).some((v) => v > 0)) {
    return { ...config.composition };
  }
  const types = config.questionTypes;
  const base = Math.floor(config.problemCount / types.length);
  const remainder = config.problemCount % types.length;
  const out = { arithmetic: 0, application: 0, olympiad: 0 };
  types.forEach((t, i) => {
    out[t] = base + (i === 0 ? remainder : 0);
  });
  return out;
}

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
      while (produced < needFromLive && attempts < needFromLive * 20) {
        attempts++;
        try {
          const p = await generateOneLive(type, config);
          if (seen.has(p.question)) continue;
          seen.add(p.question);
          results.push({
            type,
            subtype: p.subtype,
            question: p.question,
            answer: p.answer,
            payload: p.payload || {},
          });
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