<template>
  <div class="fixed top-5 right-5 z-[10000] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none" role="alert" aria-live="polite">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast-card pointer-events-auto flex items-start gap-3 rounded-lg px-4 py-3 shadow-medium cursor-pointer', toastClass(toast.type)]"
        @click="removeToast(toast.id)"
      >
        <span class="text-base flex-shrink-0 mt-0.5">{{ iconMap[toast.type] }}</span>
        <div class="flex-1 min-w-0">
          <p class="font-medium text-sm">{{ toast.message }}</p>
          <p v-if="toast.detail" class="text-xs mt-0.5 opacity-80">{{ toast.detail }}</p>
        </div>
        <button
          class="text-lg leading-none flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          @click.stop="removeToast(toast.id)"
          aria-label="关闭"
        >
          ×
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useToast } from '../composables/useToast.js'

const { toasts, removeToast } = useToast()

const iconMap = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: '💡',
}

function toastClass(type) {
  const map = {
    success: 'bg-success/10 border-l-4 border-success text-success',
    error:   'bg-error/10   border-l-4 border-error   text-error',
    warning: 'bg-warning/10 border-l-4 border-warning text-warning',
    info:    'bg-paper-card border border-rule-soft text-ink-deep',
  }
  return map[type] || map.info
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
