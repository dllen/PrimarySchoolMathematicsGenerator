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
import { treePlantingTemplate } from './treePlanting.js';
import { profitLossTemplate } from './profitLoss.js';
import { ageProblemTemplate } from './ageProblem.js';
import { unitaryTemplate } from './unitary.js';
import { reverseTemplate } from './reverse.js';
import { magicSquareTemplate } from './magicSquare.js';
import { matchstickTemplate } from './matchstick.js';
import { equationTransformTemplate } from './equationTransform.js';
import { pigeonholeTemplate } from './pigeonhole.js';

import { discountTemplate } from './discount.js';
import { interestTemplate } from './interest.js';
import { boatCurrentTemplate } from './boatCurrent.js';
import { trainBridgeTemplate } from './trainBridge.js';
import { clockAngleTemplate } from './clockAngle.js';
import { proportionDistTemplate } from './proportionDist.js';
import { averageTemplate } from './average.js';
import { formationTemplate } from './formation.js';
import { inclusionExclusionTemplate } from './inclusionExclusion.js';
import { perfectSquareTemplate } from './perfectSquare.js';
import { coloringTemplate } from './coloring.js';
import { extremeValueTemplate } from './extremeValue.js';
import { logicDeductionTemplate } from './logicDeduction.js';
import { chickenRabbit3VarTemplate } from './chickenRabbit3Var.js';
import { treePlantingBuildingTemplate } from './treePlantingBuilding.js';
import { ageProblemFamilyTemplate } from './ageProblemFamily.js';
import { distanceCircularTemplate } from './distanceCircular.js';
import { unitaryWorkTemplate } from './unitaryWork.js';
import { concentrationTripleTemplate } from './concentrationTriple.js';
import { comparisonMultiTemplate } from './comparisonMulti.js';

export const APPLICATION_TEMPLATES = [
  shoppingTemplate, timeTemplate, comparisonTemplate, chickenRabbitTemplate,
  // Plan A: 8 Chinese context templates
  boatCrossingTemplate, shareCandyTemplate, libraryCornerTemplate,
  queueProblemTemplate, redPacketTemplate, sportsScoreTemplate,
  harvestFieldTemplate, dutyRosterTemplate,
  // Plan B: 5 more application templates
  engineeringTemplate, concentrationTemplate, distanceTemplate,
  ratioTemplate, statisticsTemplate,
  // Batch E: 5 more application templates
  treePlantingTemplate, profitLossTemplate, ageProblemTemplate,
  unitaryTemplate, reverseTemplate,
  // Batch F: A 类 (应用)
  discountTemplate, interestTemplate, boatCurrentTemplate, trainBridgeTemplate,
  clockAngleTemplate, proportionDistTemplate, averageTemplate, formationTemplate,
  // Batch F: D 类 (应用变体)
  chickenRabbit3VarTemplate, treePlantingBuildingTemplate, ageProblemFamilyTemplate,
  distanceCircularTemplate, unitaryWorkTemplate, concentrationTripleTemplate,
  comparisonMultiTemplate,
];

export const OLYMPIAD_TEMPLATES = [
  sequenceTemplate, logicTemplate,
  // Plan C: 6 olympiad-depth templates
  numberTheoryTemplate, combinatoricsTemplate, probabilityTemplate,
  inequalityTemplate, geometryCountTemplate, advancedLogicTemplate,
  // Batch E: 4 olympiad templates
  magicSquareTemplate, matchstickTemplate,
  equationTransformTemplate, pigeonholeTemplate,
  // Batch F: A 类 (奥数)
  inclusionExclusionTemplate, perfectSquareTemplate, coloringTemplate,
  extremeValueTemplate, logicDeductionTemplate,
];

export function templatesFor(type, grade) {
  const all = type === 'application' ? APPLICATION_TEMPLATES : OLYMPIAD_TEMPLATES;
  if (!grade) return all;
  return all.filter((t) => t.gradeRange.includes(String(grade)));
}
