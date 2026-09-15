<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center bg-ink-deep/40 p-4"
        @click.self="close"
      >
        <BaseCard class="max-w-sm w-full" variant="paper">
          <h3 class="font-serif font-semibold text-lg text-ink-deep mb-2">{{ title }}</h3>
          <p class="text-sm text-ink-muted mb-6 leading-relaxed">{{ message }}</p>
          <div class="flex justify-end gap-3">
            <BaseButton variant="ghost" size="sm" @click="onCancel">取消</BaseButton>
            <BaseButton variant="ember" size="sm" @click="onConfirm">{{ confirmText }}</BaseButton>
          </div>
        </BaseCard>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { BaseCard, BaseButton } from './base'

export default {
  name: 'ConfirmDialog',
  components: { BaseCard, BaseButton },
  props: {
    modelValue: { type: Boolean, default: false },
    title: { type: String, default: '确认' },
    message: { type: String, required: true },
    confirmText: { type: String, default: '确认' },
  },
  emits: ['update:modelValue', 'confirm', 'cancel'],
  methods: {
    close() {
      this.$emit('update:modelValue', false)
    },
    onConfirm() {
      this.$emit('confirm')
      this.close()
    },
    onCancel() {
      this.$emit('cancel')
      this.close()
    },
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
