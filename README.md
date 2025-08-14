# HexoHub

中文文档  |  [English](https://github.com/forever218/HexoHub/blob/main/docs/README.en.md)

<div align="center">
  <img 
    src="https://github.com/user-attachments/assets/cac9facb-b0e1-414e-b0a9-21c488f790ef" 
    alt="image" 
    width="80%" 
  />
</div>

一个基于 Electron + Next.js 构建的Hexo博客管理桌面应用程序，提供图形化界面来替代传统的命令行操作  
> 告别繁琐的传统命令行方式（我已经厌倦了hexo xxxx🫠），以更优雅的方式管理您的hexo博客

# ✨ 主要功能

## 📝 文章管理

在本应用程序中，您可以可视化的：**创建新文章**，**查看文章列表** ，**编辑文章**，**实时预览**，**启动本地预览**，**生成并推送静态文件**，**删除文章**

## 🧩 图片拖入
这或许是本应用程序的一大亮点，当您开启了hexo的资源文件夹后（[这是什么？](https://hexo.io/zh-cn/docs/asset-folders)），您就可以使用`{% asset_img example.jpg %}`标签，将本地的图片在博客中进行引用。  
但是，频繁的输入`{% asset_img example.jpg %}`显然是不尽如人意的（特别是当图片文件名很复杂的时候），所以在本应用程序中，您只需要将图片放入与文章同名的资源文件夹下（例如`\blog\source\_posts\测试文章`），然后将图片拖入编辑窗口，就能自动填入`{% asset_img example.jpg %}`标签，省去了输入文件名的烦恼    

<div align="center">
  <img 
    src="https://github.com/user-attachments/assets/2aced4e0-ef08-4daf-af8b-6a31f43a2d56" 
    alt="image" 
    width="80%" 
  />
</div>  

<div align="center">
  <img 
    src="https://github.com/user-attachments/assets/be796a74-7990-4780-a93e-4c3c72d07335" 
    alt="image" 
    width="80%" 
  />
</div>


## ⚙️ Hexo 操作 
**命令执行**：图形化执行常用 Hexo 命令，包括：  
  - `hexo clean` - 清理缓存文件
  - `hexo generate` - 生成静态文件
  - `hexo deploy` - 部署到远程服务器
  - `hexo se` - 启动本地预览
**实时反馈**：显示命令执行结果和错误信息

## 🔧 配置管理
**基本设置**：网站标题、副标题、作者、语言  
**高级设置**：URL 配置、永久链接格式  
**YAML 编辑**：支持直接编辑原始配置文件  
**导入/导出**：配置文件的备份和恢复，更加方便您主题的迁移

# 🚀 快速开始

- **操作系统**: Windows 10 或更高版本  
- **Node.js**: 需要预装 Node.js 和 Hexo CLI  
- **内存**: 建议 4GB 以上  
- **存储**: 建议 100MB 可用空间  
⚠️ 出于速度考虑，我在开发过程中使用的是`cnpm`，并且修改了部分`package.json`内容，请您在使用时酌情考虑，如果要使用`cnpm`，请执行：  
```bash
npm install -g cnpm --registry=http://registry.npm.taobao.org
```
随后即可用`cnpm`代替`npm`

1. **克隆本仓库**
   ```bash
   git clone https://github.com/forever218/HexoHub.git
   ```
 
2. **安装依赖**
   ```bash
   npm install
   ```

3. **开发模式运行**，到这一步就已经可以使用了
   ```bash
   npm run electron
   ```

4. **打包应用**（非必须）
   ```bash
   npm run dist
   ```
⚠️由于个人技术有限，我在打包应用时遇到问题，暂时还未解决，所以也就还未发布release，请使用命令`npm run electron`来启动程序

# 🛠️ 技术栈

## 前端技术
- **Next.js 15** - React 全栈框架
- **React 19** - 用户界面库
- **TypeScript** - 类型安全的 JavaScript  
- **Tailwind CSS** - 原子化 CSS 框架  
- **shadcn/ui** - 高质量 React 组件库  
- **Electron** - 跨平台桌面应用框架
- **electron-builder** - 应用打包工具
- **NSIS** - Windows 安装程序制作工具
- **react-markdown** - Markdown 渲染
- **react-syntax-highlighter** - 代码语法高亮
- **remark-gfm** - GitHub 风格 Markdown 扩展
- **date-fns** - 日期处理库

# 📁 项目结构

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


# 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！  
1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request

---

我在开发过程中遇到了许多问题，如果您可以加入这个项目，成为志同道合的朋友，我会万分感激，给您点杯咖啡！☕
可以通过以下方式联系我：
- 邮箱3316703158@qq.com
- 我的博客https://2am.top
- github


## 代码规范
没有规范（实际上本人代码一团糟👻），只要您写的东西是人类语言即可


# 🙏 致谢

- [Next.js](https://nextjs.org/) - React 框架
- [Electron](https://www.electronjs.org/) - 桌面应用框架
- [shadcn/ui](https://ui.shadcn.com/) - UI 组件库
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Hexo](https://hexo.io/) - 静态博客生成器

