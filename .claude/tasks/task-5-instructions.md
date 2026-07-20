# Task 5: 集成到 GeneratorView

**Spec reference**: `docs/superpowers/specs/2025-07-20-pdf-print-optimization-design.md`

## 任务描述

将增强型导出模块集成到 GeneratorView.vue，替换原有的 PDF/图片导出逻辑。

## 文件结构

- **Modify**: `src/views/GeneratorView.vue`
- **Modify**: `src/components/ActionBar.vue`

**已有模块**:
- ✅ `src/composables/useEnhancedExport.js` (Task 3)
- ✅ `src/components/ExportPreview.vue` (Task 4)
- ✅ `src/composables/useExportEnv.js` (Task 1)

## 验收标准

1. ✅ GeneratorView 集成 useEnhancedExport
2. ✅ 添加 `handleExport` 函数调用 `smartExport`
3. ✅ ActionBar 的导出按钮调用 `handleExport`
4. ✅ 在 GeneratorView 中渲染 ExportPreview 组件
5. ✅ 导出按钮显示加载状态
6. ✅ 移动端按钮文案改为"导出"
7. ✅ 手动测试通过

## 实现步骤

### Step 1: 修改 GeneratorView.vue - Script

在 `<script>` 部分：

**1.1 添加 import**:

```javascript
import { useEnhancedExport } from '../composables/useEnhancedExport.js';
import ExportPreview from '../components/ExportPreview.vue';
```

**1.2 在 setup() 中初始化**:

```javascript
setup() {
  // ... 现有代码 ...
  
  // 新增：增强型导出
  const enhancedExport = useEnhancedExport();
  
  // 导出处理函数
  async function handleExport() {
    if (!printRoot.value) {
      warning('无法导出', '请先生成题目');
      return;
    }
    
    await enhancedExport.smartExport({
      element: printRoot.value,
      config: config.value
    });
  }
  
  return {
    // ... 现有返回值 ...
    ...enhancedExport,  // 展开所有导出相关状态和方法
    handleExport,
    printRoot
  };
}
```

### Step 2: 修改 GeneratorView.vue - Template

**2.1 修改 ActionBar 的导出按钮**:

找到 ActionBar 组件，修改导出按钮：

```vue
<ActionBar
  :problems="problems"
  :is-mobile="isMobile"
  @generate="generateProblems"
  @show-history="handleShowHistory"
  @export="handleExport"  <!-- 修改事件名 -->
  @share="handleShare"
/>
```

**2.2 添加 ExportPreview 组件**:

在 template 末尾（`</template>` 前）添加：

```vue
<!-- 导出预览组件 -->
<ExportPreview
  :visible="previewVisible"
  :type="previewType"
  :preview-data="previewData"
  :env="env"
  @close="closePreview"
  @save="saveImage"
  @share="handleShare"
  @print="handlePrint"
  @download-pdf="downloadPdf"
/>
```

**2.3 注册 ExportPreview 组件**:

```javascript
components: {
  // ... 现有组件 ...
  ExportPreview
}
```

### Step 3: 修改 ActionBar.vue

**3.1 修改 emits**:

```javascript
defineEmits(['generate', 'export', 'share', 'show-history']);
```

**3.2 修改导出按钮**:

```vue
<button
  class="btn btn-secondary"
  :disabled="!problems.length || exporting"
  @click="$emit('export')"
>
  {{ exporting ? '生成中...' : '导出' }}
</button>
```

删除 `desktop-only` 类，让移动端也能看到导出按钮。

### Step 4: 手动测试

```bash
npm run dev
```

**测试场景**:

1. **桌面端测试**:
   - 生成题目（20题）
   - 点击"导出"按钮
   - 验证：PDF 生成 → 预览弹窗显示 → 下载成功

2. **移动端模拟**:
   - 打开浏览器开发者工具
   - 切换到移动端模式（iPhone 12）
   - 刷新页面
   - 生成题目 → 点击"导出"
   - 验证：图片生成 → 预览弹窗显示 → 提示长按保存

3. **微信测试**（如果有条件）:
   - 在微信中打开
   - 生成题目 → 点击"导出"
   - 验证：图片预览 → 绿色引导 → 长按可保存

4. **降级测试**:
   - 故意让 PDF 生成失败
   - 验证：自动降级为图片模式

### Step 5: 提交

```bash
git add src/views/GeneratorView.vue src/components/ActionBar.vue
git commit -m "feat(export): integrate enhanced export module to GeneratorView"
```

## 注意事项

- 确保 `handleExport` 正确传递 `printRoot.value` 和 `config.value`
- ExportPreview 的 emits 要正确连接到 enhancedExport 的方法
- 移动端按钮文案改为"导出"（去掉"导出 PDF"）
- 添加 `exporting` 状态防止重复点击

## 完成标准

- [ ] GeneratorView.vue 已修改
- [ ] ActionBar.vue 已修改
- [ ] 手动测试通过
- [ ] 代码已提交

---

**请开始实现，完成后告诉我结果和 Git SHA**
