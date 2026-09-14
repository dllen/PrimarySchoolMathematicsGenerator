import { pickNumberByBand, pickTwoSpeeds, pickPerson, pickTwoPeople, levelToBand } from './helpers.js';

function generateDistanceSubtemplates() {
  return [
    {
      id: 'distance-basic',
      band: 'easy',
      generate(rng) {
        const person = pickPerson(rng);
        const speed = pickNumberByBand(rng, 'easy', { min: 30, max: 80 });
        const time = pickNumberByBand(rng, 'easy', { min: 2, max: 8 });
        const distance = speed * time;
        return {
          question: `${person}每分钟走${speed}米,走${time}分钟,一共走了多少米?`,
          answer: `${distance}米`,
          subtype: 'distance',
          payload: { speed, time, distance },
        };
      },
    },
    {
      id: 'distance-meet',
      band: 'medium',
      generate(rng) {
        const [p1, p2] = pickTwoPeople(rng);
        const { speed1, speed2 } = pickTwoSpeeds(rng, 'medium', { min: 50, max: 120 });
        const time = pickNumberByBand(rng, 'medium', { min: 2, max: 6 });
        const distance = (speed1 + speed2) * time;
        return {
          question: `${p1}每分钟走${speed1}米,${p2}每分钟走${speed2}米,两人相向而行${time}分钟后相遇,两地相距多少米?`,
          answer: `${distance}米`,
          subtype: 'distance',
          payload: { speed1, speed2, time, distance },
        };
      },
    },
    {
      id: 'distance-chase',
      band: 'medium',
      generate(rng) {
        const [p1, p2] = pickTwoPeople(rng);
        const { speed1, speed2 } = pickTwoSpeeds(rng, 'medium', { min: 60, max: 150 });
        const faster = Math.max(speed1, speed2);
        const slower = Math.min(speed1, speed2);
        const diff = faster - slower;
        const time = pickNumberByBand(rng, 'medium', { min: 2, max: 8 });
        const catchUp = diff * time;
        return {
          question: `${p1}每分钟走${faster}米,${p2}每分钟走${slower}米,同向而行${time}分钟后,${p1}比${p2}多走多少米?`,
          answer: `${catchUp}米`,
          subtype: 'distance',
          payload: { speed1, speed2, faster, slower, diff, time, catchUp },
        };
      },
    },
    {
      id: 'distance-round',
      band: 'hard',
      generate(rng) {
        const [p1, p2] = pickTwoPeople(rng);
        const { speed1, speed2 } = pickTwoSpeeds(rng, 'hard', { min: 80, max: 200 });
        const time = rng.int(3, 10);
        const distance = (speed1 + speed2) * time;
        return {
          question: `${p1}速度${speed1}米/分钟,${p2}速度${speed2}米/分钟,两人从同一点反向沿环形跑道出发,${time}分钟后一共跑了多少米?`,
          answer: `${distance}米`,
          subtype: 'distance',
          payload: { speed1, speed2, time, distance },
        };
      },
    },
    {
      id: 'distance-bus',
      band: 'hard',
      generate(rng) {
        const interval = pickNumberByBand(rng, 'hard', { min: 5, max: 15 });
        const buses = pickNumberByBand(rng, 'hard', { min: 3, max: 8 });
        const total = interval * buses;
        return {
          question: `公交车每${interval}分钟发一班,发了${buses}班车,一共用了多少分钟?`,
          answer: `${total}分钟`,
          subtype: 'distance',
          payload: { interval, buses, total },
        };
      },
    },
  ];
}

export const distanceTemplate = {
  id: 'distance',
  gradeRange: ['3', '4', '5', '6'],
  semester: 'all',
  subtemplates: generateDistanceSubtemplates(),
  generate(rng, difficultyLevel) {
    const band = levelToBand(difficultyLevel);
    const pool = this.subtemplates.filter(t => t.band === band);
    return rng.pick(pool).generate(rng);
  },
};
