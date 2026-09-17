import { ref, computed, getCurrentScope, effectScope } from 'vue';

const toasts = ref([]);
let idCounter = 0;

// 跟踪每个 toast 的定时器句柄,便于在 dispose / 用户主动关闭时清理,
// 避免 setTimeout 在组件卸载/路由切换/页面隐藏后回调,触发 Vue 调度器
// 在过渡态时遍历到 stale 的 undefined job,导致
// `Cannot read properties of undefined (reading 'startTime')`。
//
// 参见 Vue 3.5+ scheduler:flushJobs → reportAllChanges 会在 transition/leave
// 中执行,若期间一个 reactive mutation 进入队列,可能踩到尚未补齐的 slot。
const timers = new Map();

// 模块级 scope,用于把 dispose() 一次性清理所有残留定时器挂到这里。
// 这样如果 useToast 被多个组件/视图并发使用,只需要在应用层 dispose 一次。
const scope = effectScope(true);

function safeRemove(id) {
  // 防御性检查:如果当前处于已停止的 effectScope 中,跳过 reactive mutation,
  // 让 Vue 调度器有机会在稳定状态下处理后续请求。
  // setTimeout 回调里通常没有 active scope(getCurrentScope() === null),
  // 此时 effectScope(true) 是 module-level 的活跃 scope,不会拦截,逻辑照常执行。
  try {
    const current = getCurrentScope();
    if (current && current.active === false) return;
    const index = toasts.value.findIndex(t => t.id === id);
    if (index !== -1) {
      toasts.value.splice(index, 1);
    }
  } catch (err) {
    // 静默:toast 自动消失失败不应阻塞应用。
    console.warn('[useToast] removeToast skipped:', err?.message || err);
  }
}

function scheduleRemoval(id, duration) {
  // 同一 id 被重复 schedule 时,先清理旧的,避免定时器累积
  const prev = timers.get(id);
  if (prev !== undefined) clearTimeout(prev);

  const handle = setTimeout(() => {
    timers.delete(id);
    // 把 splice 推到 microtask,避开 setTimeout 落入调度器过渡态的窗口
    // (transition 离开阶段)。下一轮 microtask 时,Vue 调度器必然处于空闲。
    Promise.resolve().then(() => safeRemove(id));
  }, duration);

  timers.set(id, handle);
}

function clearTimer(id) {
  const handle = timers.get(id);
  if (handle !== undefined) {
    clearTimeout(handle);
    timers.delete(id);
  }
}

export function useToast() {
  const toastTypes = ['success', 'error', 'warning', 'info'];

  function showToast({ type = 'info', message, detail = '', duration = 3000 } = {}) {
    if (!toastTypes.includes(type)) {
      console.warn(`Invalid toast type: ${type}`);
      type = 'info';
    }

    const id = ++idCounter;
    const toast = { id, type, message, detail };
    toasts.value.push(toast);

    if (duration > 0) {
      scheduleRemoval(id, duration);
    }

    return id;
  }

  function removeToast(id) {
    clearTimer(id);
    safeRemove(id);
  }

  /** 主动关闭某条 toast 的便捷方法(语义化别名) */
  function dismiss(id) {
    removeToast(id);
  }

  /** 清空所有 toast 并取消所有挂起的定时器。路由切换或页面隐藏时可调用 */
  function clearAll() {
    timers.forEach((handle) => clearTimeout(handle));
    timers.clear();
    if (toasts.value.length) toasts.value.splice(0, toasts.value.length);
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
    dismiss,
    clearAll,
    success,
    error,
    warning,
    info,
  };
}

/**
 * 在应用生命周期结束(HMR / 测试 teardown / SPA 关闭)时调用,
 * 一次性清掉所有挂起的 toast 定时器,防止在异步回调中触发已 dispose 的
 * 响应式 mutation,从而触发 Vue 调度器的过渡态 race condition。
 */
export function disposeToastTimers() {
  timers.forEach((handle) => clearTimeout(handle));
  timers.clear();
  scope.stop();
}
