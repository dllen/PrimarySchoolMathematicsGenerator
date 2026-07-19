import { describe, it, expect } from 'vitest';
import {
  GRADES,
  SEMESTERS,
  QUESTION_TYPES,
  DIFFICULTIES,
  ANSWER_MODES,
  PROBLEM_TYPES,
} from './options.js';
import { KNOWLEDGE_POINTS_BY_GRADE } from './knowledgePoints.js';

describe('options', () => {
  it('exposes 6 grades 1-6', () => {
    expect(GRADES).toEqual(['1', '2', '3', '4', '5', '6']);
  });
  it('exposes 2 semesters', () => {
    expect(SEMESTERS).toEqual(['上', '下']);
  });
  it('exposes 3 question types', () => {
    expect(QUESTION_TYPES).toEqual(['arithmetic', 'application', 'olympiad']);
  });
  it('exposes 3 difficulties', () => {
    expect(DIFFICULTIES).toEqual(['easy', 'medium', 'hard']);
  });
  it('exposes 3 answer modes', () => {
    expect(ANSWER_MODES).toEqual(['hidden', 'inline', 'separate']);
  });
  it('exposes 2 problem types (arithmetic subtypes)', () => {
    expect(PROBLEM_TYPES).toEqual(['result', 'operand']);
  });
});

describe('knowledgePoints', () => {
  it('has entries for all 6 grades', () => {
    expect(Object.keys(KNOWLEDGE_POINTS_BY_GRADE).sort()).toEqual(['1','2','3','4','5','6']);
  });
  it('grade 1 contains 100以内加减法', () => {
    expect(KNOWLEDGE_POINTS_BY_GRADE['1']).toContain('100以内加减法');
  });
  it('grade 2 contains 表内乘法', () => {
    expect(KNOWLEDGE_POINTS_BY_GRADE['2']).toContain('表内乘法');
  });
  it('grade 3 contains 分数初步', () => {
    expect(KNOWLEDGE_POINTS_BY_GRADE['3']).toContain('分数初步');
  });
  it('grade 4 contains 小数初步', () => {
    expect(KNOWLEDGE_POINTS_BY_GRADE['4']).toContain('小数初步');
  });
  it('grade 5 contains 简易方程', () => {
    expect(KNOWLEDGE_POINTS_BY_GRADE['5']).toContain('简易方程');
  });
  it('grade 6 contains 几何图形', () => {
    expect(KNOWLEDGE_POINTS_BY_GRADE['6']).toContain('几何图形');
  });
  it('every grade has unit conversion', () => {
    for (const g of ['1','2','3','4','5','6']) {
      expect(KNOWLEDGE_POINTS_BY_GRADE[g]).toContain('单位换算');
    }
  });
});