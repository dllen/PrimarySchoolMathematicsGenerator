import { pickNumberByBand, levelToBand } from './helpers.js';

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

function dayName(offset) {
  return WEEKDAYS[offset % 7];
}

function generateDutySubtemplates() {
  return [
    {
      id: 'duty-weekday',
      band: 'easy',
      generate(rng) {
        const today = pickNumberByBand(rng, 'easy', { min: 0, max: 4 });
        const later = pickNumberByBand(rng, 'easy', { min: 1, max: 5 });
        const target = (today + later) % 7;
        return {
          question: `今天是星期${WEEKDAYS[today]},再过${later}天是星期几?`,
          answer: `星期${dayName(target)}`,
          subtype: 'duty-roster',
          payload: { today, later, target },
        };
      },
    },
    {
      id: 'duty-roster',
      band: 'medium',
      generate(rng) {
        const K = pickNumberByBand(rng, 'medium', { min: 3, max: 8 });
        const cycle = 5;
        const dayIndex = K % cycle;
        return {
          question: `班级值日按周一至周五循环,小明了第${K}个值日,那天是星期几?`,
          answer: `星期${WEEKDAYS[dayIndex]}`,
          subtype: 'duty-roster',
          payload: { K, cycle, dayIndex },
        };
      },
    },
    {
      id: 'duty-last',
      band: 'hard',
      generate(rng) {
        // Hard band scales min/max by 1.8, so pickNumberByBand(0..4) can yield 7,
        // which overruns the 7-element WEEKDAYS. Draw both values directly.
        const today = rng.int(0, 6);
        const later = rng.int(8, 30);
        const target = (today + later) % 7;
        return {
          question: `今天是星期${WEEKDAYS[today]},小华要在${later}天后的值日,那天是星期几?`,
          answer: `星期${dayName(target)}`,
          subtype: 'duty-roster',
          payload: { today, later, target },
        };
      },
    },
  ];
}

export const dutyRosterTemplate = {
  id: 'duty-roster',
  gradeRange: ['2', '3', '4', '5', '6'],
  semester: 'all',
  subtemplates: generateDutySubtemplates(),
  generate(rng, difficultyLevel) {
    const band = levelToBand(difficultyLevel);
    const pool = this.subtemplates.filter(t => t.band === band);
    return rng.pick(pool).generate(rng);
  },
};
