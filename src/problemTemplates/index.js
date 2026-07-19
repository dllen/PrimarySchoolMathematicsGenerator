import { shoppingTemplate } from './shopping.js';
import { timeTemplate } from './time.js';
import { comparisonTemplate } from './comparison.js';
import { sequenceTemplate } from './sequence.js';
import { logicTemplate } from './logic.js';
import { chickenRabbitTemplate } from './chickenRabbit.js';

export const APPLICATION_TEMPLATES = [shoppingTemplate, timeTemplate, comparisonTemplate, chickenRabbitTemplate];

export const OLYMPIAD_TEMPLATES = [sequenceTemplate, logicTemplate];

export function templatesFor(type, grade) {
  const all = type === 'application' ? APPLICATION_TEMPLATES : OLYMPIAD_TEMPLATES;
  if (!grade) return all;
  return all.filter((t) => t.gradeRange.includes(String(grade)));
}
