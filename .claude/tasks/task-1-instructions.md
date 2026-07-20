# Task 1: 创建环境检测 composable (useExportEnv)

**Spec reference**: `docs/superpowers/specs/2025-07-20-pdf-print-optimization-design.md`

## 任务描述

创建环境检测模块，用于识别用户使用的浏览器环境（微信、移动端、桌面端），并检测浏览器特性支持情况（download、print、share 等）。

## 文件结构

- **Create**: `src/composables/useExportEnv.js` - 环境检测 composable
- **Create**: `src/composables/useExportEnv.test.js` - 单元测试

## 验收标准

1. ✅ 能正确识别微信浏览器（通过 MicroMessenger UA）
2. ✅ 能正确识别 UC/QQ/百度等主流移动浏览器
3. ✅ 能正确区分移动端和桌面端
4. ✅ 能检测浏览器特性（download、print、share 等）
5. ✅ 提供 computed helpers（isWechat、isMobile、isDesktop）
6. ✅ 所有单元测试通过

## 实现步骤

### Step 1: 编写测试用例

创建 `src/composables/useExportEnv.test.js`，包含以下测试场景：

- 检测桌面端 Chrome
- 检测微信浏览器
- 检测 UC 浏览器
- 检测 QQ 浏览器
- 检测 iOS Safari
- 验证 computed helpers（isWechat、isMobile、isDesktop）

**测试代码已提供在实现计划中**，请直接使用。

### Step 2: 创建实现文件

创建 `src/composables/useExportEnv.js`，实现以下功能：

- `detectPlatform()` - 检测平台和浏览器
- `detectFeatures()` - 检测浏览器特性
- `env` ref - 环境信息
- `isWechat/isMobile/isDesktop` computed - 便捷判断

**实现代码已提供在实现计划中**，请直接使用。

### Step 3: 运行测试

```bash
npx vitest run src/composables/useExportEnv.test.js
```

确保所有测试通过。

### Step 4: 提交

```bash
git add src/composables/useExportEnv.js src/composables/useExportEnv.test.js
git commit -m "feat(export): add environment detection module for WeChat/mobile/desktop"
```

## 注意事项

- User-Agent 检测是降级方案，优先通过特性检测判断
- 微信检测优先级最高，因为微信有特殊的限制
- 移动端检测需要覆盖 Android 和 iOS
- 确保测试代码可以运行（注意 mock navigator.userAgent 的方式）

## 完成标准

- [ ] 测试文件已创建
- [ ] 实现文件已创建
- [ ] 所有测试通过（`npx vitest run` 无失败）
- [ ] 代码已提交到 git

---

**请开始实现，完成后告诉我：**
1. 是否遇到问题
2. 测试结果
3. Git commit SHA
