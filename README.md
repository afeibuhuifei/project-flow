# ProjectFlow - 现代化项目管理平台

一个功能完整的项目管理软件，提供看板视图和甘特图功能，支持团队协作和文件管理。

## 🚀 功能特性

- 📋 **看板管理** - 拖拽式任务管理，支持多种状态
- 📊 **甘特图** - 专业级项目时间线可视化
- 👥 **用户认证** - 安全的用户登录和权限管理
- 📁 **文件管理** - 任务附件上传、预览和版本控制
- 📱 **响应式设计** - 完美适配桌面和移动设备
- 💾 **本地存储** - SQLite数据库，数据安全可靠

## 🛠️ 技术栈

### 前端
- **React 18** + **TypeScript** + **Vite**
- **Ant Design** + **Tailwind CSS**
- **Zustand** (状态管理)
- **@gantt-task-react** (甘特图)
- **React Router v6**

### 后端
- **Express.js** + **TypeScript**
- **Prisma** (ORM)
- **SQLite** (数据库)
- **JWT** (身份验证)
- **Multer** (文件上传)

## 📦 快速开始

### 环境要求
- Node.js 16+
- npm 或 yarn

### 安装依赖
```bash
npm run install:all
```

### 启动开发环境
```bash
npm run dev
```

这将同时启动前端（http://localhost:5173）和后端（http://localhost:3000）

### 构建生产版本
```bash
npm run build
npm run start
```

## 📁 项目结构

```
project-flow/
├── client/                 # React前端应用
├── server/                 # Express后端API
├── shared/                 # 共享类型和工具
├── docs/                   # 项目文档
└── package.json           # 根配置文件
```

## 🔐 默认账户

- **用户名**: 123
- **密码**: 123

## 📖 API文档

启动服务器后，访问 http://localhost:3000/api-docs 查看API文档

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情