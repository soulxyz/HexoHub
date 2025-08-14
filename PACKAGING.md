# Hexo Desktop - 打包和部署说明

## Windows 部署准备

### 1. 应用图标
在 `public/icon.ico` 文件中放置应用图标。您可以使用以下工具创建图标：

- **在线工具**: https://icoconvert.com/
- **Windows**: 使用 Paint.NET 或 GIMP
- **推荐尺寸**: 256x256 像素

### 2. 打包命令

#### 开发模式运行
```bash
npm run electron-dev
```

#### 构建生产版本
```bash
npm run dist
```

### 3. 打包配置说明

应用使用 `electron-builder` 进行打包，配置已在 `package.json` 中设置：

```json
{
  "build": {
    "appId": "com.hexo.desktop",
    "productName": "Hexo Desktop",
    "directories": {
      "output": "dist"
    },
    "files": [
      "public/**/*",
      ".next/**/*",
      "node_modules/**/*"
    ],
    "win": {
      "target": "nsis",
      "icon": "public/icon.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
```

### 4. Windows 系统要求

- **操作系统**: Windows 10 或更高版本
- **架构**: x64
- **Node.js**: 应用已内置 Node.js，无需额外安装
- **Hexo**: 需要用户系统已安装 Hexo (`npm install -g hexo-cli`)

### 5. 部署步骤

#### 步骤 1: 准备环境
```bash
# 安装依赖
npm install

# 构建 Next.js 应用
npm run build
```

#### 步骤 2: 打包应用
```bash
# 打包 Windows 应用
npm run dist
```

#### 步骤 3: 检查输出
打包完成后，可执行文件将在 `dist/` 目录中：
- `dist/Hexo Desktop Setup 0.1.0.exe` - 安装程序

### 6. 用户安装指南

1. 运行 `Hexo Desktop Setup 0.1.0.exe`
2. 按照安装向导完成安装
3. 启动应用
4. 选择 Hexo 项目目录开始使用

### 7. 故障排除

#### 常见问题

**问题**: "无法找到 hexo 命令"
**解决**: 确保系统已安装 Hexo CLI
```bash
npm install -g hexo-cli
```

**问题**: "应用无法启动"
**解决**: 检查 Windows 防火墙和杀毒软件设置

**问题**: "路径访问被拒绝"
**解决**: 以管理员身份运行应用，或检查文件权限

### 8. 更新日志

#### v0.1.0
- 初始版本发布
- 支持 Hexo 项目管理
- Markdown 编辑器
- 实时预览功能
- 文章管理（创建、编辑、删除）
- Hexo 配置管理
- Windows 系统兼容性

### 9. 技术栈

- **前端框架**: Next.js 15 + React 19
- **桌面框架**: Electron
- **UI 组件**: shadcn/ui + Tailwind CSS
- **Markdown**: react-markdown + react-syntax-highlighter
- **打包工具**: electron-builder

### 10. 开发者信息

如需修改或重新打包，请参考项目源代码和开发文档。