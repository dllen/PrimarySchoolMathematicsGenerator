import { pickNumberByBand, pickForBand } from './helpers.js';

const findDownstreamSub = {
  id: 'boat-find-downstream',
  band: 'easy',
  generate(rng) {
    const still = pickNumberByBand(rng, 'easy', { min: 10, max: 25 });
    const current = pickNumberByBand(rng, 'easy', { min: 2, max: 6 });
    const downstream = still + current;
    const upstream = still - current;
    return {
      question: `船在静水中速度为${still}km/h,水流速度${current}km/h,顺水速度和逆水速度分别是多少?`,
      answer: `顺水${downstream}km/h,逆水${upstream}km/h`,
      subtype: 'boat-current',
      payload: { still, current, downstream, upstream, kind: 'find-speeds' },
    };
  },
};

export const boatCurrentTemplate = {
  id: 'boat-current',
  gradeRange: ['5', '6'],
  semester: 'all',
  subtemplates: [
    findDownstreamSub,
    {
      id: 'boat-find-still',
      band: 'medium',
      generate(rng) {
        const downstream = pickNumberByBand(rng, 'medium', { min: 15, max: 30 });
        const upstream = pickNumberByBand(rng, 'medium', { min: 8, max: 18 });
        if (upstream >= downstream) return findDownstreamSub.generate(rng);
        const still = (downstream + upstream) / 2;
        const current = (downstream - upstream) / 2;
        return {
          question: `船顺水速度${downstream}km/h,逆水速度${upstream}km/h,求静水速度和水速。`,
          answer: `静水${still}km/h,水速${current}km/h`,
          subtype: 'boat-current',
          payload: { downstream, upstream, still, current, kind: 'find-still-current' },
        };
      },
    },
    {
      id: 'boat-time',
      band: 'hard',
      generate(rng) {
        const still = pickNumberByBand(rng, 'hard', { min: 12, max: 24 });
        const current = pickNumberByBand(rng, 'hard', { min: 2, max: 5 });
        const distance = pickNumberByBand(rng, 'hard', { min: 60, max: 200 });
        const upstreamSpeed = still - current;
        const downstreamSpeed = still + current;
        const upTime = Math.round(distance / upstreamSpeed);
        const downTime = Math.round(distance / downstreamSpeed);
        const total = upTime + downTime;
        return {
          question: `船静水${still}km/h,水速${current}km/h,甲乙两港相距${distance}km。船从甲到乙逆水而上再顺水返回,共需多少小时?`,
          answer: `${total}小时`,
          subtype: 'boat-current',
          payload: { still, current, distance, upstreamSpeed, downstreamSpeed, upTime, downTime, total, kind: 'round-trip' },
        };
      },
    },
  ],
  generate(rng, difficultyLevel) { return pickForBand(this, difficultyLevel, rng); },
};
