import { reactive, computed } from 'vue';

const STORAGE_KEY = 'math-generator-config';

const defaultConfig = {
  problemCount: 20,
  termCount: 2,
  operations: { add: true, subtract: true, multiply: false, divide: false },
  digits: { add: 1, subtract: 1, multiply: 1, divide: 1 },
  problemType: 'result',
  useBrackets: false,
  allowRepeatOperators: true,
  grade: '3',
  semester: '上',
  questionTypes: ['arithmetic'],
  difficulty: 'easy',
  knowledgePoints: [],
  answerMode: 'hidden',
  composition: { arithmetic: 0, application: 0, olympiad: 0 },
};

export function useConfigWizard() {
  // Load saved config or use default
  const loadSavedConfig = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : { ...defaultConfig };
    } catch {
      return { ...defaultConfig };
    }
  };

  const state = reactive({
    step: 1,
    totalSteps: 3,
    config: loadSavedConfig(),
  });

  const arithmeticSelected = computed(() =>
    state.config.questionTypes.includes('arithmetic')
  );

  const hasMultipleTypes = computed(() =>
    state.config.questionTypes.length > 1
  );

  function nextStep() {
    if (state.step < state.totalSteps) {
      state.step++;
    }
  }

  function prevStep() {
    if (state.step > 1) {
      state.step--;
    }
  }

  function saveConfig() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.config));
      return true;
    } catch (err) {
      console.error('[ConfigWizard] Save failed:', err);
      return false;
    }
  }

  function resetConfig() {
    state.config = { ...defaultConfig };
    state.step = 1;
    localStorage.removeItem(STORAGE_KEY);
  }

  function getConfigSummary() {
    const c = state.config;
    return {
      grade: `${c.grade}年级${c.semester}册`,
      type: c.questionTypes.join(', '),
      count: `${c.problemCount}题`,
      difficulty: c.difficulty === 'easy' ? '简单' : c.difficulty === 'medium' ? '中等' : '困难',
    };
  }

  return {
    state,
    arithmeticSelected,
    hasMultipleTypes,
    nextStep,
    prevStep,
    saveConfig,
    resetConfig,
    getConfigSummary,
  };
}
