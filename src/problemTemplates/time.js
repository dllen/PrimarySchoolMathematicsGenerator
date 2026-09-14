import { pickNumberByBand, pickPerson, levelToBand } from './helpers.js';

const activities = ['起床', '上学', '吃午饭', '放学', '吃晚饭', '睡觉', '做作业', '看电视', '看书', '锻炼'];

function pickRandom(arr, rng) {
  return arr[rng.int(0, arr.length - 1)];
}

function wrapHour(h) {
  return ((h - 1) % 12) + 1;
}

function generateTimeSubtemplates() {
  return [
    {
      id: 'time-hours-later',
      band: 'easy',
      generate(rng) {
        const person = pickPerson(rng);
        const activity = pickRandom(activities, rng);
        const startHour = rng.int(1, 12);
        const hoursLater = pickNumberByBand(rng, 'easy', { min: 1, max: 5 });
        const endHour = wrapHour(startHour + hoursLater);
        return {
          question: `现在是${startHour}时，${person}${activity}后再过${hoursLater}小时是几点？`,
          answer: `${endHour}时`,
          subtype: 'time',
          payload: { startHour, hoursLater, endHour },
        };
      },
    },
    {
      id: 'time-clock-elapsed',
      band: 'easy',
      generate(rng) {
        const person = pickPerson(rng);
        const startHour = rng.int(1, 10);
        const hoursLater = pickNumberByBand(rng, 'easy', { min: 2, max: 6 });
        const endHour = wrapHour(startHour + hoursLater);
        return {
          question: `${person}早上${startHour}时开始做作业，做了${hoursLater}小时，几点做完？`,
          answer: `${endHour}时`,
          subtype: 'time',
          payload: { startHour, hoursLater, endHour },
        };
      },
    },
    {
      id: 'time-days-later',
      band: 'medium',
      generate(rng) {
        const person = pickPerson(rng);
        const today = rng.pick(['星期一', '星期二', '星期三', '星期四', '星期五']);
        const days = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];
        const daysLater = pickNumberByBand(rng, 'medium', { min: 1, max: 5 });
        const todayIndex = days.indexOf(today);
        const futureDay = days[(todayIndex + daysLater) % 7];
        return {
          question: `今天是${today}，${person}${daysLater}天后是星期几？`,
          answer: futureDay,
          subtype: 'time',
          payload: { today, daysLater, futureDay },
        };
      },
    },
    {
      id: 'time-bus-schedule',
      band: 'hard',
      generate(rng) {
        const startHour = rng.int(6, 10);
        const interval = pickNumberByBand(rng, 'hard', { min: 15, max: 30 });
        const nth = pickNumberByBand(rng, 'hard', { min: 2, max: 6 });
        const arrivalHour = startHour + Math.floor((interval * (nth - 1)) / 60);
        const arrivalMinute = (interval * (nth - 1)) % 60;
        return {
          question: `公交车每${interval}分钟一班，第一班${startHour}时发出，第${nth}班车几点到达？`,
          answer: `${arrivalHour}时${arrivalMinute.toString().padStart(2, '0')}分`,
          subtype: 'time',
          payload: { startHour, interval, nth, arrivalHour, arrivalMinute },
        };
      },
    },
    {
      id: 'time-movie-duration',
      band: 'hard',
      generate(rng) {
        const person = pickPerson(rng);
        const startHour = rng.int(14, 18);
        const duration = pickNumberByBand(rng, 'hard', { min: 90, max: 180 });
        const endHour = startHour + Math.floor(duration / 60);
        const endMinute = duration % 60;
        return {
          question: `${person}的电影${startHour}时开始，放映${duration}分钟，几点结束？`,
          answer: `${endHour}时${endMinute.toString().padStart(2, '0')}分`,
          subtype: 'time',
          payload: { startHour, duration, endHour, endMinute },
        };
      },
    },
    {
      id: 'time-half-hour',
      band: 'medium',
      generate(rng) {
        const person = pickPerson(rng);
        const hour = rng.int(7, 11);
        const halfHours = pickNumberByBand(rng, 'medium', { min: 1, max: 4 });
        const totalMinutes = halfHours * 30;
        const endHour = hour + Math.floor(totalMinutes / 60);
        const endMinute = totalMinutes % 60;
        return {
          question: `${person}${hour}时开始看书，每看半小时休息一次，看了${halfHours}次后是几点？`,
          answer: `${endHour}时${endMinute.toString().padStart(2, '0')}分`,
          subtype: 'time',
          payload: { hour, halfHours, endHour, endMinute },
        };
      },
    },
    {
      id: 'time-clock-face',
      band: 'easy',
      generate(rng) {
        const hour = rng.int(1, 9);
        const minute = rng.pick([0, 30]);
        const display = `${hour}:${String(minute).padStart(2, '0')}`;
        return {
          question: `钟表指向${display},是几点几分?`,
          answer: display,
          subtype: 'time',
          payload: { hour, minute },
        };
      },
    },
  ];
}

export const timeTemplate = {
  id: 'time-complex',
  gradeRange: ['1', '2', '3', '4'],
  semester: 'all',
  subtemplates: generateTimeSubtemplates(),
  generate(rng, difficultyLevel) {
    const band = levelToBand(difficultyLevel);
    const pool = this.subtemplates.filter(t => t.band === band);
    return rng.pick(pool).generate(rng);
  },
};
