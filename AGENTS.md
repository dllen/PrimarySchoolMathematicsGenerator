# Repository Guidelines

本仓库是 **PrimarySchoolMathematicsGenerator**（小学数学题目生成器），基于 Vue 3 + Vite 的纯前端单页应用，使用 IndexedDB（Dexie）持久化题库与历史记录，部署到 GitHub Pages。

## 项目结构与模块组织

- `src/` 应用源码
  - `views/` 路由页面（`HomePage`、`GeneratorView`、`HistoryView`、`QuickStartView`、`AboutView`）
  - `components/` 业务组件，按子域分子目录：`config/`、`workbench/`、`layout/`、`base/`
  - `strategies/` 题目生成策略（Strategy 模式）：`ArithmeticStrategy`、`ApplicationStrategy`、`OlympiadStrategy`、`ProblemGeneratorFactory` 等
  - `problemTemplates/` 题型模板（每个题型独立成文件，配套同名 `*.test.js`）
  - `composables/` Vue 3 组合式 API 钩子（导出、Toast、断点、配置向导等）
  - `router/` Vue Router 配置
  - `constants/`、`utils/`、`assets/`、`db.js`（Dexie 数据库定义）
- `tests/` 测试全局 setup（`fake-indexeddb`、fetch mock）
- `scripts/` Node 脚本：`build-library.mjs`、`preview-questions.mjs`
- `cypress/` 端到端测试与截图
- `dist/` 构建产物（提交已忽略，含 `.nojekyll`）

## 构建、测试与开发命令

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 启动 Vite 开发服务器（`0.0.0.0:5000`，固定端口） |
| `npm run build` | 生产构建到 `dist/`，并复制 `.nojekyll` |
| `npm run preview` | 本地预览构建产物 |
| `npm run deploy` | 构建并通过 `gh-pages` 发布到 GitHub Pages |
| `npm run build:library` | 构建预置题库（`scripts/build-library.mjs`） |
| `npm run preview:questions` | CLI 预览生成的题目 |
| `npm test` | Vitest 监听模式（开发期） |
| `npm run test:run` | Vitest 单次运行（CI 用） |
| `npm run test:ui` | Vitest 可视化界面 |

CI 在 `.github/workflows/deploy.yml`：Node 24、`npm install --omit=optional`、构建后上传 `dist/` 到 Pages。

## 编码风格与命名约定

- **模块系统**：ESM（`"type": "module"`），使用 `import`/`export`，文件后缀显式写 `.js`/`.vue`
- **缩进**：2 空格，无分号（沿用 Vite 默认风格）
- **命名**：
  - 组件：`PascalCase.vue`（如 `ConfigPanel.vue`）
  - 策略类：`PascalCase` + `Strategy` 后缀
  - 组合式 API：`useCamelCase.js`
  - 常量：`UPPER_SNAKE_CASE`
  - 测试文件：与被测文件同名 + `.test.js`，**与源码同目录**
- **样式**：Tailwind 工具类为主；自定义 token 集中在 `src/assets/styles/base.css`
- 本仓库**未配置 ESLint/Prettier**，提交前请自查一致性

## 测试指南

- **框架**：Vitest + jsdom，单元测试就近放在源码旁
- **端到端**：Cypress（`cypress/e2e` / `cypress/screenshots`）
- **覆盖率**：v8 provider，阈值 80%（branches / functions / lines / statements），配置在 `vitest.config.js`
- **全局 setup**：`tests/setup.js` 加载 `fake-indexeddb/auto`，`src/tests/setup-fetch-mock.js` mock `fetch`
- **命名**：测试块用 `describe` + 行为描述，`it('should ...')` 句式
- 新增题型或策略时**必须**同步提供 `*.test.js`，覆盖正常路径与边界

## 提交与 Pull Request 规范

- **Commit message** 遵循 [Conventional Commits](https://www.conventionalcommits.org/)：
  - 格式：`<type>(<scope>): <subject>`
  - 常用 `type`：`feat` / `fix` / `refactor` / `test` / `docs` / `chore`
  - 常用 `scope`：`templates` / `strategies` / `options` / `components` 等模块名
  - subject 使用祈使句、英文小写开头
- **PR 要求**：
  - 标题简明，正文说明改动动机与关键决策
  - 关联相关 issue 或 plan 编号（如 `Plan A Task 10`）
  - UI 改动附截图或录屏；导出/打印相关改动附样例 PDF 或图片
  - CI（GitHub Pages build）必须通过
  - 一次 PR 聚焦一个主题，避免混合重构与功能

## 架构与扩展提示

- **生成流程**：`ProblemGeneratorFactory` 根据配置选择策略 → 策略委托 `problemTemplates/` 中的模板生成具体题目 → 结果写入 Dexie
- 新增题型：实现 `XxxTemplate.js` + 同名测试，在 `problemTemplates/index.js` 注册，并在 `constants/options.js` 中暴露选项
- Dexie schema 升级需在 `db.js` 追加 `db.version(N).stores(...)`，不要修改既有 version
- 部署目标 GitHub Pages，**资源路径需相对**（`vite.config.js` 中 `base: './'`），新增静态资源时注意这一约束
