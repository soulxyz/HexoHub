# Electron 图片拖放功能集成指南

本指南说明如何在现有 HexoHub 项目中集成 Electron 环境下的图片拖放功能。

## 概述

我们已经创建了一套完整的解决方案，使 Electron 环境下的图片拖放功能与 Tauri 环境保持一致。当用户将图片拖入编辑器时，图片会自动复制到 Hexo 博客的文章资源文件夹，并插入 `{% asset_img %}` 标签。

## 集成步骤

### 1. 设置 Electron 主进程

在 Electron 主进程文件（通常是 `main.js` 或 `electron.js`）中添加以下代码：

```javascript
// 引入图片处理程序
require('./electron-main-handlers.js');
```

### 2. 设置渲染进程

在渲染进程的 HTML 文件中添加以下脚本标签：

```html
<script src="./electron-image-handler.js"></script>
```

### 3. 更新编辑器组件

将现有的 `MarkdownEditor` 组件替换为 `MarkdownEditorWrapper`：

```typescript
// 之前
import { MarkdownEditor } from '@/components/markdown-editor';

// 之后
import { MarkdownEditorWrapper } from '@/components/markdown-editor-wrapper';
```

然后在 JSX 中使用：

```jsx
<MarkdownEditorWrapper
  value={content}
  onChange={setContent}
  onSave={handleSave}
  language={language}
  hexoPath={hexoPath}
  selectedPost={selectedPost}
/>
```

## 工作原理

1. `MarkdownEditorWrapper` 组件会自动检测当前运行环境（Tauri、Electron 或浏览器）
2. 如果是 Electron 环境，使用 `MarkdownEditorElectron` 组件
3. 如果是 Tauri 或浏览器环境，使用原始的 `MarkdownEditor` 组件

## 文件说明

1. `electron-image-handler.js` - 暴露给渲染进程的 API
2. `electron-main-handlers.js` - 主进程中的 IPC 处理程序
3. `src/lib/electron-image-api.ts` - TypeScript 封装的 API
4. `src/components/markdown-editor-electron.tsx` - Electron 专用的编辑器组件
5. `src/components/markdown-editor-wrapper.tsx` - 根据环境自动选择编辑器的包装组件

## 注意事项

1. 确保 Electron 的安全策略允许访问文件系统
2. 在生产环境中，可能需要调整文件路径处理
3. 如果遇到权限问题，可能需要修改 Electron 的主进程配置

## 故障排除

1. 如果图片复制失败，检查控制台错误信息
2. 确保 IPC 通道已正确注册
3. 验证文件路径是否正确
4. 检查目标文件夹是否有写入权限
5. 确保已正确引入所有必要的脚本和组件

## 测试

1. 在 Electron 环境中启动应用
2. 打开一篇博客文章
3. 将图片文件拖入编辑器
4. 验证图片是否已复制到资源文件夹
5. 验证是否已正确插入 `{% asset_img %}` 标签

## 高级配置

如果需要自定义图片处理行为，可以修改以下文件：

1. `electron-image-api.ts` - 修改图片处理逻辑
2. `markdown-editor-electron.tsx` - 修改编辑器行为
3. `electron-main-handlers.js` - 修改主进程处理逻辑
