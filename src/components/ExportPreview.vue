<template>
  <div v-if="visible" class="export-preview-overlay" @click.self="close">
    <div class="export-preview-dialog">
      <!-- 标题 -->
      <div class="dialog-header">
        <h3>📄 {{ title }}</h3>
        <button class="close-btn" @click="close">✕</button>
      </div>

      <!-- 预览区域 -->
      <div class="preview-scroll">
        <img
          v-if="type === 'image'"
          :src="previewData.url"
          :alt="'导出预览'"
          class="preview-image"
        />
        <div v-else-if="type === 'pdf'" class="pdf-preview">
          <iframe v-if="previewData.url" :src="previewData.url" class="pdf-frame" />
          <div v-else class="pdf-loading">
            <p>PDF 生成中...</p>
          </div>
        </div>
      </div>

      <!-- 引导文字 -->
      <div class="guide-text">
        <div v-if="env.browser === 'wechat'" class="guide-item wechat">
          <span class="guide-icon">💡</span>
          <div class="guide-content">
            <strong>微信用户操作指南：</strong>
            <ol>
              <li>长按上方图片</li>
              <li>点击"保存到相册"</li>
              <li>可转发给老师或打印</li>
            </ol>
          </div>
        </div>

        <div v-else-if="env.platform === 'mobile'" class="guide-item mobile">
          <span class="guide-icon">💡</span>
          <div class="guide-content">
            <strong>手机用户：</strong>
            <p>长按上方图片保存到相册</p>
          </div>
        </div>

        <div v-else class="guide-item desktop">
          <span class="guide-icon">💡</span>
          <div class="guide-content">
            <p>可以右键"图片另存为"保存，或使用下方按钮</p>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <!-- 图片相关 -->
        <template v-if="type === 'image'">
          <button v-if="env.platform !== 'mobile'" @click="$emit('save')" class="btn-primary">
            💾 保存图片
          </button>

          <button
            v-if="env.features.share"
            @click="$emit('share')"
            class="btn-secondary"
          >
            📤 分享
          </button>
        </template>

        <!-- PDF 相关 -->
        <template v-else-if="type === 'pdf'">
          <button @click="$emit('download-pdf')" class="btn-primary">
            📥 下载 PDF
          </button>

          <button
            v-if="env.features.print"
            @click="$emit('print')"
            class="btn-secondary"
          >
            🖨️ 打印
          </button>
        </template>

        <!-- 通用按钮 -->
        <button @click="close" class="btn-tertiary">
          关闭
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  type: { type: String, default: 'image' },  // 'image' | 'pdf'
  previewData: { type: Object, default: null },
  env: { type: Object, required: true }
})

const emit = defineEmits(['close', 'save', 'share', 'print', 'download-pdf'])

const title = computed(() => {
  return props.type === 'image' ? '图片已生成' : 'PDF 已生成'
})

function close() {
  emit('close')
}
</script>

<style scoped>
.export-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.export-preview-dialog {
  background: white;
  border-radius: 16px;
  max-width: 95vw;
  max-height: 95vh;
  width: 600px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #f0f0f0;
}

.preview-scroll {
  flex: 1;
  overflow: auto;
  padding: 20px;
  background: #f5f5f5;
}

.preview-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.pdf-frame {
  width: 100%;
  height: 500px;
  border: none;
  border-radius: 8px;
  background: white;
}

.pdf-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
}

.guide-text {
  padding: 16px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
}

.guide-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.guide-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.guide-content {
  flex: 1;
}

.guide-content strong {
  display: block;
  margin-bottom: 8px;
  color: #333;
}

.guide-content ol,
.guide-content p {
  margin: 0;
  padding-left: 20px;
  color: #555;
  line-height: 1.8;
}

.guide-item.wechat .guide-content {
  background: #07c160;
  color: white;
  padding: 12px;
  border-radius: 8px;
}

.guide-item.wechat .guide-content strong {
  color: white;
}

.guide-item.wechat .guide-content ol {
  color: white;
}

.action-buttons {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e0e0e0;
  background: white;
}

.action-buttons button {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #2196f3;
  color: white;
}

.btn-primary:hover {
  background: #1976d2;
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background: #e8e8e8;
}

.btn-tertiary {
  background: none;
  color: #666;
}

.btn-tertiary:hover {
  background: #f0f0f0;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .export-preview-dialog {
    width: 100%;
    max-width: none;
    max-height: 100vh;
    border-radius: 0;
  }

  .action-buttons {
    flex-wrap: wrap;
  }

  .action-buttons button {
    min-width: calc(50% - 6px);
  }
}
</style>
