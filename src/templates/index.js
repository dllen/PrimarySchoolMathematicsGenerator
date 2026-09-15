/**
 * Template registry.
 * 启动期 import 所有 JSON 模板 + schema 校验。
 * Docs: v2-tech-docs/Math DSL v1.0 §38
 */

import priceTpl from './wordProblems/G3_PRICE_001.json' with { type: 'json' };
import mixTpl from './wordProblems/G3_MIX_001.json' with { type: 'json' };
import chickenRabbitTpl from './olympiad/O23_CHICKEN_RABBIT_001.json' with { type: 'json' };
import { validateTemplate } from '../core/schema.js';

const rawTemplates = [
  priceTpl,
  mixTpl,
  chickenRabbitTpl,
];

const templates = [];
for (const t of rawTemplates) {
  const r = validateTemplate(t);
  if (!r.ok) {
    throw new Error(`Template ${t.id || '?'} schema invalid: ${r.errors.join('; ')}`);
  }
  templates.push(t);
}

export function loadTemplates() {
  return templates;
}

export function listTemplatesByGrade(grade) {
  return templates.filter(t => t.metadata.grade === grade);
}
