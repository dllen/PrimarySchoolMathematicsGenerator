import { pickNumberByBand, pickForBand } from './helpers.js';

export const treePlantingBuildingTemplate = {
  id: 'tree-planting-building',
  gradeRange: ['3', '4', '5', '6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'saw-wood',
      band: 'easy',
      generate(rng) {
        const pieces = pickNumberByBand(rng, 'easy', { min: 3, max: 8 });
        const cuts = pieces - 1;
        return {
          question: `把一根木头锯成${pieces}段,每锯一次需要 2 分钟,共需多少分钟?`,
          answer: `${cuts * 2}分钟(${cuts}刀 × 2分钟)`,
          subtype: 'tree-planting-building',
          payload: { kind: 'saw-wood', pieces, cuts, minutesPerCut: 2, total: cuts * 2 },
        };
      },
    },
    {
      id: 'stair',
      band: 'medium',
      generate(rng) {
        const floors = pickNumberByBand(rng, 'medium', { min: 3, max: 10 });
        const segments = floors - 1;
        return {
          question: `大楼共${floors}层,从1层走到顶层,中间共需走过多少段楼梯?`,
          answer: `${segments}段`,
          subtype: 'tree-planting-building',
          payload: { kind: 'stair', floors, segments },
        };
      },
    },
    {
      id: 'building-spacing',
      band: 'hard',
      generate(rng) {
        const buildings = pickNumberByBand(rng, 'hard', { min: 5, max: 15 });
        const spacing = buildings - 1;
        const spacingM = pickNumberByBand(rng, 'hard', { min: 20, max: 50 });
        const totalLength = spacing * spacingM;
        return {
          question: `${buildings}栋楼一字排列,相邻两栋楼间隔${spacingM}米,这条街从头到尾的总长度是多少米?`,
          answer: `${totalLength}米(${spacing}个间隔)`,
          subtype: 'tree-planting-building',
          payload: { kind: 'building-spacing', buildings, spacing, spacingM, totalLength },
        };
      },
    },
  ],
  generate(rng, difficultyLevel) { return pickForBand(this, difficultyLevel, rng); },
};
