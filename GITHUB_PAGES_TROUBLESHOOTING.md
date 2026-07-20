# GitHub Pages 白屏问题完整解决方案

## 问题原因

GitHub Pages 白屏通常由以下原因导致：

### 1. **路由模式不匹配**（最常见）

**问题**: 使用 `createWebHistory()` 但未正确配置 404 重定向

**现状**:
- ✅ 已修复 `dist/404.html` 重定向脚本
- ✅ `vite.config.js` 的 `base` 配置正确

### 2. **资源路径错误**

**问题**: JavaScript/CSS 文件 404

**检查**:
- ✅ `dist/index.html` 资源路径正确：`/PrimarySchoolMathematicsGenerator/assets/...`
- ✅ `vite.config.js` base 配置：`/PrimarySchoolMathematicsGenerator/`

### 3. **JavaScript 运行时错误**

**问题**: 浏览器控制台有错误阻止渲染

**常见错误**:
- `Uncaught ReferenceError: process is not defined`
- `Uncaught TypeError: Cannot read property 'xxx' of undefined`
- CORS 错误

## 快速诊断步骤

### 步骤 1: 检查浏览器控制台

1. 打开你的 GitHub Pages 站点
2. 按 `F12` 打开开发者工具
3. 切换到 **Console** 标签
4. 刷新页面（Ctrl/Cmd + R）
5. **截图所有红色错误信息**

### 步骤 2: 检查 Network 标签

1. 切换到 **Network** 标签
2. 刷新页面
3. 筛选 "JS" 和 "CSS"
4. 检查是否有文件 **404** 或 **Failed**
5. **截图 Network 结果**

### 步骤 3: 检查 index.html

在 GitHub Pages 上右键 → "查看网页源代码"，检查：
- ✅ `<script>` 和 `<link>` 路径是否包含 `/PrimarySchoolMathematicsGenerator/`
- ✅ 文件列表是否完整

## 已修复的问题

### ✅ 修复 1: 404.html 重定向脚本

**问题**: 原脚本会导致路径重复

**原脚本**:
```javascript
const path = window.location.pathname.slice(1);
window.location.replace(
  window.location.origin +
  window.location.pathname.split('/')[1] +
  '/#/' + path
);
// 结果: /PrimarySchoolMathematicsGenerator/#/PrimarySchoolMathematicsGenerator/generator ❌
```

**修复后**:
```javascript
(function() {
  const path = window.location.pathname;
  const pathParts = path.split('/').filter(Boolean);

  if (pathParts.length > 1) {
    const repoName = pathParts[0];
    const remainingPath = '/' + pathParts.slice(1).join('/');
    window.location.replace(
      window.location.origin + '/' + repoName + '/#/' + remainingPath
    );
  }
})();
// 结果: /PrimarySchoolMathematicsGenerator/#/generator ✅
```

### ✅ 修复 2: dist/404.html 已更新

新的 404.html 已包含修复后的重定向逻辑。

## 部署步骤

### 方法 1: 使用 npm run deploy（推荐）

```bash
# 1. 确保 gh-pages 已安装
npm install --save-dev gh-pages

# 2. 构建
npm run build

# 3. 部署
npm run deploy
```

### 方法 2: 手动部署

```bash
# 1. 构建
npm run build

# 2. 安装 gh-pages（如果未安装）
npm install -g gh-pages

# 3. 部署
gh-pages -d dist
```

### 方法 3: 使用 git push（不推荐，会污染 main 分支）

```bash
# 不要这样做！应该使用 gh-pages 分支
```

## 验证部署

### 在本地测试

```bash
# 使用 serve 或 http-server 模拟 GitHub Pages
npx serve dist -p 5000

# 或使用 Python
python3 -m http.server 5000 --directory dist

# 访问 http://localhost:5000
```

### 测试路由

```
http://localhost:5000/                    # 应该显示首页
http://localhost:5000/generator           # 应该显示生成器
http://localhost:5000/history             # 应该显示历史记录
```

**刷新每个页面**，检查是否仍然显示（不是 404）。

## 常见问题排查

### Q1: 仍然白屏

**检查清单**:

- [ ] GitHub Pages 是否部署成功？
  - 访问 `https://github.com/dllen/PrimarySchoolMathematicsGenerator/deployments`
  - 检查最新的部署状态

- [ ] 是否等待了 1-2 分钟？（GitHub Pages 有延迟）

- [ ] 尝试硬刷新（Ctrl/Cmd + Shift + R）或清除缓存

- [ ] 尝试无痕模式

- [ ] 检查是否启用了 GitHub Pages 的 "Enforce HTTPS"？

### Q2: 某些路由 404

**原因**: 404.html 重定向失败

**解决**: 手动访问 `https://你的用户名.github.io/PrimarySchoolMathematicsGenerator/#/`

如果这样可以访问，说明重定向有问题。

### Q3: JavaScript 加载失败

**检查**:
```bash
# 在浏览器中打开
view-source:https://dllen.github.io/PrimarySchoolMathematicsGenerator/

# 查找 <script> 标签，确认路径是否正确
```

**可能原因**:
- GitHub Pages 使用 HTTPS，但资源使用 HTTP
- 资源路径拼写错误
- 文件未上传到 GitHub

### Q4: 刷新页面丢失状态

**原因**: Vue Router history 模式需要服务器配置

**解决**: 确保 404.html 存在且重定向正确

## 高级排查

### 查看 GitHub Pages 日志

1. 进入仓库 Settings → Pages
2. 查看部署日志
3. 查找 "Build failed" 或错误信息

### 使用 GitHub Actions（推荐）

创建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

这个方案更可靠，有详细的日志输出。

## 临时解决方案

如果急需上线，可以临时切换为 Hash 模式：

```javascript
// src/router/index.js
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),  // 改用 Hash 模式
  routes
})
```

**优点**:
- ✅ 无需 404.html
- ✅ 部署更简单
- ✅ 100% 兼容 GitHub Pages

**缺点**:
- ❌ URL 带有 `#`（如 `/#/generator`）
- ❌ 不如 History 模式美观

## 推荐方案

**短期**: 修复 404.html 重定向（已完成）

**长期**: 迁移到 GitHub Actions 部署，有更好的日志和可靠性

## 检查清单

部署前检查:
- [x] `npm run build` 成功
- [x] `dist/` 目录包含所有文件
- [x] `dist/index.html` 路径正确
- [x] `dist/404.html` 重定向脚本正确
- [x] `vite.config.js` base 配置正确
- [x] `package.json` deploy 脚本正确
- [ ] GitHub Pages 已启用
- [ ] gh-pages 包已安装
- [ ] 已等待 2 分钟后测试

部署后检查:
- [ ] 首页能正常显示
- [ ] 所有路由能正常访问
- [ ] 刷新页面不白屏
- [ ] JavaScript 控制台无错误
- [ ] CSS 样式正常加载

---

**如果问题仍然存在，请提供**:
1. 浏览器 Console 截图
2. Network 标签截图
3. GitHub Pages 部署日志
4. 具体的错误信息
