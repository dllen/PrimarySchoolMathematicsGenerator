# 小学数学问题生成器

一个基于Vue.js的小学数学练习题生成工具，专为小学生数学练习设计，支持多种配置选项和打印功能。

## 🎯 功能特点

### 📊 灵活配置
- **数字位数**: 可为加、减、乘、除每种运算独立设置1-3位的数字位数，实现更精细的难度控制
- **运算类型**: 加法(+)、减法(-)、乘法(×)、除法(÷)，可任意组合
- **计算项个数**: 2-4项运算，支持复合运算
- **题目数量**: 1-100道题可自定义，满足不同练习需求

### 📝 题目类型
- **求结果**: 给出完整算式，求计算结果
  - 示例: `① 25 + 37 = ______`
- **求运算项**: 给出结果，求缺失的数字
  - 示例: `② ______ + 37 = 62`

### 🎨 用户体验
- **答案切换**: 一键显示/隐藏答案，方便教学和自测
- **响应式设计**: 适配桌面和移动设备

### 🖨️ 打印功能
- **一键打印**: 优化的打印布局
- **自动隐藏**: 打印时自动隐藏配置面板和答案
- **标准格式**: 适合A4纸张打印

## 🚀 快速开始

### 环境要求
- Node.js 16+ 
- npm 或 yarn

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/dllen/PrimarySchoolMathematicsGenerator.git
cd PrimarySchoolMathematicsGenerator
```

2. **安装依赖**
```bash
npm install
```

3. **启动开发服务器**
```bash
npm run dev
```

4. **访问应用**
打开浏览器访问 `http://localhost:5000`

### 构建部署

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 部署到GitHub Pages
npm run deploy
```

## 🧪 测试 (Testing)

项目使用 [Vitest](https://vitest.dev/) 进行单元测试和组件测试，以确保代码质量和功能稳定性。

### 运行测试

执行以下命令来运行所有测试：

```bash
npm test
```

## 🌐 在线体验

访问 GitHub Pages 在线版本：`https://dllen.github.io/PrimarySchoolMathematicsGenerator/`

## 📖 使用指南

### 基本操作

1. **配置参数**
   - **题目数量**: 设置希望生成的题目总数（1-100）。
   - **计算项个数**: 选择每个算式包含的数字个数（2-4项）。
   - **运算类型**: 
     - 勾选希望练习的运算类型（加、减、乘、除）。
     - **为每种运算设置数字位数**：勾选一种运算后，旁边会出现下拉框，可为其单独设置1-3位的数字位数。
   - **题目类型**: 选择“求结果”或“求运算项”。

2. **生成题目**
   - 点击"生成题目"按钮
   - 系统自动生成符合配置的练习题

3. **查看答案**
   - 点击"显示答案"查看所有答案
   - 点击"隐藏答案"隐藏答案便于练习

4. **打印练习**
   - 点击"打印题目"
   - 系统自动隐藏答案和配置面板
   - 使用浏览器打印功能

### 高级功能

#### 智能算法
- **除法处理**: 自动确保整除，避免小数结果
- **减法处理**: 确保结果为正数，符合小学数学要求
- **随机分布**: 运算项位置随机隐藏，增加练习难度

## 🛠️ 技术栈

- **前端框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **测试框架**: Vitest
- **样式**: 原生CSS + 响应式设计
- **部署**: GitHub Pages

## 📁 项目结构

```
PrimarySchoolMathematicsGenerator/
├── public/                 # 静态资源
├── src/
│   ├── __tests__/       # 测试文件
│   ├── App.vue            # 主应用组件
│   ├── main.js            # 应用入口
│   └── style.css          # 全局样式
├── index.html             # HTML模板
├── package.json           # 项目配置
├── vite.config.js         # Vite配置
└── README.md              # 项目文档
```

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进项目！

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 `LICENSE` 文件了解详情。

## 📞 联系方式

如有问题或建议，请通过提交 [Issue](../../issues) 联系。

---

**让数学学习更简单，让练习生成更高效！** 🎓✨
