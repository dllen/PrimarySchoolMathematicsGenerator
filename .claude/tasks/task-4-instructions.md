# Task 4: 创建导出预览组件 (ExportPreview)

**Spec reference**: `docs/superpowers/specs/2025-07-20-pdf-print-optimization-design.md`

## 任务描述

创建统一的导出预览组件，展示导出结果（图片或 PDF），并提供操作引导和按钮。

## 文件结构

- **Create**: `src/components/ExportPreview.vue` - 预览组件
- **Create**: `src/components/ExportPreview.test.js` - 组件测试

## 验收标准

1. ✅ 支持图片和 PDF 两种预览类型
2. ✅ 微信用户显示长按保存引导
3. ✅ 移动端用户显示保存引导
4. ✅ 桌面端显示保存/分享/打印按钮
5. ✅ 响应式设计（移动端全屏）
6. ✅ 关闭按钮和点击遮罩关闭
7. ✅ 组件测试覆盖主要场景

## 实现步骤

### Step 1: 创建 ExportPreview.vue

**Props**:
```javascript
{
  visible: { type: Boolean, default: false },
  type: { type: String, default: 'image' },  // 'image' | 'pdf'
  previewData: { 
    type: Object, 
    default: null,
    // { url, filename, blob } for image
    // { url, filename, blob } for pdf
  },
  env: { 
    type: Object, 
    required: true  // 来自 useExportEnv
  }
}
```

**Emits**:
```javascript
['close', 'save', 'share', 'print', 'download-pdf']
```

**UI 结构**:
```vue
<div class="export-preview-overlay" @click.self="close">
  <div class="export-preview-dialog">
    <!-- 标题 -->
    <div class="dialog-header">
      <h3>📄 {{ title }}</h3>
      <button class="close-btn" @click="close">✕</button>
    </div>
    
    <!-- 预览区域 -->
    <div class="preview-scroll">
      <img v-if="type === 'image'" :src="previewData.url" class="preview-image" />
      <iframe v-else :src="previewData.url" class="pdf-frame" />
    </div>
    
    <!-- 引导文字 -->
    <div class="guide-text">
      <!-- 微信引导 -->
      <div v-if="env.browser === 'wechat'" class="guide-item wechat">
        <span class="guide-icon">💡</span>
        <div class="guide-content">
          <strong>微信用户操作指南：</strong>
          <ol>
            <li>长按上方图片</li>
            <li>点击"保存到相册"</li>
            <li>可转发给老师或打印</li>
          </ol>
        </div>
      </div>
      
      <!-- 移动端引导 -->
      <div v-else-if="env.platform === 'mobile'" class="guide-item mobile">
        <p>长按上方图片保存到相册</p>
      </div>
      
      <!-- 桌面端引导 -->
      <div v-else class="guide-item desktop">
        <p>可以右键"图片另存为"保存</p>
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="action-buttons">
      <button v-if="type === 'image' && env.platform !== 'mobile'" @click="$emit('save')">
        💾 保存图片
      </button>
      
      <button v-if="type === 'pdf'" @click="$emit('download-pdf')">
        📥 下载 PDF
      </button>
      
      <button v-if="env.features.share" @click="$emit('share')">
        📤 分享
      </button>
      
      <button v-if="env.features.print" @click="$emit('print')">
        🖨️ 打印
      </button>
      
      <button @click="close">关闭</button>
    </div>
  </div>
</div>
```

**样式要点**:
- 遮罩层：`position: fixed; background: rgba(0,0,0,0.8); z-index: 9999`
- 对话框：`max-width: 600px; max-height: 95vh; border-radius: 16px`
- 图片：`width: 100%; border-radius: 8px`
- PDF iframe：`height: 500px`
- 移动端：`width: 100%; max-height: 100vh; border-radius: 0`

**完整样式代码已提供在实现计划文档中**，请直接使用。

### Step 2: 编写组件测试

创建 `src/components/ExportPreview.test.js`，测试场景：

- 组件渲染（visible=true）
- 微信用户显示特殊引导
- 点击关闭按钮触发 close 事件
- 图片类型显示 img 标签
- PDF 类型显示 iframe
- 桌面端显示"保存图片"按钮
- 移动端不显示"保存图片"按钮

**测试代码已在计划文档中提供**，请直接使用（注意语法调整）。

### Step 3: 运行测试

```bash
npx vitest run src/components/ExportPreview.test.js
```

Expected: 所有测试通过

### Step 4: 提交

```bash
git add src/components/ExportPreview.vue src/components/ExportPreview.test.js
git commit -m "feat(ui): add export preview component with user guidance"
```

## 注意事项

- 使用 `@click.self` 实现点击遮罩关闭
- 微信引导使用绿色背景（#07c160）
- 移动端对话框全屏显示
- 预览关闭时通过事件通知父组件释放 Blob URL

## 完成标准

- [ ] ExportPreview.vue 已创建
- [ ] ExportPreview.test.js 已创建
- [ ] 所有测试通过
- [ ] 代码已提交

---

**请开始实现，完成后告诉我结果和 Git SHA**
