# 小学数学问题生成器

一个基于 Vue 3 + Vite 的小学数学练习题生成工具，专为小学生数学练习设计，支持按年级、学期、题型、难度、知识点生成试卷，并提供预览、打印、PDF 导出功能。

## 🎯 功能特点

### 📊 灵活配置

- **年级与学期**：1–6 年级、上/下册共 12 套筛选
- **题型多选**：算术题 / 应用题 / 奥数题，可任意组合
- **难度控制**：简单 / 中等 / 困难（三级）
- **知识点筛选**：按年级动态加载的知识点标签（如 100 以内加减法、表内乘法、分数、小数、方程等）
- **答案呈现**：隐藏 / 题目后显示 / 单独答案页（三模式）
- **题量分配**：多题型时按题型分别指定题数；单题型时按总数自动均分
- **数字位数**：可为加、减、乘、除每种运算独立设置 1–3 位的数字位数
- **计算项个数**：2–4 项运算，支持复合运算
- **运算类型**：加法(+) / 减法(-) / 乘法(×) / 除法(÷)，可任意组合

### 📝 题目类型

- **算术题 — 求结果**：给出完整算式，求计算结果
  - 示例：`① 25 + 37 = ______`
- **算术题 — 求运算项**：给出结果，求缺失的数字
  - 示例：`② ______ + 37 = 62`
- **应用题**：3 个模板（购物 / 时间 / 比较）
  - 示例：`③ 小明买了3支铅笔，每支2元，一共花了多少钱？`
- **奥数题**：2 个模板（等差数列 / 简单逻辑）

### 💾 题库管理

- **本地题库**：基于 IndexedDB（Dexie）持久化
- **即时生成 + 缓存入库**：每次生成自动写入题库，下次可重复抽题
- **历史记录**：自动保存最近 20 份试卷，支持查看 / 删除

### 🎨 用户体验

- **答案切换**：一键显示/隐藏答案，方便教学和自测
- **响应式设计**：适配桌面和移动设备
- **三种导出方式**：
  - **桌面端 PDF**：通过 html2pdf.js 一键导出 A4 试卷
  - **移动端图片**：通过 html2canvas-pro 输出高清 PNG
  - **Web Share**：移动端可分享到微信/QQ 等应用

### 🖨️ 打印功能

- **一键打印**：优化的 A4 排版
- **自动隐藏**：打印时自动隐藏配置面板和按钮
- **答案单独页**：分页打印题目与答案
- **打印模式**：根据答案模式自动切换 body class

## 🚀 快速开始

### 环境要求

- Node.js 16+
- npm 或 yarn

### 安装步骤

```bash
git clone https://github.com/dllen/PrimarySchoolMathematicsGenerator.git
cd PrimarySchoolMathematicsGenerator
npm install
npm run dev
```

打开浏览器访问 `http://localhost:5000`

### 可用脚本

| 脚本 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发服务器（端口 5000，HMR） |
| `npm run build` | 生产构建到 `dist/` |
| `npm run preview` | 本地预览生产构建 |
| `npm run deploy` | 构建 + 发布到 GitHub Pages（需配置） |
| `npm test` | 启动 Vitest watch 模式 |
| `npm run test:run` | 单次运行所有单元测试（CI 友好） |
| `npm run test:ui` | 启动 Vitest Web UI |

## 📖 使用指南

### 基本操作

1. **配置参数**：年级、学期、题型、难度、知识点、答案模式等
2. **生成题目**：点击"生成题目"按钮，系统按配置生成练习题
3. **查看答案**：
   - 「不显示」：默认，仅题目
   - 「题目后显示」：答案紧随每题
   - 「单独答案页」：答案在另一页
4. **打印 / 导出**：
   - 桌面端：点击「打印题目」调用浏览器打印，或「导出 PDF」生成 A4 PDF
   - 移动端：点击「下载图片」保存 PNG，或「分享题目」调用 Web Share API

### 智能算法

- **除法处理**：自动确保整除，避免小数结果
- **减法处理**：确保结果为正数，符合小学数学要求
- **随机分布**：运算项位置随机隐藏，增加练习难度
- **应用题答案一致性**：每个应用题模板的 `answer` 与 `payload` 变量计算结果一致（由测试断言）

## 🛠️ 技术栈

- **前端框架**：Vue 3（Composition API + `<script setup>`）
- **构建工具**：Vite 4
- **测试**：Vitest（单元）+ Cypress（e2e）
- **本地存储**：Dexie 4（IndexedDB）
- **PDF 导出**：html2pdf.js（jsPDF + html2canvas 组合）
- **图片导出**：html2canvas-pro
- **样式**：原生 CSS + 响应式设计 + `@media print`
- **部署**：GitHub Pages（通过 GitHub Actions）

