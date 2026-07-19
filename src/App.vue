<template>
  <div class="container">
    <ToastContainer />
    <div class="header">
      <h2>小学数学题生成器</h2>
      <p style="color: red; font-weight: bolder" v-if="!isMobile">
        配置参数，生成数学练习题
      </p>
      <p style="color: red; font-weight: bolder" v-else>
        配置参数，生成数学练习题，可下载图片或分享
      </p>
    </div>

    <div v-if="viewMode === 'generator'">
      <!-- 预设选择器 -->
      <PresetSelector
        @apply="applyPreset"
        @edit="showPresetManager = true"
        @create="showPresetManager = true"
        @delete="handlePresetDelete"
      />

      <!-- 配置向导/高级配置 -->
      <ConfigWizard
        v-if="currentView === 'wizard'"
        :model-value="wizardState.config"
        @update:model-value="wizardState.config = $event"
        @complete="handleWizardComplete"
      />

      <ConfigPanel
        v-else
        :config="config"
        @update:config="config = $event"
      />

      <ActionBar
        :problems="problems"
        :is-mobile="isMobile"
        @generate="generateProblems"
        @export-pdf="exportPdf"
        @print="handlePrint"
        @share="handleShare"
        @show-history="viewMode = 'history'"
      />

      <div ref="printRoot" class="print-root" :class="{ 'export-mode': exporting }">
        <div class="worksheet-header">
          <h3>数学练习题</h3>
          <div class="info-row print-only">
            <span>{{ config.grade }}年级{{ config.semester }}册</span>
            <span>姓名：_____________</span>
            <span>得分：_____________</span>
          </div>
          <p class="date">{{ today }}</p>
        </div>
        <ProblemGrid
          :problems="problems"
          :show-answer="config.answerMode === 'inline'"
        />
        <AnswerPage
          v-if="config.answerMode === 'separate'"
          :problems="problems"
          :cols="4"
        />
      </div>
    </div>

    <HistoryList
      v-else-if="viewMode === 'history'"
      :items="history"
      @open="openHistory"
      @delete="deleteHistory"
      @back="viewMode = 'generator'"
    />

    <HistoryDetail
      v-else-if="viewMode === 'history-detail'"
      :item="selectedHistory"
      @back="viewMode = 'history'"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import ConfigPanel from './components/ConfigPanel.vue';
import ConfigWizard from './components/ConfigWizard.vue';
import ActionBar from './components/ActionBar.vue';
import ProblemGrid from './components/ProblemGrid.vue';
import AnswerPage from './components/AnswerPage.vue';
import HistoryList from './components/HistoryList.vue';
import HistoryDetail from './components/HistoryDetail.vue';
import ToastContainer from './components/ToastContainer.vue';
import ConfirmDialog from './components/ConfirmDialog.vue';
import PresetSelector from './components/PresetSelector.vue';
import PresetManager from './components/PresetManager.vue';
import { useProblemGenerator } from './composables/useProblemGenerator.js';
import { usePdfExport } from './composables/usePdfExport.js';
import { usePrint } from './composables/usePrint.js';
import { useToast } from './composables/useToast.js';
import { addProblemSet, getHistory, db } from './db.js';
import { deleteCustomPreset } from './constants/presets.js';

