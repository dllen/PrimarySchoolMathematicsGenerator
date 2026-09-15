// src/problemTemplates/diversity.js
// 多样化 batch 选择工具 —— 纯函数,无 Vue 依赖,可被 CLI 直接 import。
// 所有"单 batch 内不同 subtype 不要超过 X 次"的逻辑都集中在这里。

import { templatesFor } from './index.js';

/**
 * 列出某 type + grade 下的全部 subtemplate 三元组(可选按 band 过滤)。
 * @param {'application'|'olympiad'} type
 * @param {string} grade
 * @param {'easy'|'medium'|'hard'} [band] 可选 — 只返回该 band 的 subtype
 * @returns {Array<{templateId: string, subtemplateId: string, band: 'easy'|'medium'|'hard'}>}
 */
export function enumerateSubtypes(type, grade, band) {
  return templatesFor(type, grade).flatMap(t =>
    t.subtemplates
      .filter((st) => !band || st.band === band)
      .map((st) => ({
        templateId: t.id,
        subtemplateId: st.id,
        band: st.band,
      }))
  );
}

/**
 * 单 batch 内每个 subtype 的硬上限。
 *   cap = ceil(shareCount / subtypeCount) + 1
 * subtypeCount=0 时返回 Infinity(避免下游除零,调用方需先检查 subtype 数)。
 */
export function computeCap(shareCount, subtypeCount) {
  if (subtypeCount === 0) return Infinity;
  return Math.ceil(shareCount / subtypeCount) + 1;
}

/**
 * 给定候选 subtype 列表 + 已用计数 Map,挑一个未超额的下标。
 * 全超额时返回 -1(调用方应保留 retry 循环兜底)。
 */
export function pickUnderCap(subtypes, usageMap, cap) {
  const candidates = [];
  for (let i = 0; i < subtypes.length; i++) {
    const used = usageMap.get(subtypes[i].subtemplateId) || 0;
    if (used < cap) candidates.push(i);
  }
  if (candidates.length === 0) return -1;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/**
 * 根据 config 算出 application/arithmetic/olympiad 各占多少题。
 * - 显式 composition 优先(且非全 0)
 * - 否则按 questionTypes 平分 problemCount,余数加在第一个 type
 *
 * 与 useProblemGenerator.js 中的 buildComposition 行为完全一致(同一公式);
 * 这里导出供 scripts/preview-questions.mjs 复用,避免 CLI 重复实现。
 */
export function buildComposition(config) {
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
