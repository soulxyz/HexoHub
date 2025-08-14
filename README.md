# HexoHub

一个基于 Electron + Next.js 构建的 Hexo 博客管理桌面应用程序，提供图形化界面来替代传统的命令行操作。

## ✨ 主要功能

### 📝 文章管理
- **创建新文章**：一键创建新的 Hexo 文章，自动生成标准格式
- **文章列表**：显示所有文章，支持按修改时间排序
- **编辑文章**：内置 Markdown 编辑器，支持语法高亮和行号显示
- **实时预览**：编辑时实时预览 Markdown 渲染效果
- **删除文章**：安全删除不需要的文章

### ⚙️ Hexo 操作
- **项目验证**：自动检测目录是否为有效的 Hexo 项目
- **命令执行**：图形化执行常用 Hexo 命令
  - `hexo clean` - 清理缓存文件
  - `hexo generate` - 生成静态文件
  - `hexo deploy` - 部署到远程服务器
- **实时反馈**：显示命令执行结果和错误信息

### 🔧 配置管理
- **基本设置**：网站标题、副标题、作者、语言等
- **高级设置**：URL 配置、永久链接格式等
- **YAML 编辑**：支持直接编辑原始配置文件
- **导入/导出**：配置文件的备份和恢复

### 🎨 用户界面
- **现代化设计**：基于 shadcn/ui 组件库
- **响应式布局**：适配不同屏幕尺寸
- **深色/浅色主题**：支持主题切换
- **直观操作**：符合 Windows 操作规范

## 🚀 快速开始

### 系统要求
- **操作系统**: Windows 10 或更高版本
- **Node.js**: 需要预装 Node.js 和 Hexo CLI
- **内存**: 建议 4GB 以上
- **存储**: 建议 100MB 可用空间

### 安装步骤

1. **安装依赖**
   ```bash
   npm install
   ```

2. **开发模式运行**
   ```bash
   npm run electron-dev
   ```

3. **打包应用**
   ```bash
   npm run dist
   ```

### 使用方法

1. **启动应用**
   - 开发模式：`npm run electron-dev`
   - 生产版本：运行打包后的 `dist/Hexo Desktop Setup 0.1.0.exe`

2. **选择 Hexo 项目**
   - 点击"选择"按钮
   - 选择您的 Hexo 项目根目录
   - 系统会自动验证项目有效性

3. **管理文章**
   - 从左侧列表选择文章进行编辑
   - 点击 + 按钮创建新文章
   - 使用编辑/预览标签页切换视图

4. **执行 Hexo 命令**
   - 使用顶部工具栏的按钮
   - 查看命令执行结果
   - 根据反馈进行相应操作

## 🛠️ 技术栈

### 前端技术
- **Next.js 15** - React 全栈框架
- **React 19** - 用户界面库
- **TypeScript** - 类型安全的 JavaScript
- **Tailwind CSS** - 原子化 CSS 框架
- **shadcn/ui** - 高质量 React 组件库

### 桌面技术
- **Electron** - 跨平台桌面应用框架
- **electron-builder** - 应用打包工具
- **NSIS** - Windows 安装程序制作工具

### 功能库
- **react-markdown** - Markdown 渲染
- **react-syntax-highlighter** - 代码语法高亮
- **remark-gfm** - GitHub 风格 Markdown 扩展
- **date-fns** - 日期处理库

## 📁 项目结构

```
src/
├── app/
│   ├── page.tsx                 # 主页面
│   ├── layout.tsx              # 应用布局
│   └── globals.css             # 全局样式
├── components/
│   ├── ui/                     # shadcn/ui 组件
│   ├── markdown-editor.tsx     # Markdown 编辑器
│   ├── markdown-preview.tsx    # Markdown 预览
│   ├── post-list.tsx           # 文章列表
│   └── hexo-config.tsx         # Hexo 配置管理
├── lib/
│   ├── windows-compat.ts       # Windows 兼容性工具
│   ├── utils.ts                # 工具函数
│   └── db.ts                  # 数据库连接
└── hooks/
    ├── use-toast.ts           # Toast 通知钩子
    └── use-mobile.ts          # 移动端检测钩子

public/
├── electron.js                # Electron 主进程
├── icon.svg                   # 应用图标
├── installer.nsh              # NSIS 安装脚本
└── logo.svg                   # 应用 Logo
```

## 🔧 开发指南

### 添加新功能

1. **创建组件**
   ```bash
   # 在 src/components/ 目录下创建新组件
   # 遵循现有的命名规范和代码风格
   ```

2. **状态管理**
   - 使用 React hooks 进行状态管理
   - 复杂状态考虑使用 Zustand

3. **样式规范**
   - 使用 Tailwind CSS 类名
   - 遵循 shadcn/ui 设计系统

4. **类型安全**
   - 所有组件和函数都需要 TypeScript 类型
   - 定义清晰的接口和类型

### 调试技巧

1. **前端调试**
   - 使用 Chrome DevTools
   - 在 Electron 中按 F12 打开开发者工具

2. **主进程调试**
   - 使用 console.log 输出调试信息
   - 查看 Electron 主进程控制台

3. **常见问题**
   - 路径问题：使用 Windows 兼容性工具
   - 权限问题：检查文件访问权限
   - 命令问题：确保 Hexo CLI 正确安装

## 📦 打包和部署

### Windows 打包

1. **准备图标**
   - 将图标保存为 `public/icon.ico`
   - 建议尺寸：256x256 像素

2. **打包命令**
   ```bash
   npm run dist
   ```

3. **输出文件**
   - `dist/Hexo Desktop Setup 0.1.0.exe` - 安装程序

### 部署注意事项

- 确保 Windows 系统已安装 Node.js 和 Hexo CLI
- 应用需要文件系统访问权限
- 某些安全软件可能需要添加例外

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request

### 代码规范

- 使用 ESLint 和 Prettier
- 遵循 TypeScript 最佳实践
- 编写清晰的组件文档

## 📄 许可证

MIT License

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 框架
- [Electron](https://www.electronjs.org/) - 桌面应用框架
- [shadcn/ui](https://ui.shadcn.com/) - UI 组件库
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Hexo](https://hexo.io/) - 静态博客生成器

---

**如有问题或建议，请提交 Issue**