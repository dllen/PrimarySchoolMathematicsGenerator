#!/usr/bin/env node

/**
 * 策略模式单元测试运行脚本
 * 
 * 使用方法:
 * npm test -- tests/strategies
 * 或者
 * node tests/strategies/run-tests.js
 */

import { execSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');

console.log('🧪 运行策略模式单元测试...\n');

try {
  // 运行策略相关的测试
  const testCommand = 'npx vitest run tests/strategies --reporter=verbose';
  
  console.log(`执行命令: ${testCommand}\n`);
  
  const output = execSync(testCommand, {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: 'inherit'
  });
  
  console.log('\n✅ 所有策略模式测试完成！');
  
} catch (error) {
  console.error('\n❌ 测试执行失败:');
  console.error(error.message);
  process.exit(1);
}