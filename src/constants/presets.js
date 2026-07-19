// 配置预设模板 - 一键生成常见练习场景
// 每个预设包含完整的配置对象，可直接应用到 config

export const builtinPresets = [
  {
    id: 'mental-arithmetic',
    name: '20 题口算',
    description: '适合 1-2 年级，基础加减法',
    icon: '🧮',
    config: {
      problemCount: 20,
      termCount: 2,
      operations: { add: true, subtract: true, multiply: false, divide: false },
      digits: { add: 1, subtract: 1, multiply: 1, divide: 1 },
      problemType: 'result',
      useBrackets: false,
      allowRepeatOperators: true,
      grade: '1',
      semester: '上',
      questionTypes: ['arithmetic'],
      difficulty: 'easy',
      knowledgePoints: [],
      answerMode: 'hidden',
      composition: { arithmetic: 20, application: 0, olympiad: 0 },
    },
  },
  {
    id: 'multiplication',
    name: '30 题乘法',
    description: '适合 3-4 年级，乘法专项练习',
    icon: '✖️',
    config: {
      problemCount: 30,
      termCount: 2,
      operations: { add: false, subtract: false, multiply: true, divide: false },
      digits: { add: 1, subtract: 1, multiply: 1, divide: 1 },
      problemType: 'result',
      useBrackets: false,
      allowRepeatOperators: true,
      grade: '3',
      semester: '上',
      questionTypes: ['arithmetic'],
      difficulty: 'medium',
      knowledgePoints: [],
      answerMode: 'hidden',
      composition: { arithmetic: 30, application: 0, olympiad: 0 },
    },
  },
  {
    id: 'comprehensive',
    name: '50 题综合',
    description: '全题型综合练习，适合期末复习',
    icon: '📝',
    config: {
      problemCount: 50,
      termCount: 2,
      operations: { add: true, subtract: true, multiply: true, divide: false },
      digits: { add: 2, subtract: 2, multiply: 1, divide: 1 },
      problemType: 'result',
      useBrackets: false,
      allowRepeatOperators: true,
      grade: '3',
      semester: '上',
      questionTypes: ['arithmetic', 'application'],
      difficulty: 'medium',
      knowledgePoints: [],
      answerMode: 'hidden',
      composition: { arithmetic: 25, application: 25, olympiad: 0 },
    },
  },
  {
    id: 'olympiad',
    name: '10 题奥数',
    description: '适合 4-6 年级，逻辑思维训练',
    icon: '🧩',
    config: {
      problemCount: 10,
      termCount: 2,
      operations: { add: false, subtract: false, multiply: false, divide: false },
      digits: { add: 1, subtract: 1, multiply: 1, divide: 1 },
      problemType: 'result',
      useBrackets: false,
      allowRepeatOperators: true,
      grade: '4',
      semester: '上',
      questionTypes: ['olympiad'],
      difficulty: 'easy',
      knowledgePoints: [],
      answerMode: 'hidden',
      composition: { arithmetic: 0, application: 0, olympiad: 10 },
    },
  },
  {
    id: 'division',
    name: '25 题除法',
    description: '适合 3-4 年级，除法专项练习',
    icon: '➗',
    config: {
      problemCount: 25,
      termCount: 2,
      operations: { add: false, subtract: false, multiply: false, divide: true },
      digits: { add: 1, subtract: 1, multiply: 1, divide: 2 },
      problemType: 'result',
      useBrackets: false,
      allowRepeatOperators: true,
      grade: '3',
      semester: '下',
      questionTypes: ['arithmetic'],
      difficulty: 'medium',
      knowledgePoints: [],
      answerMode: 'hidden',
      composition: { arithmetic: 25, application: 0, olympiad: 0 },
    },
  },
  {
    id: 'final-review',
    name: '50 题复习',
    description: '适合期末复习，全题型全难度',
    icon: '📚',
    config: {
      problemCount: 50,
      termCount: 3,
      operations: { add: true, subtract: true, multiply: true, divide: true },
      digits: { add: 2, subtract: 2, multiply: 2, divide: 2 },
      problemType: 'result',
      useBrackets: true,
      allowRepeatOperators: true,
      grade: '3',
      semester: '下',
      questionTypes: ['arithmetic', 'application', 'olympiad'],
      difficulty: 'hard',
      knowledgePoints: [],
      answerMode: 'hidden',
      composition: { arithmetic: 25, application: 15, olympiad: 10 },
    },
  },
];

/**
 * 用户自定义预设存储键
 */
const CUSTOM_PRESETS_KEY = 'math-generator-custom-presets';

/**
 * 获取用户自定义预设
 */
export function getCustomPresets() {
  try {
    const saved = localStorage.getItem(CUSTOM_PRESETS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

/**
 * 保存用户自定义预设
 */
export function saveCustomPreset(preset) {
  try {
    const custom = getCustomPresets();
    custom.push(preset);
    localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(custom));
    return true;
  } catch (err) {
    console.error('[presets] Save custom preset failed:', err);
    return false;
  }
}

/**
 * 删除用户自定义预设
 */
export function deleteCustomPreset(presetId) {
  try {
    const custom = getCustomPresets();
    const exists = custom.some(p => p.id === presetId);
    if (!exists) return false;

    const filtered = custom.filter(p => p.id !== presetId);
    localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(filtered));
    return true;
  } catch (err) {
    console.error('[presets] Delete custom preset failed:', err);
    return false;
  }
}

/**
 * 获取所有预设（内置 + 自定义）
 */
export function getAllPresets() {
  return [...builtinPresets, ...getCustomPresets()];
}

/**
 * 更新用户自定义预设
 */
export function updateCustomPreset(presetId, updates) {
  try {
    const custom = getCustomPresets();
    const index = custom.findIndex(p => p.id === presetId);

    if (index === -1) return false;

    custom[index] = {
      ...custom[index],
      ...updates,
      config: updates.config ? JSON.parse(JSON.stringify(updates.config)) : custom[index].config,
    };

    localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(custom));
    return true;
  } catch (err) {
    console.error('[presets] Update custom preset failed:', err);
    return false;
  }
}

/**
 * 根据 ID 获取预设
 * @param {string} id - 预设 ID
 * @returns {Object|null} 预设配置
 */
export function getPresetById(id) {
  return getAllPresets().find(p => p.id === id) || null;
}