export default {
  components: {
    ToastContainer,
    ConfigPanel,
    ConfigWizard,
    ActionBar,
    ProblemGrid,
    AnswerPage,
    HistoryList,
    HistoryDetail,
    ConfirmDialog,
    PresetSelector,
    PresetManager,
  },
  setup() {
    const today = new Date().toISOString().slice(0, 10);
    const isMobile = ref(false);
    const viewMode = ref('generator');
    const problems = ref([]);
    const history = ref([]);
    const selectedHistory = ref(null);
    const printRoot = ref(null);
    const exporting = ref(false);
    const showPresetManager = ref(false);
    const currentView = ref('panel'); // 'wizard' or 'panel'
    const wizardState = ref({
      config: {
        grade: '3',
        semester: '上',
        problemCount: 20,
        difficulty: 'medium',
        questionTypes: ['arithmetic'],
        operations: {
          add: true,
          subtract: true,
          multiply: false,
          divide: false,
        },
      },
    });

    const config = ref({
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
    });

    // 应用预设配置
    function applyPreset(presetConfig) {
      Object.assign(config.value, presetConfig);
      success('已应用预设配置', `题目数量: ${presetConfig.problemCount || 20} 题`);
    }

    // 向导完成处理
    function handleWizardComplete() {
      // 将向导配置应用到主配置
      Object.assign(config.value, wizardState.value.config);
      // 切换到普通视图
      currentView.value = 'panel';
      // 生成题目
      generateProblems();
    }

    // 删除自定义预设
    function handlePresetDelete(presetId) {
      const deleted = deleteCustomPreset(presetId);
      if (deleted) {
        success('删除成功', '预设已删除');
        refreshHistory(); // 刷新历史记录以反映变化
      } else {
        error('删除失败', '预设不存在或无法删除');
      }
    }

    const generator = useProblemGenerator();
    const pdf = usePdfExport();
    const printer = usePrint();
    const { success, error, warning, info, showToast } = useToast();

    function detectMobile() {
      const ua = navigator.userAgent;
      if (/Mobi|Android|iPhone/i.test(ua)) return true;
      if (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.platform)) return true;
      return false;
    }

    onMounted(() => {
      isMobile.value = detectMobile();
      refreshHistory();
    });

    async function refreshHistory() {
      history.value = await getHistory();
    }

    async function generateProblems() {
      const startTime = Date.now();

      try {
        const list = await generator.generate(config.value);
        problems.value = list;

        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        showToast({
          type: 'success',
          message: `已生成 ${list.length} 题`,
          detail: `耗时 ${duration}s`,
        });

        await addProblemSet(list, config.value);
        await refreshHistory();
      } catch (err) {
        showToast({
          type: 'error',
          message: '生成失败',
          detail: err.message,
        });
        console.error(err);
      }
    }

    async function exportPdf() {
      if (!printRoot.value) {
        warning('无法导出', '请先生成题目');
        return;
      }

      const filename = pdf.buildFilename({
        grade: config.value.grade,
        semester: config.value.semester,
      });

      exporting.value = true;
      try {
        info('正在导出 PDF...');
        await new Promise((resolve) => requestAnimationFrame(resolve));
        await pdf.exportPdf(printRoot.value, filename);
        success('PDF 已保存', filename);
      } catch (err) {
        warning('PDF 导出失败', '正在尝试保存为图片...');
        await fallbackToImage(printRoot.value, filename);
      } finally {
        exporting.value = false;
      }
    }

    async function fallbackToImage(element, filename) {
      try {
        const html2canvas = (await import('html2canvas-pro')).default;
        const canvas = await html2canvas(element, { scale: 2, useCORS: true });
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = filename.replace('.pdf', '.png');
        link.click();
        info('图片已保存', filename.replace('.pdf', '.png'));
      } catch (err) {
        error('导出失败', '请尝试手动截图或刷新后重试');
      }
    }

    function handlePrint() {
      if (isMobile.value) {
        downloadImage();
        return;
      }
      printer.print({ answerMode: config.value.answerMode });
    }

    async function downloadImage() {
      try {
        const html2canvas = (await import('html2canvas-pro')).default;
        if (!printRoot.value) return;

        info('正在生成图片...');
        exporting.value = true;
        await new Promise((resolve) => requestAnimationFrame(resolve));
        const canvas = await html2canvas(printRoot.value, { scale: 2, useCORS: true });
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `数学练习题_${config.value.grade}年级_${today}.png`;
        link.click();
        success('图片已下载');
      } catch (err) {
        error('下载失败', err.message);
      } finally {
        exporting.value = false;
      }
    }

    async function handleShare() {
      try {
        const html2canvas = (await import('html2canvas-pro')).default;
        info('正在生成分享图片...');

        const canvas = await html2canvas(printRoot.value, { scale: 2, useCORS: true });
        canvas.toBlob(async (blob) => {
          if (!blob) {
            error('分享失败', '图片生成失败');
            return;
          }

          const file = new File([blob], `数学练习题_${today}.png`, { type: 'image/png' });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: '数学练习题' });
            success('分享成功');
          } else {
            warning('浏览器不支持分享', '已自动下载图片');
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `数学练习题_${today}.png`;
            link.click();
          }
        });
      } catch (err) {
        error('分享失败', err.message);
      }
    }

    async function openHistory(item) {
      selectedHistory.value = item;
      viewMode.value = 'history-detail';
    }

    async function deleteHistory(item) {
      if (!confirm('确定删除这份试卷吗？此操作无法撤销。')) {
        return;
      }

      try {
        await db.problemSets.delete(item.id);
        await refreshHistory();
        success('删除成功');
      } catch (err) {
        error('删除失败', err.message);
      }
    }

    return {
      today,
      isMobile,
      viewMode,
      currentView,
      config,
      problems,
      history,
      selectedHistory,
      printRoot,
      exporting,
      showPresetManager,
      wizardState,
      generateProblems,
      applyPreset,
      handleWizardComplete,
      handlePresetDelete,
      exportPdf,
      handlePrint,
      handleShare,
      openHistory,
      deleteHistory,
    };
  },
};
</script>

<style scoped>
.header { display: flex; flex-direction: column; gap: 4px; }
.worksheet-header { text-align: center; margin-bottom: 12px; }
.worksheet-header h3 { margin: 0; }
.worksheet-header p { color: #666; margin: 4px 0; }
.worksheet-header .info-row {
  display: none;
  justify-content: space-between;
  padding: 0 8px;
  font-size: 14px;
}
.worksheet-header .date {
  color: #666;
  font-size: 13px;
  margin: 4px 0;
}
</style>
