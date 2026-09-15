import { describe, it, expect } from 'vitest';
import { render, renderAnswer } from './renderer.js';

describe('render', () => {
  it('简单变量替换', () => {
    expect(render('a={{x}} b={{y}}', { x: 5, y: 10 })).toBe('a=5 b=10');
  });

  it('数字变量渲染', () => {
    expect(render('{{unitPrice}} × {{quantity}} = {{total}}', { unitPrice: 8, quantity: 6, total: 48 })).toBe('8 × 6 = 48');
  });

  it('缺失占位保留原样', () => {
    expect(render('a={{x}} b={{missing}}', { x: 5 })).toBe('a=5 b={{missing}}');
  });

  it('追加单位', () => {
    expect(render('{{total}}', { total: 48 }, { unit: '元' })).toBe('48元');
  });

  it('空 vars 不抛错', () => {
    expect(render('hello', {})).toBe('hello');
  });
});

describe('renderAnswer', () => {
  it('值 + 单位', () => {
    expect(renderAnswer(48, { unit: '元' })).toBe('48元');
  });
  it('值无单位', () => {
    expect(renderAnswer(42, {})).toBe('42');
  });
});
