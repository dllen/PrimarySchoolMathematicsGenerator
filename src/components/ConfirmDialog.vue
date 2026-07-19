<template>
  <div v-if="visible" class="confirm-overlay" @click.self="$emit('cancel')">
    <div class="confirm-dialog" role="dialog" aria-modal="true">
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      <div class="confirm-actions">
        <button class="btn-secondary" @click="$emit('cancel')">取消</button>
        <button class="btn-danger" @click="$emit('confirm')">{{ confirmText }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, required: true },
  title: { type: String, default: '确认' },
  message: { type: String, required: true },
  confirmText: { type: String, default: '确认' },
});

defineEmits(['confirm', 'cancel']);
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.confirm-dialog {
  background: white;
  padding: 24px;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.confirm-dialog h3 {
  margin: 0 0 12px 0;
  color: #333;
}

.confirm-dialog p {
  margin: 0 0 20px 0;
  color: #666;
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-secondary {
  padding: 8px 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.btn-danger {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #f44336;
  color: white;
  cursor: pointer;
}

.btn-danger:hover {
  background: #d32f2f;
}
</style>
