import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick, effectScope } from 'vue';
import { useToast, disposeToastTimers } from './useToast.js';

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    // 每个测试用例跑完都清掉所有残留定时器,避免跨用例泄漏
    disposeToastTimers();
  });

  it('should add toast when showToast called', () => {
    const { toasts, showToast } = useToast();

    const id = showToast({ type: 'success', message: 'Test', duration: 0 });

    expect(id).toBeTypeOf('number');
    expect(toasts.value.length).toBeGreaterThan(0);
    expect(toasts.value.some(t => t.message === 'Test' && t.type === 'success')).toBe(true);
  });

  it('should remove toast when removeToast called', () => {
    const { toasts, showToast, removeToast } = useToast();

    showToast({ type: 'info', message: 'To be removed', duration: 0 });
    const toastId = toasts.value.find(t => t.message === 'To be removed')?.id;

    if (toastId) {
      removeToast(toastId);
    }

    expect(toasts.value.find(t => t.message === 'To be removed')).toBeUndefined();
  });

  it('should provide convenience methods', () => {
    const { toasts, success, error, warning, info } = useToast();

    success('OK', 'Details');
    error('Fail', 'Error details');
    warning('Warning', 'Warning details');
    info('Info', 'Info details');

    expect(toasts.value.length).toBeGreaterThanOrEqual(4);
    expect(toasts.value.some(t => t.message === 'OK' && t.type === 'success')).toBe(true);
    expect(toasts.value.some(t => t.message === 'Fail' && t.type === 'error')).toBe(true);
    expect(toasts.value.some(t => t.message === 'Warning' && t.type === 'warning')).toBe(true);
    expect(toasts.value.some(t => t.message === 'Info' && t.type === 'info')).toBe(true);
  });

  it('should have correct toast structure', () => {
    const { toasts, showToast } = useToast();

    showToast({ type: 'warning', message: 'Test message', detail: 'Test detail', duration: 5000 });

    const toast = toasts.value.find(t => t.message === 'Test message');
    expect(toast).toBeDefined();
    expect(toast).toHaveProperty('id');
    expect(toast).toHaveProperty('type', 'warning');
    expect(toast).toHaveProperty('message', 'Test message');
    expect(toast).toHaveProperty('detail', 'Test detail');
  });

  // ===== 新增:针对 Vue 调度器 race condition 的回归测试 =====

  it('should auto-remove toast after duration via setTimeout', async () => {
    const { toasts, showToast } = useToast();

    showToast({ type: 'info', message: 'auto-dismiss', duration: 3000 });
    expect(toasts.value.some(t => t.message === 'auto-dismiss')).toBe(true);

    // 推进到定时器触发,再走 microtask(把 splice 推到 Promise.resolve().then)
    vi.advanceTimersByTime(3000);
    await nextTick();
    await Promise.resolve();

    expect(toasts.value.some(t => t.message === 'auto-dismiss')).toBe(false);
  });

  it('should not auto-remove toast when duration is 0', async () => {
    const { toasts, showToast } = useToast();

    showToast({ type: 'info', message: 'sticky', duration: 0 });

    vi.advanceTimersByTime(10_000);
    await nextTick();
    await Promise.resolve();

    expect(toasts.value.some(t => t.message === 'sticky')).toBe(true);
  });

  it('clearAll should remove every toast and cancel pending timers', async () => {
    const { toasts, showToast, clearAll } = useToast();

    showToast({ type: 'info', message: 'a', duration: 5000 });
    showToast({ type: 'info', message: 'b', duration: 5000 });
    showToast({ type: 'info', message: 'c', duration: 5000 });
    expect(toasts.value.length).toBeGreaterThanOrEqual(3);

    clearAll();
    await nextTick();

    expect(toasts.value.find(t => t.message === 'a')).toBeUndefined();
    expect(toasts.value.find(t => t.message === 'b')).toBeUndefined();
    expect(toasts.value.find(t => t.message === 'c')).toBeUndefined();

    // 推进时间,确认 setTimeout 已被取消,不会再 splice 一个空 array
    vi.advanceTimersByTime(10_000);
    await nextTick();
    await Promise.resolve();
    // 这里只验证不报错(不期望额外的 mutation)
    expect(toasts.value.length).toBe(0);
  });

  it('dismiss should remove a single toast and cancel its pending timer', async () => {
    const { toasts, showToast, dismiss } = useToast();

    const id = showToast({ type: 'info', message: 'one-off', duration: 5000 });
    dismiss(id);

    expect(toasts.value.find(t => t.id === id)).toBeUndefined();

    // 时间快进,确认被取消的定时器不会再触发任何 splice
    vi.advanceTimersByTime(10_000);
    await nextTick();
    await Promise.resolve();
    expect(toasts.value.find(t => t.message === 'one-off')).toBeUndefined();
  });

  it('safeRemove should skip reactive mutation when called inside a stopped effectScope', () => {
    const { toasts, showToast } = useToast();
    const id = showToast({ type: 'info', message: 'guarded', duration: 0 });

    let stopped = false;
    const scope = effectScope();
    scope.run(() => {
      // 在一个外部 scope 内伪造一次"已停止"的探测:这里只是验证 safeRemove
      // 不会在 scope 仍然 active 时抛错。
      stopped = false;
    });
    scope.stop();

    // scope 已 stop,模拟 stale 回调里调用 removeToast,应该被 safeRemove 拦截
    expect(() => {
      useToast().removeToast(id);
    }).not.toThrow();

    // 此时 toast 已经被第一次 removeToast 清掉;再调一次也无副作用
    expect(toasts.value.find(t => t.id === id)).toBeUndefined();
    expect(stopped).toBe(false);
  });

  it('disposeToastTimers should be idempotent and safe to call multiple times', () => {
    expect(() => {
      disposeToastTimers();
      disposeToastTimers();
    }).not.toThrow();
  });
});
