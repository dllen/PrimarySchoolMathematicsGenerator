import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('括号运算符功能测试', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(App)
  })

  describe('generateBracketPosition 函数', () => {
    it('当项数小于3时应返回null', () => {
      const result = wrapper.vm.generateBracketPosition(2)
      expect(result).toBeNull()
    })

    it('当项数为3时应生成有效的括号位置', () => {
      const result = wrapper.vm.generateBracketPosition(3)
      expect(result).not.toBeNull()
      expect(result).toHaveProperty('start')
      expect(result).toHaveProperty('end')
      expect(result.start).toBeGreaterThanOrEqual(0)
      expect(result.end).toBeLessThan(3)
      expect(result.end).toBeGreaterThan(result.start)
    })

    it('当项数为4时应生成有效的括号位置', () => {
      const result = wrapper.vm.generateBracketPosition(4)
      expect(result).not.toBeNull()
      expect(result.start).toBeGreaterThanOrEqual(0)
      expect(result.end).toBeLessThan(4)
      expect(result.end - result.start).toBeGreaterThanOrEqual(1)
      expect(result.end - result.start).toBeLessThanOrEqual(2)
    })
  })

  describe('calculateExpression 函数', () => {
    it('应正确计算加法', () => {
      const result = wrapper.vm.calculateExpression([10, 20], ['+'])
      expect(result).toBe(30)
    })

    it('应正确计算减法', () => {
      const result = wrapper.vm.calculateExpression([30, 10], ['-'])
      expect(result).toBe(20)
    })

    it('应正确计算乘法', () => {
      const result = wrapper.vm.calculateExpression([5, 6], ['×'])
      expect(result).toBe(30)
    })

    it('应正确计算除法', () => {
      const result = wrapper.vm.calculateExpression([20, 4], ['÷'])
      expect(result).toBe(5)
    })

    it('应正确计算混合运算', () => {
      const result = wrapper.vm.calculateExpression([10, 5, 3], ['+', '-'])
      expect(result).toBe(12)
    })
  })

  describe('calculateWithBrackets 函数', () => {
    it('无括号时应与普通计算结果一致', () => {
      const numbers = [10, 5, 3]
      const operations = ['+', '-']
      const result = wrapper.vm.calculateWithBrackets(numbers, operations, null)
      const expected = wrapper.vm.calculateExpression(numbers, operations)
      expect(result).toBe(expected)
    })

    it('应正确计算带括号的表达式：(10 + 5) - 3', () => {
      const numbers = [10, 5, 3]
      const operations = ['+', '-']
      const bracketPos = { start: 0, end: 1 }
      const result = wrapper.vm.calculateWithBrackets(numbers, operations, bracketPos)
      expect(result).toBe(12) // (10 + 5) - 3 = 15 - 3 = 12
    })

    it('应正确计算带括号的表达式：10 - (5 + 3)', () => {
      const numbers = [10, 5, 3]
      const operations = ['-', '+']
      const bracketPos = { start: 1, end: 2 }
      const result = wrapper.vm.calculateWithBrackets(numbers, operations, bracketPos)
      expect(result).toBe(2) // 10 - (5 + 3) = 10 - 8 = 2
    })

    it('应正确计算带括号的表达式：(20 ÷ 4) + 3', () => {
      const numbers = [20, 4, 3]
      const operations = ['÷', '+']
      const bracketPos = { start: 0, end: 1 }
      const result = wrapper.vm.calculateWithBrackets(numbers, operations, bracketPos)
      expect(result).toBe(8) // (20 ÷ 4) + 3 = 5 + 3 = 8
    })

    it('应正确计算带括号的表达式：5 × (6 - 2)', () => {
      const numbers = [5, 6, 2]
      const operations = ['×', '-']
      const bracketPos = { start: 1, end: 2 }
      const result = wrapper.vm.calculateWithBrackets(numbers, operations, bracketPos)
      expect(result).toBe(20) // 5 × (6 - 2) = 5 × 4 = 20
    })
  })

  describe('buildExpression 函数', () => {
    it('无括号时应正确构建表达式', () => {
      const numbers = [10, 5, 3]
      const operations = ['+', '-']
      const result = wrapper.vm.buildExpression(numbers, operations, null)
      expect(result).toBe('10 + 5 - 3')
    })

    it('应正确构建带括号的表达式（括号在开头）', () => {
      const numbers = [10, 5, 3]
      const operations = ['+', '-']
      const bracketPos = { start: 0, end: 1 }
      const result = wrapper.vm.buildExpression(numbers, operations, bracketPos)
      expect(result).toBe('(10 + 5) - 3')
    })

    it('应正确构建带括号的表达式（括号在末尾）', () => {
      const numbers = [10, 5, 3]
      const operations = ['-', '+']
      const bracketPos = { start: 1, end: 2 }
      const result = wrapper.vm.buildExpression(numbers, operations, bracketPos)
      expect(result).toBe('10 - (5 + 3)')
    })

    it('应正确构建带括号的表达式（括号在中间）', () => {
      const numbers = [2, 3, 4, 5]
      const operations = ['+', '×', '-']
      const bracketPos = { start: 1, end: 2 }
      const result = wrapper.vm.buildExpression(numbers, operations, bracketPos)
      expect(result).toBe('2 + (3 × 4) - 5')
    })
  })

  describe('集成测试：生成带括号的题目', () => {
    it('启用括号选项后应能生成带括号的题目', () => {
      wrapper.vm.config.useBrackets = true
      wrapper.vm.config.termCount = '3'
      wrapper.vm.config.problemCount = 10
      wrapper.vm.config.problemType = 'result'
      
      wrapper.vm.generateProblems()
      
      expect(wrapper.vm.problems.length).toBe(10)
      
      // 检查是否至少有一些题目包含括号
      const problemsWithBrackets = wrapper.vm.problems.filter(p => 
        p.expression.includes('(') && p.expression.includes(')')
      )
      
      expect(problemsWithBrackets.length).toBeGreaterThan(0)
    })

    it('未启用括号选项时不应生成带括号的题目', () => {
      wrapper.vm.config.useBrackets = false
      wrapper.vm.config.termCount = '3'
      wrapper.vm.config.problemCount = 10
      wrapper.vm.config.problemType = 'result'
      
      wrapper.vm.generateProblems()
      
      expect(wrapper.vm.problems.length).toBe(10)
      
      // 检查所有题目都不包含括号
      const problemsWithBrackets = wrapper.vm.problems.filter(p => 
        p.expression.includes('(') || p.expression.includes(')')
      )
      
      expect(problemsWithBrackets.length).toBe(0)
    })

    it('生成的带括号题目答案应该正确', () => {
      wrapper.vm.config.useBrackets = true
      wrapper.vm.config.termCount = '3'
      wrapper.vm.config.operations.add = true
      wrapper.vm.config.operations.subtract = true
      wrapper.vm.config.operations.multiply = false
      wrapper.vm.config.operations.divide = false
      
      // 手动测试一个特定的例子
      const numbers = [10, 5, 3]
      const operations = ['+', '-']
      const bracketPos = { start: 0, end: 1 }
      
      const result = wrapper.vm.calculateWithBrackets(numbers, operations, bracketPos)
      const expression = wrapper.vm.buildExpression(numbers, operations, bracketPos)
      
      expect(expression).toBe('(10 + 5) - 3')
      expect(result).toBe(12)
    })
  })
})
