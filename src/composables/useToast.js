import { ref, computed } from 'vue';

const toasts = ref([]);
let idCounter = 0;

export function useToast() {
  const toastTypes = ['success', 'error', 'warning', 'info'];

  function showToast({ type = 'info', message, detail = '', duration = 3000 }) {
    if (!toastTypes.includes(type)) {
      console.warn(`Invalid toast type: ${type}`);
      type = 'info';
    }

    const id = ++idCounter;
    const toast = { id, type, message, detail };
    toasts.value.push(toast);

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }

    return id;
  }

  function removeToast(id) {
    const index = toasts.value.findIndex(t => t.id === id);
    if (index !== -1) {
      toasts.value.splice(index, 1);
    }
  }

  // Convenience methods
  const success = (msg, detail) => showToast({ type: 'success', message: msg, detail });
  const error = (msg, detail) => showToast({ type: 'error', message: msg, detail });
  const warning = (msg, detail) => showToast({ type: 'warning', message: msg, detail });
  const info = (msg, detail) => showToast({ type: 'info', message: msg, detail });

  return {
    toasts: computed(() => toasts.value),
    showToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}
