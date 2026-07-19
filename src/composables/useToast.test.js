import { describe, it, expect, vi } from 'vitest';
import { useToast } from './useToast.js';

describe('useToast', () => {
  it('should add toast when showToast called', () => {
    const { toasts, showToast } = useToast();

    const id = showToast({ type: 'success', message: 'Test' });

    expect(id).toBeTypeOf('number');
    expect(toasts.value.length).toBeGreaterThan(0);
    expect(toasts.value.some(t => t.message === 'Test' && t.type === 'success')).toBe(true);
  });

  it('should remove toast when removeToast called', () => {
    const { toasts, showToast, removeToast } = useToast();

    showToast({ type: 'info', message: 'To be removed' });
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
});