## 📁 项目结构

```
PrimarySchoolMathematicsGenerator/
├── .github/
│   └── workflows/
│       └── deploy.yml               # GitHub Pages 自动部署
├── cypress/
│   └── e2e/                          # 端到端测试
│       ├── generator.cy.js           # 配置 → 生成 → 预览 → PDF
│       ├── history.cy.js             # 历史记录 CRUD
│       └── mobile.cy.js              # 移动端图片/Web Share
├── docs/
│   └── superpowers/                  # 设计与实施文档
│       ├── specs/                    # 设计规范
│       └── plans/                    # 实施计划
├── public/                           # 静态资源
├── src/
│   ├── App.vue                       # 主应用（Composition API，~210 行）
│   ├── main.js                       # 应用入口
│   ├── style.css                     # 全局样式（含 @media print）
│   ├── db.js                         # Dexie v2 schema（problemSets + problemLibrary）
│   ├── constants/                    # 枚举与字典
│   │   ├── options.js                #   年级/学期/题型/难度/答案模式
│   │   └── knowledgePoints.js        #   按年级组织的知识点
│   ├── utils/
│   │   └── rng.js                    # 可种子化的 Mulberry32 PRNG
│   ├── strategies/                   # 题目生成策略
│   │   ├── ProblemGeneratorStrategy.js   #   抽象基类
│   │   ├── ResultProblemStrategy.js      #   算术题 — 求结果
│   │   ├── OperandProblemStrategy.js     #   算术题 — 求运算项
│   │   ├── ArithmeticStrategy.js         #   算术题编排（包装器）
│   │   ├── ApplicationStrategy.js        #   应用题
│   │   ├── OlympiadStrategy.js           #   奥数题
│   │   └── ProblemGeneratorFactory.js    #   工厂 + 上下文
│   ├── problemTemplates/             # 应用题/奥数题模板
│   │   ├── shopping.js               #   购物
│   │   ├── time.js                   #   时间
│   │   ├── comparison.js             #   比较
│   │   ├── sequence.js               #   等差数列
│   │   ├── logic.js                  #   简单逻辑
│   │   └── index.js                  #   注册中心
│   ├── composables/                  # Vue 3 组合式函数
│   │   ├── useProblemLibrary.js      #   题库 CRUD 封装
│   │   ├── useProblemGenerator.js    #   多类型编排 + 去重 + 缓存入库
│   │   ├── usePdfExport.js           #   html2pdf.js 封装
│   │   └── usePrint.js               #   window.print 封装
│   └── components/                   # Vue 组件
│       ├── ConfigPanel.vue           #   配置面板聚合
│       ├── ActionBar.vue             #   操作按钮栏
│       ├── ProblemGrid.vue           #   题目网格
│       ├── AnswerPage.vue            #   答案单独页
│       ├── HistoryList.vue           #   历史列表
│       ├── HistoryDetail.vue         #   历史详情
│       └── config/                   #   ConfigPanel 子组件
│           ├── GradeSemesterPicker.vue
│           ├── QuestionTypePicker.vue
│           ├── DifficultyPicker.vue
│           ├── KnowledgePointPicker.vue
│           ├── AnswerModePicker.vue
│           └── CompositionEditor.vue
├── deploy.sh                         # 手动部署脚本（备用）
├── cypress.config.js                 # Cypress 配置（baseUrl 支持 CYPRESS_baseUrl 覆盖）
├── vite.config.js                    # Vite 配置（port 5000, base 路径可切换）
├── vitest.config.js                  # Vitest 配置
└── package.json
```

## 🧑‍💻 开发

### 工作流

1. **创建功能分支**：`git checkout -b feature/<name>`
2. **开发**：在 `src/` 下编辑，按 TDD 流程（先写测试，再实现）
3. **本地验证**：
   ```bash
   npm run test:run          # 单元测试
   npm run build             # 生产构建（确认无语法错误）
   npm run dev               # 浏览器手动验证
   ```
4. **E2E 验证**（修改 UI 时）：
   ```bash
   npx vite --port 5183 &                                # 备用端口（避免 5000 冲突）
   CYPRESS_baseUrl=http://localhost:5183 npx cypress run
   ```
   注意：默认 `cypress.config.js` baseUrl 是 `http://localhost:5000`，可通过 `CYPRESS_baseUrl` 环境变量覆盖。
5. **提交 & PR**：`git commit -m "feat: ..."` 后推送并创建 PR

