<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-end justify-center bg-ink-deep/40 md:hidden"
        @click.self="close"
      >
        <div class="bg-paper-card w-full max-h-[85vh] rounded-t-lg p-5 overflow-y-auto">
          <div class="w-10 h-1 bg-rule-soft rounded-pill mx-auto mb-4" />
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
export default {
  name: 'BaseSheet',
  emits: ['update:modelValue'],
  props: {
    modelValue: { type: Boolean, default: false },
  },
  methods: {
    close() {
      this.$emit('update:modelValue', false)
    },
  },
}
</script>

<style scoped>
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.2s ease;
}
.sheet-enter-active > div,
.sheet-leave-active > div {
  transition: transform 0.25s ease;
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
.sheet-enter-from > div,
.sheet-leave-to > div {
  transform: translateY(100%);
}
</style>
