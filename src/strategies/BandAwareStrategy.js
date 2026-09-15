import { ProblemGeneratorStrategy } from './ProblemGeneratorStrategy.js';
import { templatesFor } from '../problemTemplates/index.js';
import { DIFFICULTY_TO_LEVEL } from '../constants/options.js';

export class BandAwareStrategy extends ProblemGeneratorStrategy {
  constructor(config, { type }) {
    super(config);
    this.type = type;
    this.difficultyLevel = DIFFICULTY_TO_LEVEL[config.difficulty] ?? 2;
    this.templates = templatesFor(type, config.grade);
  }

  listSubtemplates({ band } = {}) {
    return this.templates.flatMap(t =>
      t.subtemplates
        .filter((st) => !band || st.band === band)
        .map((st) => ({ templateId: t.id, subtemplateId: st.id, band: st.band }))
    );
  }

  generate(rng) {
    if (this.templates.length === 0) {
      throw new Error(`No ${this.type} templates available for grade ${this.config.grade}`);
    }
    const tpl = rng.pick(this.templates);
    return tpl.generate(rng, this.difficultyLevel);
  }

  generateFromSubtemplate(rng, { templateId, subtemplateId }) {
    const tpl = this.templates.find((t) => t.id === templateId);
    if (!tpl) {
      throw new Error(`[BandAwareStrategy] template not found: ${templateId} (type=${this.type})`);
    }
    const sub = tpl.subtemplates.find((s) => s.id === subtemplateId);
    if (!sub) {
      throw new Error(`[BandAwareStrategy] subtemplate not found: ${templateId}/${subtemplateId}`);
    }
    const result = sub.generate(rng);
    return { ...result, templateId, subtemplateId: sub.id, band: sub.band };
  }
}
