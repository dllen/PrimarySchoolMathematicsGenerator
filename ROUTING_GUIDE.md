# 路由功能使用指南

## 快速开始

### 1. 启动开发服务器

```bash
npm run dev
```

服务器将运行在: **http://localhost:5000**

### 2. 打开浏览器

访问: http://localhost:5000

## 路由说明

### 可用路由

| 路由 | 路径 | 描述 |
|------|------|------|
| 首页 | `/` | 三个菜单入口 |
| 生成器 | `/generator` | 自定义配置生成题目 |
| 快速开始 | `/quick-start` | 使用预设一键生成 |
| 历史记录 | `/history` | 查看历史试卷列表 |
| 历史详情 | `/history/:id` | 查看特定试卷详情 |

### 使用方法

#### 从首页导航

1. 打开 http://localhost:5000
2. 点击三个菜单卡片之一：
   - **⚡ 快速开始** → 跳转到 `/quick-start`
   - **📝 生成题目** → 跳转到 `/generator`
   - **📚 查看历史** → 跳转到 `/history`

#### 在页面间导航

每个页面都提供两种导航方式：

1. **点击菜单按钮**
2. **使用浏览器按钮**:
   - ← 后退按钮
   - → 前进按钮
3. **直接输入 URL**:
   ```
   http://localhost:5000/history
   http://localhost:5000/generator
   ```

#### 返回功能

所有子页面都有 **"← 返回首页"** 按钮，点击即可返回首页。

## 功能演示

### 场景 1: 生成题目

```
1. 访问 http://localhost:5000/
2. 点击 "生成题目" 卡片
3. → 自动跳转到 /generator
4. 配置参数，点击"生成题目"
5. 点击 "← 返回首页" 或浏览器后退
6. → 返回首页
```

### 场景 2: 查看历史

```
1. 访问 http://localhost:5000/
2. 点击 "查看历史" 卡片
3. → 自动跳转到 /history
4. 点击某个历史记录
5. → 跳转到 /history/:id
6. 点击 "← 返回首页"
7. → 返回首页
```

### 场景 3: 快速开始

```
1. 访问 http://localhost:5000/
2. 点击 "快速开始"
3. → 自动跳转到 /quick-start
4. 选择预设配置
5. → 自动跳转到 /generator
6. 点击浏览器后退
7. → 返回 /quick-start
8. 点击浏览器后退
9. → 返回首页
```

## 浏览器支持

- ✅ Chrome / Edge (推荐)
- ✅ Firefox
- ✅ Safari
- ✅ 移动端浏览器

## 技术特性

### 路由特性

- ✅ 基于 URL 的路由系统
- ✅ 浏览器历史记录集成
- ✅ 前进/后退按钮支持
- ✅ URL 书签可分享
- ✅ 页面滚动到顶部（切换路由时）
- ✅ 懒加载视图组件

### 开发特性

- ✅ 热模块替换 (HMR)
- ✅ 详细的错误信息
- ✅ TypeScript 支持（可选）

## 常见问题

### Q: 如何修改端口？

```bash
npm run dev -- --port 8080
```

### Q: 如何查看路由配置？

打开 `src/router/index.js` 文件。

### Q: 如何添加新页面？

1. 创建视图组件: `src/views/NewView.vue`
2. 在 `src/router/index.js` 添加路由:

```javascript
{
  path: '/new-path',
  name: 'NewView',
  component: () => import('../views/NewView.vue')
}
```

3. 在需要导航的地方使用:

```vue
<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
router.push('/new-path')
</script>
```

### Q: 如何传递参数？

```javascript
// 带查询参数
router.push({ path: '/history', query: { id: 123 } })

// 带路由参数
router.push(`/history/${id}`)
```

## 项目结构

```
PrimarySchoolMathematicsGenerator/
├── src/
│   ├── App.vue                    # 根组件
│   ├── main.js                    # 入口文件
│   ├── router/
│   │   └── index.js               # 路由配置 ⭐
│   ├── views/                     # 页面组件 ⭐
│   │   ├── GeneratorView.vue
│   │   ├── QuickStartView.vue
│   │   ├── HistoryView.vue
│   │   └── HistoryDetailView.vue
│   ├── components/                # 公共组件
│   │   ├── HomePage.vue
│   │   ├── ConfigPanel.vue
│   │   └── ...
│   ├── composables/               # 组合式函数
│   └── db.js                      # 数据库
└── package.json
```

## 参考文档

- [Vue Router 官方文档](https://router.vuejs.org/zh/)
- [Vue 3 文档](https://cn.vuejs.org/)
- [Vite 文档](https://cn.vitejs.dev/)

## 更新日志

### v2.0.0 (2025-07-20)
- ✅ 集成 Vue Router 4
- ✅ 实现基于 URL 的路由系统
- ✅ 添加浏览器历史记录支持
- ✅ 添加返回按钮
- ✅ 优化页面滚动行为
- ✅ 实现组件懒加载
