# Task 7: 添加导出配置选项

**Spec reference**: `docs/superpowers/specs/2025-07-20-pdf-print-optimization-design.md`

## 任务描述

在配置面板中添加打印布局选项（2/3/4 列），让用户自定义导出时的排版布局。

## 文件结构

- **Modify**: `src/views/GeneratorView.vue` - 添加配置项到 config
- **Modify**: `src/components/config/ConfigPanel.vue` 或 `ConfigWizard.vue` - 添加 UI 控件

## 验收标准

1. ✅ 在 config 中添加 `export.pdfColumns` 配置项
2. ✅ 在配置面板中添加"打印布局"选择器
3. ✅ 选项：2 列（宽松）、3 列（标准）、4 列（紧凑）
4. ✅ 将配置应用到 CSS 变量
5. ✅ 手动测试验证列数生效

## 实现步骤

### Step 1: 修改 GeneratorView.vue - 添加配置

在 `config` ref 中添加导出配置：

```javascript
const config = ref({
  // ... 现有配置 ...
  
  // 新增：导出配置
  export: {
    pdfColumns: 3,  // PDF 列数：2 | 3 | 4
    imageQuality: 'high'  // 图片质量：low | medium | high
  }
});
```

### Step 2: 修改 ConfigPanel.vue - 添加 UI

**选项 A: 在 ConfigPanel.vue 中添加**

找到"高级设置"部分，添加：

```vue
<ConfigItem>
  <label>打印布局</label>
  <select v-model="config.export.pdfColumns" class="config-select">
    <option :value="2">2 列（宽松）</option>
    <option :value="3">3 列（标准）</option>
    <option :value="4">4 列（紧凑）</option>
  </select>
  <small class="config-hint">导出 PDF 时的题目列数</small>
</ConfigItem>
```

**选项 B: 如果 ConfigPanel 结构复杂，考虑使用 ConfigWizard**

如果 ConfigPanel 太复杂，可以在 ConfigWizard 的"高级设置"步骤中添加。

### Step 3: 应用配置到导出

在 `handleExport` 函数中应用列数配置：

```javascript
async function handleExport() {
  if (!printRoot.value) {
    warning('无法导出', '请先生成题目');
    return;
  }

  // 应用打印布局配置到 CSS 变量
  const columns = config.value.export?.pdfColumns || 3;
  document.documentElement.style.setProperty('--print-columns', columns);

  await enhancedExport.smartExport({
    element: printRoot.value,
    config: config.value
  });
}
```

**或者**在 `smartExport` 调用前设置：

```javascript
// 在 smartExport 调用前
const columns = config.value.export?.pdfColumns || 3;
document.documentElement.style.setProperty('--print-columns', columns);
```

### Step 4: 添加样式

在 `src/style.css` 中添加（如果还没有）：

```css
/* 配置选择器样式 */
.config-select {
  padding: 8px 12px;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  min-width: 150px;
}

.config-hint {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #888;
  font-weight: normal;
}
```

### Step 5: 测试配置项

```bash
npm run dev
```

**测试场景**:
1. 选择 2 列 → 生成题目 → 导出 → 打印预览验证 2 列
2. 选择 3 列 → 生成题目 → 导出 → 打印预览验证 3 列
3. 选择 4 列 → 生成题目 → 导出 → 打印预览验证 4 列
4. 刷新页面 → 验证配置是否保留（可选：需要添加持久化）

### Step 6: 提交

```bash
git add src/views/GeneratorView.vue src/components/config/ConfigPanel.vue src/style.css
git commit -m "feat(config): add print layout configuration (2/3/4 columns)"
```

## 注意事项

- ConfigPanel 的具体结构需要查看实际代码
- 如果 ConfigPanel 太复杂，优先选择 ConfigWizard
- 确保 v-model 绑定正确
- 可以后续添加配置持久化（localStorage）

## 完成标准

- [ ] config 中添加了 export 配置
- [ ] UI 中添加了打印布局选择器
- [ ] CSS 变量已应用
- [ ] 手动测试通过
- [ ] 代码已提交

---

**请开始实现，完成后告诉我结果和 Git SHA**
