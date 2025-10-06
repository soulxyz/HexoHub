# Electron 环境下图片拖放功能设置指南

本文档说明如何在 Electron 环境中实现与 Tauri 环境相同的图片拖放功能，即将图片复制到 Hexo 博客的资源文件夹并插入 `{% asset_img %}` 标签。

## 已实现的功能

1. 图片拖入编辑框时自动复制到文章资源文件夹
2. 自动插入 `{% asset_img %}` 标签
3. 支持多种图片格式（jpg, jpeg, png, gif, bmp, webp, svg）
4. 自动创建资源文件夹（如果不存在）

## 文件说明

1. `electron-image-handler.js` - 暴露给渲染进程的 API
2. `electron-main-handlers.js` - 主进程中的 IPC 处理程序
3. `src/lib/electron-image-api.ts` - TypeScript 封装的 API

## 设置步骤

### 1. 在 Electron 主进程中引入处理程序

在 Electron 主进程文件（通常是 `main.js` 或 `electron.js`）中添加以下代码：

```javascript
// 引入图片处理程序
require('./electron-main-handlers.js');
```

### 2. 在渲染进程中引入 API

在渲染进程的 HTML 文件中添加以下脚本标签：

```html
<script src="./electron-image-handler.js"></script>
```

### 3. 在 markdown-editor.tsx 中使用新 API

在 `handleDrop` 函数中，使用新创建的 API 来处理图片复制：

```typescript
// 确保资源文件夹存在
import { ensureDirectoryExistsInElectron, copyFileInElectron, writeFileFromBufferInElectron } from '@/lib/electron-image-api';

// 在处理拖放时
await ensureDirectoryExistsInElectron(assetFolderPath);

// 复制文件
await copyFileInElectron(filePath, destinationPath);

// 或者从缓冲区写入文件
await writeFileFromBufferInElectron(destinationPath, new Uint8Array(fileContent));
```

## 注意事项

1. 确保 Electron 的安全策略允许访问文件系统
2. 在生产环境中，可能需要调整文件路径处理
3. 如果遇到权限问题，可能需要修改 Electron 的主进程配置

## 故障排除

1. 如果图片复制失败，检查控制台错误信息
2. 确保 IPC 通道已正确注册
3. 验证文件路径是否正确
4. 检查目标文件夹是否有写入权限
