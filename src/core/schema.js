/**
 * JSON template schema validator (runtime).
 * Docs: v2-tech-docs/Math DSL v1.0 §2 顶层结构;
 *       v2-tech-docs/Math DSL v1.1 §44 (GenerationRole / role='target')
 */

const REQUIRED_TOP = ['id', 'metadata', 'variables', 'answer', 'renderer'];
const REQUIRED_META = ['name', 'type', 'grade'];
const VALID_VAR_TYPES = new Set(['random', 'derived', 'constant']);

function isObject(x) {
  return x !== null && typeof x === 'object' && !Array.isArray(x);
}

/**
 * @param {object} t
 * @returns {{ ok: boolean, errors?: string[] }}
 */
export function validateTemplate(t) {
  const errors = [];
  if (!isObject(t)) return { ok: false, errors: ['template must be object'] };

  for (const k of REQUIRED_TOP) {
    if (!(k in t)) errors.push(`missing top-level: ${k}`);
  }
  if (errors.length) return { ok: false, errors };

  if (!isObject(t.metadata)) {
    errors.push('metadata must be object');
  } else {
    for (const k of REQUIRED_META) {
      if (!(k in t.metadata)) errors.push(`missing metadata: ${k}`);
    }
  }

  if (!isObject(t.variables) || Object.keys(t.variables).length === 0) {
    errors.push('variables must be non-empty object');
  } else {
    for (const [name, def] of Object.entries(t.variables)) {
      if (!isObject(def)) {
        errors.push(`variable ${name} must be object`);
        continue;
      }
      if (!VALID_VAR_TYPES.has(def.type)) {
        errors.push(`variable ${name} has invalid type: ${def.type}`);
      }
      if (def.type === 'random' && (!def.generator || !def.generator.strategy)) {
        errors.push(`variable ${name} random needs generator.strategy`);
      }
      if (def.type === 'derived' && !def.expression) {
        errors.push(`variable ${name} derived needs expression`);
      }
    }

    // Reverse strategy validation (added 2026-09-15)
    let hasTarget = false;
    for (const [name, def] of Object.entries(t.variables)) {
      if (def.role !== 'target') continue;
      hasTarget = true;
      if (def.type !== 'random') {
        errors.push(`variable ${name}: role='target' requires type='random'`);
      }
      if (!def.generator || !def.generator.strategy) {
        errors.push(`role='target' variable ${name} needs generator`);
      }
    }
    if (hasTarget) {
      const targetCount = Object.values(t.variables).filter(d => d.role === 'target').length;
      if (targetCount > 1) {
        errors.push(`multiple role='target' variables not supported`);
      }
    }
    if (t.generator?.strategy === 'reverse' && !hasTarget) {
      errors.push(`reverse strategy requires at least one role='target' variable`);
    }
  }

  if (!isObject(t.answer) || !('expression' in t.answer) || !t.answer.type) {
    errors.push('answer must have type and expression');
  }

  if (!isObject(t.renderer) || typeof t.renderer.question !== 'string' || !t.renderer.question.length) {
    errors.push('renderer.question must be non-empty string');
  }

  return errors.length ? { ok: false, errors } : { ok: true };
}
