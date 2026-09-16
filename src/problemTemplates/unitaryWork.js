import { pickNumberByBand, pickForBand } from './helpers.js';

export const unitaryWorkTemplate = {
  id: 'unitary-work',
  gradeRange: ['3', '4', '5', '6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'work-single-rate',
      band: 'easy',
      generate(rng) {
        for (let attempt = 0; attempt < 20; attempt++) {
          const total = pickNumberByBand(rng, 'easy', { min: 60, max: 200 });
          const days = pickNumberByBand(rng, 'easy', { min: 4, max: 10 });
          if (total % days === 0) {
            const perDay = total / days;
            const newDays = pickNumberByBand(rng, 'easy', { min: 12, max: 20 });
            const newTotal = perDay * newDays;
            return {
              question: `用${days}天完成了${total}件零件,平均每天做几件?按这个效率,${newDays}天能做多少件?`,
              answer: `${perDay}件/天;${newTotal}件`,
              subtype: 'unitary-work',
              payload: { kind: 'single-rate', days, total, perDay, newDays, newTotal },
            };
          }
        }
        return { question: '用5天完成50件,平均每天几件?', answer: '10件/天', subtype: 'unitary-work', payload: { kind: 'fallback' } };
      },
    },
    {
      id: 'work-cooperative',
      band: 'medium',
      generate(rng) {
        for (let attempt = 0; attempt < 30; attempt++) {
          const a = pickNumberByBand(rng, 'medium', { min: 6, max: 18 });
          const b = pickNumberByBand(rng, 'medium', { min: 6, max: 18 });
          const total = a * b;
          const daysTogether = total / (a + b);
          if (Number.isInteger(daysTogether) && total % (a + b) === 0) {
            return {
              question: `一项工程,甲单独做${a}天完成,乙单独做${b}天完成。两人合作多少天完成?`,
              answer: `${daysTogether}天`,
              subtype: 'unitary-work',
              payload: { kind: 'cooperative', a, b, total, daysTogether },
            };
          }
        }
        return { question: '甲单独12天、乙单独12天,合作几天?', answer: '6天', subtype: 'unitary-work', payload: { kind: 'cooperative-fallback' } };
      },
    },
    {
      id: 'work-pool-drain',
      band: 'hard',
      generate(rng) {
        for (let attempt = 0; attempt < 30; attempt++) {
          const fillHours = pickNumberByBand(rng, 'hard', { min: 6, max: 18 });
          const drainHours = pickNumberByBand(rng, 'hard', { min: 12, max: 36 });
          if (drainHours > fillHours) {
            const tank = fillHours * drainHours;
            const totalHours = tank / (drainHours - fillHours);
            return {
              question: `一个水池,进水管单独注满需${fillHours}小时,排水管单独排空需${drainHours}小时。两管同时打开,多少小时注满?`,
              answer: `${totalHours}小时`,
              subtype: 'unitary-work',
              payload: { kind: 'pool-drain', fillHours, drainHours, total: tank, totalHours },
            };
          }
        }
        return { question: '进水管6小时注满,排水管12小时排空,同时开几小时注满?', answer: '12小时', subtype: 'unitary-work', payload: { kind: 'pool-fallback' } };
      },
    },
  ],
  generate(rng, difficultyLevel) { return pickForBand(this, difficultyLevel, rng); },
};
