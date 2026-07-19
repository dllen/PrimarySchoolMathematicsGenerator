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
 * 移动预设到新位置（用于拖拽排序）
 */
export function movePreset(fromIndex, toIndex) {
  try {
    const custom = getCustomPresets();

    if (fromIndex < 0 || fromIndex >= custom.length) return false;
    if (toIndex < 0 || toIndex >= custom.length) return false;

    const [removed] = custom.splice(fromIndex, 1);
    custom.splice(toIndex, 0, removed);

    localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(custom));
    return true;
  } catch (err) {
    console.error('[presets] Move preset failed:', err);
    return false;
  }
}

/**
 * 导出所有自定义预设为 JSON 文件
 */
export function exportCustomPresets() {
  try {
    const custom = getCustomPresets();
    const json = JSON.stringify(custom, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `math-presets-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, count: custom.length };
  } catch (err) {
    console.error('[presets] Export failed:', err);
    return { success: false, error: err.message };
  }
}

/**
 * 导入预设从 JSON 文件
 */
export function importCustomPresets(jsonString, options = {}) {
  try {
    const data = JSON.parse(jsonString);

    if (!Array.isArray(data)) {
      return { success: false, error: '格式错误：预设必须是数组' };
    }

    // 验证每个预设的结构
    const validated = [];
    for (const preset of data) {
      if (!preset.id || !preset.name || !preset.config) {
        continue; // 跳过无效预设
      }
      validated.push({
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, // 避免 ID 冲突
        name: preset.name,
        description: preset.description || '',
        icon: preset.icon || '⭐',
        config: preset.config,
      });
    }

    if (validated.length === 0) {
      return { success: false, error: '没有有效的预设数据' };
    }

    // 合并到现有预设
    const existing = getCustomPresets();
    const merged = options.merge ? [...existing, ...validated] : validated;
    localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(merged));

    return {
      success: true,
      imported: validated.length,
      total: merged.length,
    };
  } catch (err) {
    console.error('[presets] Import failed:', err);
    return { success: false, error: `导入失败：${err.message}` };
  }
}

/**
 * 从文件读取并导入预设
 */
export async function importPresetsFromFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const result = importCustomPresets(e.target.result);
      resolve(result);
    };

    reader.onerror = () => {
      resolve({ success: false, error: '文件读取失败' });
    };

    reader.readAsText(file);
  });
}

/**
 * 根据 ID 获取预设
 * @param {string} id - 预设 ID
 * @returns {Object|null} 预设配置
 */
export function getPresetById(id) {
  return getAllPresets().find(p => p.id === id) || null;
}
