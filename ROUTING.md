# 路由实现说明

## 概述

项目已成功集成 **Vue Router 4**，实现了基于 URL 的路由跳转和浏览器历史记录支持。

## 路由配置

### 路由表 (`src/router/index.js`)

```javascript
const routes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/generator', name: 'Generator', component: GeneratorView },
  { path: '/quick-start', name: 'QuickStart', component: QuickStartView },
  { path: '/history', name: 'History', component: HistoryView },
  { path: '/history/:id', name: 'HistoryDetail', component: HistoryDetailView }
]
```

### 路由功能特性

1. **路由跳转**
   - 使用 `router.push()` 进行编程式导航
   - 支持浏览器前进/后退按钮
   - 支持 URL 直接访问（如 `/history`）

2. **滚动行为**
   - 切换路由时自动滚动到顶部
   - 支持浏览器返回时的位置恢复

3. **视图组件**
   - `HomePage` - 首页（三个菜单入口）
   - `GeneratorView` - 题目生成器
   - `QuickStartView` - 快速开始
   - `HistoryView` - 历史记录列表
   - `HistoryDetailView` - 历史记录详情

## 导航方式

### 1. 编程式导航

```javascript
import { useRouter } from 'vue-router'

const router = useRouter()

// 跳转到生成器
router.push('/generator')

// 跳转到历史记录
router.push('/history')

// 带参数的跳转
router.push(`/history/${item.id}`)
```

### 2. 返回按钮实现

所有子页面都添加了"返回首页"按钮：

```vue
<template>
  <div class="page">
    <div class="nav-header">
      <button class="back-btn" @click="$router.push('/')">
        ← 返回首页
      </button>
    </div>
    <!-- 页面内容 -->
  </div>
</template>
```

### 3. 浏览器支持

- ✅ 点击浏览器"后退"按钮返回上一页
- ✅ 点击浏览器"前进"按钮前进
- ✅ URL 栏显示当前路由
- ✅ 支持 Ctrl/Cmd + 点击在新标签页打开
- ✅ 支持书签保存和分享

## 技术栈

- **Vue Router**: ^4.x
- **Vue 3**: Composition API
- **Vite**: ^4.x

## 迁移说明

### 改造前（条件渲染）

```javascript
// App.vue 使用 viewMode 控制显示
const viewMode = ref('home')

// 导航通过 emit 事件
<HomePage @navigate="handleNavigation" />
```

### 改造后（路由系统）

```javascript
// App.vue 使用 router-view
<router-view />

// 导航通过 Vue Router
router.push('/generator')
```

## 文件结构

```
src/
├── App.vue                      # 根组件（仅包含 router-view）
├── main.js                      # 引入 router
├── router/
│   └── index.js                 # 路由配置
└── views/
    ├── GeneratorView.vue        # 题目生成器视图
    ├── QuickStartView.vue       # 快速开始视图
    ├── HistoryView.vue          # 历史记录视图
    └── HistoryDetailView.vue    # 历史详情视图
```

## 启动应用

```bash
# 开发模式（端口 5000）
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 浏览器访问

- **开发环境**: http://localhost:5000
- **首页**: http://localhost:5000/
- **生成器**: http://localhost:5000/generator
- **快速开始**: http://localhost:5000/quick-start
- **历史记录**: http://localhost:5000/history
- **历史详情**: http://localhost:5000/history/123

## 优势

✅ **用户友好**: 浏览器后退/前进按钮直接可用
✅ **SEO 友好**: 每个页面有独立的 URL
✅ **状态保持**: 页面刷新不丢失导航状态
✅ **可分享**: 支持 URL 直接访问和分享
✅ **可维护**: 路由配置集中管理，扩展性强
