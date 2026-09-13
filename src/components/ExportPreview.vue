<template>
  <Teleport to="body">
    <!-- 桌面端模态框 -->
    <Transition name="fade">
      <div
        v-if="visible && !isMobile"
        class="fixed inset-0 z-50 flex items-center justify-center bg-ink-deep/40 p-4"
        @click.self="$emit('close')"
      >
        <div class="bg-paper-card border border-rule-soft rounded-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden shadow-large">
          <div class="flex items-center justify-between px-5 py-4 border-b border-rule-soft flex-shrink-0">
            <h3 class="font-serif font-semibold text-base text-ink-deep">📄 {{ title }}</h3>
            <button
              class="w-8 h-8 rounded-full bg-rule-softer text-ink-muted hover:bg-rule-soft flex items-center justify-center transition-colors"
              @click="$emit('close')"
            >
              ×
            </button>
          </div>

          <div class="flex-1 overflow-auto p-5 bg-rule-softer">
            <img
              v-if="type === 'image' && previewData?.url"
              :src="previewData.url"
              alt="导出预览"
              class="w-full rounded-lg shadow-medium"
            />
            <div v-else-if="type === 'pdf'" class="w-full">
              <iframe v-if="previewData?.url" :src="previewData.url" class="w-full h-96 rounded-lg bg-paper border-0" />
              <div v-else class="flex items-center justify-center h-48 text-ink-faint text-sm">PDF 生成中...</div>
            </div>
          </div>

          <div class="px-5 py-3 bg-ember/5 border-t border-ember/20">
            <div v-if="env.browser === 'wechat'" class="flex items-start gap-2">
              <span>💡</span>
              <div class="text-xs text-ink-muted">
                <strong class="text-ink-deep">微信用户：</strong>长按图片 → 保存到相册
              </div>
            </div>
            <div v-else-if="env.platform === 'mobile'" class="flex items-start gap-2">
              <span>💡</span>
              <div class="text-xs text-ink-muted">长按图片保存到相册</div>
            </div>
            <div v-else class="flex items-start gap-2">
              <span>💡</span>
              <div class="text-xs text-ink-muted">右键图片另存为，或使用下方按钮</div>
            </div>
          </div>

          <div class="px-5 py-4 border-t border-rule-soft flex gap-2 flex-wrap flex-shrink-0">
            <template v-if="type === 'image'">
              <BaseButton v-if="env.platform !== 'mobile'" variant="ember" size="sm" @click="$emit('save')">
                💾 保存图片
              </BaseButton>
              <BaseButton v-if="env.features?.share" variant="ink" size="sm" @click="$emit('share')">
                📤 分享
              </BaseButton>
            </template>
            <template v-else-if="type === 'pdf'">
              <BaseButton variant="ember" size="sm" @click="$emit('download-pdf')">
                📥 下载 PDF
              </BaseButton>
              <BaseButton v-if="env.features?.print" variant="ink" size="sm" @click="$emit('print')">
                🖨️ 打印
              </BaseButton>
            </template>
            <BaseButton variant="ghost" size="sm" class="ml-auto" @click="$emit('close')">关闭</BaseButton>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 移动端 BaseSheet -->
    <BaseSheet v-if="visible && isMobile" v-model="sheetVisible">
      <div class="space-y-4">
        <h3 class="font-serif font-semibold text-base text-ink-deep">📄 {{ title }}</h3>
        <div class="overflow-auto rounded-lg bg-rule-softer">
          <img
            v-if="type === 'image' && previewData?.url"
            :src="previewData.url"
            alt="导出预览"
            class="w-full"
          />
        </div>
        <div class="text-xs text-ink-muted bg-ember/5 rounded-lg p-3">
          💡 长按图片保存到相册
        </div>
        <div class="flex gap-2">
          <BaseButton v-if="type === 'image'" variant="ember" size="sm" class="flex-1" @click="$emit('save')">
            💾 保存
          </BaseButton>
          <BaseButton v-if="type === 'pdf'" variant="ember" size="sm" class="flex-1" @click="$emit('download-pdf')">
            📥 下载
          </BaseButton>
        </div>
      </div>
    </BaseSheet>
  </Teleport>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { BaseButton } from './base'
import BaseSheet from './base/BaseSheet.vue'

export default {
  name: 'ExportPreview',
  components: { BaseButton, BaseSheet },
  props: {
    visible: { type: Boolean, default: false },
    type: { type: String, default: 'image' },
    previewData: { type: Object, default: null },
    env: { type: Object, required: true },
    isMobile: { type: Boolean, default: false },
  },
  emits: ['close', 'save', 'share', 'print', 'download-pdf'],
  setup(props) {
    const sheetVisible = ref(false)
    watch(() => props.visible, (val) => { sheetVisible.value = val })
    const title = computed(() => props.type === 'image' ? '图片已生成' : 'PDF 已生成')
    return { sheetVisible, title }
  },
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
