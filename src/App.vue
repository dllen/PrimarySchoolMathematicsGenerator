<template>
  <div class="container">
    <div class="header">
      <h2>小学数学口算题生成器</h2>
      <p style="color: red; font-weight: bolder" v-if="!isMobile">
        配置参数，生成数学练习题
      </p>
      <p style="color: red; font-weight: bolder" v-else>
        配置参数，生成数学练习题，可下载图片或分享
      </p>
    </div>

    <div v-if="viewMode === 'generator'">
      <ConfigPanel :config="config" @update:config="config = $event" />
      <ActionBar
        :problems="problems"
        :is-mobile="isMobile"
        @generate="generateProblems"
        @export-pdf="exportPdf"
        @print="handlePrint"
        @share="handleShare"
        @show-history="viewMode = 'history'"
      />

      <div ref="printRoot" class="print-root">
        <div class="worksheet-header">
          <h3>数学练习题</h3>
          <p>{{ config.grade }}年级{{ config.semester }}册 · {{ today }}</p>
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
import ActionBar from './components/ActionBar.vue';
import ProblemGrid from './components/ProblemGrid.vue';
import AnswerPage from './components/AnswerPage.vue';
import HistoryList from './components/HistoryList.vue';
import HistoryDetail from './components/HistoryDetail.vue';
import { useProblemGenerator } from './composables/useProblemGenerator.js';
import { usePdfExport } from './composables/usePdfExport.js';
import { usePrint } from './composables/usePrint.js';
import { addProblemSet, getHistory, db } from './db.js';

export default {
  components: {
    ConfigPanel,
    ActionBar,
    ProblemGrid,
    AnswerPage,
    HistoryList,
    HistoryDetail,
  },
  setup() {
    const today = new Date().toISOString().slice(0, 10);
    const isMobile = ref(false);
    const viewMode = ref('generator');
    const problems = ref([]);
    const history = ref([]);
    const selectedHistory = ref(null);
    const printRoot = ref(null);

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

    const generator = useProblemGenerator();
    const pdf = usePdfExport();
    const printer = usePrint();

    onMounted(() => {
      isMobile.value = /Mobi|Android|iPhone/i.test(navigator.userAgent);
      refreshHistory();
    });

    async function refreshHistory() {
      history.value = await getHistory();
    }

    async function generateProblems() {
      const list = await generator.generate(config.value);
      problems.value = list;
      await addProblemSet(list, config.value);
      await refreshHistory();
    }

    async function exportPdf() {
      if (!printRoot.value) return;
      const filename = pdf.buildFilename({
        grade: config.value.grade,
        semester: config.value.semester,
      });
      await pdf.exportPdf(printRoot.value, filename);
    }

    function handlePrint() {
      if (isMobile.value) {
        downloadImage();
        return;
      }
      printer.print({ answerMode: config.value.answerMode });
    }

    async function downloadImage() {
      const html2canvas = (await import('html2canvas-pro')).default;
      if (!printRoot.value) return;
      const canvas = await html2canvas(printRoot.value, { scale: 2, useCORS: true });
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `数学练习题_${config.value.grade}年级_${today}.png`;
      link.click();
    }

    async function handleShare() {
      const html2canvas = (await import('html2canvas-pro')).default;
      if (!printRoot.value) return;
      const canvas = await html2canvas(printRoot.value, { scale: 2, useCORS: true });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `数学练习题_${today}.png`, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: '数学练习题',
          });
        } else {
          alert('当前浏览器不支持分享，请使用下载功能');
        }
      });
    }

    async function openHistory(item) {
      selectedHistory.value = item;
      viewMode.value = 'history-detail';
    }

    async function deleteHistory(item) {
      await db.problemSets.delete(item.id);
      await refreshHistory();
    }

    return {
      today,
      isMobile,
      viewMode,
      config,
      problems,
      history,
      selectedHistory,
      printRoot,
      generateProblems,
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
.container { max-width: 960px; margin: 0 auto; padding: 16px; }
.header { display: flex; flex-direction: column; gap: 4px; }
.print-root { padding: 16px 0; }
.worksheet-header { text-align: center; margin-bottom: 12px; }
.worksheet-header h3 { margin: 0; }
.worksheet-header p { color: #666; margin: 4px 0; }
</style>
