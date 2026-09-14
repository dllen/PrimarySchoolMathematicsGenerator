import { shoppingTemplate } from './shopping.js';
import { timeTemplate } from './time.js';
import { comparisonTemplate } from './comparison.js';
import { sequenceTemplate } from './sequence.js';
import { logicTemplate } from './logic.js';
import { chickenRabbitTemplate } from './chickenRabbit.js';
import { boatCrossingTemplate } from './boatCrossing.js';
import { shareCandyTemplate } from './shareCandy.js';
import { libraryCornerTemplate } from './libraryCorner.js';
import { queueProblemTemplate } from './queueProblem.js';
import { redPacketTemplate } from './redPacket.js';
import { sportsScoreTemplate } from './sportsScore.js';
import { harvestFieldTemplate } from './harvestField.js';
import { dutyRosterTemplate } from './dutyRoster.js';
import { engineeringTemplate } from './engineering.js';
import { concentrationTemplate } from './concentration.js';
import { distanceTemplate } from './distance.js';
import { ratioTemplate } from './ratio.js';
import { statisticsTemplate } from './statistics.js';
import { numberTheoryTemplate } from './numberTheory.js';
import { combinatoricsTemplate } from './combinatorics.js';
import { probabilityTemplate } from './probability.js';
import { inequalityTemplate } from './inequality.js';
import { geometryCountTemplate } from './geometryCount.js';
import { advancedLogicTemplate } from './advancedLogic.js';

export const APPLICATION_TEMPLATES = [
  shoppingTemplate, timeTemplate, comparisonTemplate, chickenRabbitTemplate,
  // Plan A: 8 Chinese context templates
  boatCrossingTemplate, shareCandyTemplate, libraryCornerTemplate,
  queueProblemTemplate, redPacketTemplate, sportsScoreTemplate,
  harvestFieldTemplate, dutyRosterTemplate,
  // Plan B: 5 more application templates
  engineeringTemplate, concentrationTemplate, distanceTemplate,
  ratioTemplate, statisticsTemplate,
];

export const OLYMPIAD_TEMPLATES = [
  sequenceTemplate, logicTemplate,
  // Plan C: 6 olympiad-depth templates
  numberTheoryTemplate, combinatoricsTemplate, probabilityTemplate,
  inequalityTemplate, geometryCountTemplate, advancedLogicTemplate,
];

export function templatesFor(type, grade) {
  const all = type === 'application' ? APPLICATION_TEMPLATES : OLYMPIAD_TEMPLATES;
  if (!grade) return all;
  return all.filter((t) => t.gradeRange.includes(String(grade)));
}
