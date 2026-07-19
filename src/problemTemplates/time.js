function wrapHour(h) {
  return ((h - 1) % 12) + 1;
}

export const timeTemplate = {
  id: 'time-clock',
  gradeRange: ['1', '2', '3'],
  semester: 'all',
  generate(rng, difficulty) {
    const startHour = rng.int(1, 12);
    const hoursLater = rng.int(1, 3 + difficulty * 2);
    const endHour = wrapHour(startHour + hoursLater);
    return {
      question: `现在是${startHour}时，再过${hoursLater}小时是几时？`,
      answer: `${endHour}时`,
      subtype: 'time',
      payload: { startHour, hoursLater, endHour },
    };
  },
};