### 测试

#### 单元测试（Vitest）

- **位置**：每个被测文件旁的 `*.test.js`
- **覆盖**：constants / utils / strategies / problemTemplates / composables / db
- **运行**：`npm run test:run`（一次性）或 `npm test`（watch）
- **环境**：jsdom + fake-indexeddb（用于 Dexie 测试）

#### 端到端测试（Cypress）

- **位置**：`cypress/e2e/*.cy.js`
- **覆盖**：generator 流程、history CRUD、mobile 行为
- **运行**：`npx cypress run`（headless）或 `npx cypress open`（交互）
- **依赖**：需先启动 dev server

### 代码组织约定

- **策略 + 模板**：新题型实现两个策略类 + 一个模板，模板按 `gradeRange` 自动过滤
- **Composable**：横向能力（生成/导出/打印）封装为 composable，组件通过 props/emit 与之交互
- **Vue 组件**：使用 `<script setup>` + scoped 样式
- **不修改既有策略**：扩展功能时优先包装（`ArithmeticStrategy` 包装 `Result/OperandProblemStrategy`），不破坏现有契约
- **Dexie 写入前必须 `JSON.parse(JSON.stringify(...))`**：Vue Proxy 对象无法 `structuredClone`，会被 IndexedDB 静默丢弃

### 调试技巧

- **题目未生成？** 打开浏览器 DevTools → Application → IndexedDB → `MathProblemsHistory` 检查 `problemLibrary` 表
- **PDF 导出失败？** 检查 html2pdf.js 加载（控制台 404 提示）。桌面端才支持 PDF
- **移动端布局异常？** 通过 DevTools 设备模拟 + `Object.defineProperty(navigator, 'userAgent', ...)` 切到 iPhone UA 验证
- **打印效果差？** DevTools → Rendering → Emulate CSS media type: print 预览

## 🚀 部署

### 方式一：GitHub Actions 自动部署（推荐）

仓库已配置 `.github/workflows/deploy.yml`：推送到 `main` 分支即触发自动构建并发布到 GitHub Pages。

**启用步骤**：

1. 进入 GitHub 仓库 → Settings → Pages
2. Source 选择 **GitHub Actions**
3. 后续 push 到 `main` 自动部署

**部署产物**：`.github/workflows/deploy.yml` 通过 `peaceiris/actions-gh-pages@v3` 发布 `dist/`

### 方式二：手动部署

```bash
# 构建生产版本
npm run build

# 发布到 GitHub Pages（需在 package.json 中配置 homepage）
npm run deploy
```

`npm run deploy` 等价于 `npm run build && gh-pages -d dist`。

### 方式三：自定义子路径部署

`vite.config.js` 通过 `process.env.NODE_ENV` 判断 base：

```js
base: process.env.NODE_ENV === 'production' ? '/PrimarySchoolMathematicsGenerator/' : '/'
```

若部署到自定义域名或子路径，修改 `base` 为对应路径：

```js
base: '/your-subpath/'
```

### 方式四：本地预览生产构建

```bash
npm run build
npm run preview
```

预览服务器默认端口 4173。

### 部署到其他静态托管

`npm run build` 产物在 `dist/`，可直接上传到任何静态托管服务（Netlify / Vercel / Cloudflare Pages / Nginx 等）。注意：

- **SPA 路由**：纯静态导出，所有路由由 `index.html` 处理（项目无路由可忽略）
- **Base 路径**：非根域名部署需修改 `vite.config.js` 中的 `base`
- **跨域**：纯前端项目，无后端调用

## 🌐 在线体验

GitHub Pages 在线版本：[https://dllen.github.io/PrimarySchoolMathematicsGenerator/](https://dllen.github.io/PrimarySchoolMathematicsGenerator/)

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来改进项目！

1. Fork 项目
2. 创建特性分支（`git checkout -b feature/AmazingFeature`）
3. 提交更改（`git commit -m 'feat: add some feature'`）
4. 推送到分支（`git push origin feature/AmazingFeature`）
5. 开启 Pull Request

**PR 检查清单**：

- [ ] `npm run test:run` 全绿
- [ ] `npm run build` 成功
- [ ] 修改 UI 时附 e2e 测试
- [ ] 提交信息遵循 Conventional Commits（`feat:` / `fix:` / `docs:` / `refactor:` 等）

## 📄 许可证

本项目采用 MIT 许可证 - 查看 `LICENSE` 文件了解详情。

## 📞 联系方式

如有问题或建议，请通过提交 [Issue](../../issues) 联系。

---

**让数学学习更简单，让练习生成更高效！** 🎓✨