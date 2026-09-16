export const GRADES = ['1', '2', '3', '4', '5', '6'];
export const SEMESTERS = ['上', '下'];
export const QUESTION_TYPES = [
  'arithmetic', 'application', 'olympiad',
  // Plan A:
  'boat-crossing', 'share-candy', 'library',
  'queue', 'red-packet', 'sports-score',
  'harvest', 'duty-roster',
  // Plan B:
  'engineering', 'concentration', 'distance',
  'ratio', 'statistics',
  // Plan C:
  'number-theory', 'combinatorics', 'probability',
  'inequality', 'geometry-count', 'logic-advanced',
  // Batch E (算术变体):
  'digit-puzzle', 'quick-math',
  'fraction-arithmetic', 'decimal-arithmetic',
  // Batch F: 应用 (A 类 8 + D 类 7)
  'discount', 'interest', 'boat-current', 'train-bridge',
  'clock-angle', 'proportion-dist', 'average', 'formation',
  'chicken-rabbit-3var', 'tree-planting-building', 'age-problem-family',
  'distance-circular', 'unitary-work', 'concentration-triple',
  'comparison-multi',
  // Batch F: 奥数 (A 类 5)
  'inclusion-exclusion', 'perfect-square', 'coloring',
  'extreme-value', 'logic-deduction',
];
export const DIFFICULTIES = ['easy', 'medium', 'hard'];
export const ANSWER_MODES = ['hidden', 'inline', 'separate'];
export const PROBLEM_TYPES = ['result', 'operand'];

export const DIFFICULTY_TO_LEVEL = {
  easy: 1,
  medium: 2,
  hard: 3,
};
