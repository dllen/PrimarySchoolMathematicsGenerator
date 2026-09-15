/**
 * Text template renderer.
 * Docs: v2-tech-docs/Math DSL v1.0 §23, §37
 */

const PLACEHOLDER = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;

/**
 * @param {string} template - 含 {{var}} 占位的文本
 * @param {Record<string, any>} vars - 变量值
 * @param {{ unit?: string }} [opts]
 * @returns {string}
 */
export function render(template, vars, opts = {}) {
  if (typeof template !== 'string') return '';
  const out = template.replace(PLACEHOLDER, (_, name) => {
    if (Object.prototype.hasOwnProperty.call(vars, name)) {
      return String(vars[name]);
    }
    return `{{${name}}}`;
  });
  if (opts.unit && !out.endsWith(opts.unit)) {
    return out + opts.unit;
  }
  return out;
}

/**
 * 渲染 answer 字符串：值 + 单位（如有）
 */
export function renderAnswer(value, answerDef) {
  if (value === undefined || value === null) return '';
  let s = String(value);
  if (answerDef?.unit && !s.endsWith(answerDef.unit)) s += answerDef.unit;
  return s;
}
