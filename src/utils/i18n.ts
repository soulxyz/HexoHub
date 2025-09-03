// 国际化配置
export type Language = 'zh' | 'en';

export interface I18nTexts {
  // 通用
  loading: string;
  save: string;
  cancel: string;
  confirm: string;
  delete: string;
  edit: string;
  create: string;
  clear: string;
  select: string;
  error: string;
  success: string;
  postsPerPageRangeError: string;
  autoSaveIntervalRangeError: string;
  settingsSaved: string;

  // 项目管理
  hexoProject: string;
  selectHexoDirectory: string;
  clearSavedPath: string;

  // 文章管理
  articles: string;
  articleList: string;
  viewArticleList: string;
  createNewArticle: string;
  articleEditor: string;
  preview: string;

  // 文章统计
  articleStatistics: string;
  tagCloud: string;
  viewTagCloud: string;

  // 编辑器
  markdownEditor: string;
  lines: string;
  supportMarkdownSyntax: string;
  saving: string;
  dragImageHint: string;

  // 占位符文本
  editorPlaceholder: string;

  // 配置
  hexoConfig: string;

  // 命令
  commands: string;
  generate: string;
  deploy: string;
  server: string;
  clean: string;
  startServer: string;
  stopServer: string;

  // 状态
  serverRunning: string;
  serverStopped: string;

  // 消息
  selectValidHexoProject: string;
  onlyAvailableInDesktop: string;
  selectDirectoryFailed: string;
  validateProjectFailed: string;
  loadArticlesFailed: string;
  createArticleFailed: string;
  saveArticleFailed: string;
  deleteArticleFailed: string;

  // 文章创建
  articleTitle: string;
  tags: string;
  categories: string;
  excerpt: string;
  addTag: string;
  addCategory: string;

  // 操作按钮
  saveArticle: string;
  deleteArticle: string;
  viewInBrowser: string;

  // 编辑器提示文本
  selectArticleToEdit: string;
  selectProjectFirst: string;
  selectFromListOrCreate: string;
  clickSelectButton: string;

  // 主题切换
  lightMode: string;
  darkMode: string;
  toggleTheme: string;

  // 面板设置
  panelSettings: string;
  postsPerPage: string;
  postsPerPageDescription: string;
  autoSaveInterval: string;
  autoSaveIntervalDescription: string;
  editorMode: string;
  mode1: string;
  mode2: string;
  modeDescription: string;
  backgroundSettings: string;
  backgroundImageUrl: string;
  selectImage: string;
  clear: string;
  backgroundImageDescription: string;
  backgroundOpacity: string;
  backgroundOpacityDescription: string;
  saveSettings: string;
  about: string;
  versionInfo: string;
  projectAddress: string;
  contactMe: string;
  supportMessage: string;
  stopWarning: string;
  disappearWarning: string;

  // 更新检查
  updateCheck: string;
  checkForUpdates: string;
  autoCheckUpdates: string;
  autoCheckUpdatesDescription: string;
  toggleAutoCheckUpdates: string;
  currentVersion: string;
  lastCheckTime: string;
  latestVersion: string;
  newVersionAvailable: string;
  upToDate: string;
  publishTime: string;
  updateContent: string;
  downloadLinks: string;
  download: string;
  viewOnGitHub: string;
  newVersionFound: string;
  newVersionDescription: string;
  alreadyLatest: string;
  alreadyLatestDescription: string;
  checkUpdateFailed: string;
  unknownError: string;
}

export const i18nTexts: Record<Language, I18nTexts> = {
  zh: {
    // 通用
    loading: '加载中...',
    save: '保存',
    cancel: '取消',
    confirm: '确认',
    delete: '删除',
    edit: '编辑',
    create: '创建',
    clear: '清除',
    select: '选择',
    error: '错误',
    success: '成功',
    postsPerPageRangeError: '每页显示文章数量必须在1-100之间',
    autoSaveIntervalRangeError: '自动保存间隔必须在1-60分钟之间',
    settingsSaved: '设置已保存',

    // 项目管理
    hexoProject: 'Hexo项目',
    selectHexoDirectory: '选择Hexo项目目录',
    clearSavedPath: '清除保存的路径',

    // 文章管理
    articles: '文章',
    articleList: '文章列表',
    viewArticleList: '文章列表',
    createNewArticle: '创建新文章',
    articleEditor: '文章编辑器',
    preview: '预览',

    // 文章统计
    articleStatistics: '文章统计',
    tagCloud: '文章统计',
    viewTagCloud: '文章统计',

    // 编辑器
    markdownEditor: 'Markdown 编辑器',
    lines: '行',
    supportMarkdownSyntax: '支持标准 Markdown 语法',
    saving: '保存中...',
    dragImageHint: '拖放图片文件到此处插入 Hexo 图片标签',

    // 占位符文本
    editorPlaceholder: `# 标题

开始编写您的文章内容...

## Markdown 语法提示

### 文本格式
- **粗体文本**
- *斜体文本*
- ~~删除线~~
- \`行内代码\`

### 列表
1. 有序列表项
2. 另一个项目

- 无序列表项
- 另一个项目

### 链接和图片
[链接文本](https://example.com)

![图片描述](image.jpg)

### 代码块
\`\`\`javascript
console.log('Hello, Hexo!');
\`\`\`

### 引用
> 这是一个引用块

### 表格
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 内容1 | 内容2 | 内容3 |`,

    // 配置
    hexoConfig: 'Hexo配置',

    // 命令
    commands: '命令',
    generate: '生成',
    deploy: '部署',
    server: '服务器',
    clean: '清理',
    startServer: '启动服务器',
    stopServer: '停止服务器',

    // 状态
    serverRunning: '服务器运行中',
    serverStopped: '服务器已停止',

    // 消息
    selectValidHexoProject: '请先选择有效的Hexo项目目录',
    onlyAvailableInDesktop: '此功能仅在桌面应用中可用',
    selectDirectoryFailed: '选择目录失败',
    validateProjectFailed: '验证项目失败',
    loadArticlesFailed: '加载文章失败',
    createArticleFailed: '创建文章失败',
    saveArticleFailed: '保存文章失败',
    deleteArticleFailed: '删除文章失败',

    // 文章创建
    articleTitle: '文章标题',
    tags: '标签',
    categories: '分类',
    excerpt: '摘要',
    addTag: '添加标签',
    addCategory: '添加分类',

    // 操作按钮
    saveArticle: '保存文章',
    deleteArticle: '删除文章',
    viewInBrowser: '在浏览器中查看',

    // 编辑器提示文本
    selectArticleToEdit: '选择一篇文章开始编辑',
    selectProjectFirst: '请先选择Hexo项目目录',
    selectFromListOrCreate: '从左侧文章列表中选择一篇文章，或创建新文章',
    clickSelectButton: '点击"选择"按钮来选择您的Hexo项目目录',

    // 主题切换
    lightMode: '明亮模式',
    darkMode: '黑夜模式',
    toggleTheme: '切换主题模式',

    // 面板设置
    panelSettings: '面板设置',
    postsPerPage: '每页显示文章数量',
    postsPerPageDescription: '设置文章列表每页显示的文章数量，范围1-100',
    autoSaveInterval: '自动保存间隔（分钟）',
    autoSaveIntervalDescription: '设置文章自动保存的时间间隔，范围1-60分钟，默认为3分钟',
    editorMode: '编辑模式',
    mode1: '模式1',
    mode2: '模式2(beta)',
    modeDescription: '模式1：编辑和预览分离，需要手动切换；模式2：编辑和预览同时显示，左右分栏',
    backgroundSettings: '背景设置',
    backgroundImageUrl: '背景图片URL',
    selectImage: '选择图片',
    clear: '清除',
    backgroundImageDescription: '输入图片URL或从本地选择图片作为背景',
    backgroundOpacity: '背景透明度',
    backgroundOpacityDescription: '调整背景透明度，0为完全透明，1为完全不透明',
    saveSettings: '保存设置',
    about: '关于',
    versionInfo: '版本信息',
    projectAddress: '项目地址',
    contactMe: '联系我',
    supportMessage: '您的star⭐是对我最大的支持😊',
    stopWarning: '住手啊！',
    disappearWarning: '这样下去......会消失的喵！',

    // 更新检查
    updateCheck: '更新检查',
    checkForUpdates: '检查更新',
    autoCheckUpdates: '是否自动检查更新',
    autoCheckUpdatesDescription: '如果您被更新弹窗所困扰，可以选择关闭更新检查',
    toggleAutoCheckUpdates: '切换自动检查更新',
    currentVersion: '当前版本:',
    lastCheckTime: '上次检查时间:',
    latestVersion: '最新版本:',
    newVersionAvailable: '有新版本',
    upToDate: '已是最新',
    publishTime: '发布时间:',
    updateContent: '更新内容:',
    downloadLinks: '下载链接:',
    download: '下载',
    viewOnGitHub: '在GitHub上查看',
    newVersionFound: '发现新版本',
    newVersionDescription: '新版本 {version} 已发布',
    alreadyLatest: '已是最新版本',
    alreadyLatestDescription: '当前版本 {version} 已是最新',
    checkUpdateFailed: '检查更新失败',
    unknownError: '未知错误',
  },

  en: {
    // 通用
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    clear: 'Clear',
    select: 'Select',
    error: 'Error',
    success: 'Success',
    postsPerPageRangeError: 'Posts per page must be between 1-100',
    autoSaveIntervalRangeError: 'Auto save interval must be between 1-60 minutes',
    settingsSaved: 'Settings saved',

    // 项目管理
    hexoProject: 'Hexo Project',
    selectHexoDirectory: 'Select Hexo Project Directory',
    clearSavedPath: 'Clear Saved Path',

    // 文章管理
    articles: 'Articles',
    articleList: 'Articles',
    viewArticleList: 'Article List',
    createNewArticle: 'Create New Article',
    articleEditor: 'Article Editor',
    preview: 'Preview',

    // 文章统计
    articleStatistics: 'Article Statistics',
    tagCloud: 'Tag Cloud',
    viewTagCloud: 'Tag Cloud',

    // 编辑器
    markdownEditor: 'Markdown Editor',
    lines: 'lines',
    supportMarkdownSyntax: 'Standard Markdown syntax supported',
    saving: 'Saving...',
    dragImageHint: 'Drop image files here to insert Hexo image tags',

    // 占位符文本
    editorPlaceholder: `# Title

Start writing your article content...

## Markdown Syntax Guide

### Text Formatting
- **Bold text**
- *Italic text*
- ~~Strikethrough~~
- \`Inline code\`

### Lists
1. Ordered list item
2. Another item

- Unordered list item
- Another item

### Links and Images
[Link text](https://example.com)

![Image description](image.jpg)

### Code Blocks
\`\`\`javascript
console.log('Hello, Hexo!');
\`\`\`

### Quotes
> This is a quote block

### Tables
| Column1 | Column2 | Column3 |
|---------|---------|---------|
| Content1 | Content2 | Content3 |`,

    // 配置
    hexoConfig: 'Hexo Config',

    // 命令
    commands: 'Commands',
    generate: 'Generate',
    deploy: 'Deploy',
    server: 'Server',
    clean: 'Clean',
    startServer: 'Start Server',
    stopServer: 'Stop Server',

    // 状态
    serverRunning: 'Server Running',
    serverStopped: 'Server Stopped',

    // 消息
    selectValidHexoProject: 'Please select a valid Hexo project directory first',
    onlyAvailableInDesktop: 'This feature is only available in desktop app',
    selectDirectoryFailed: 'Failed to select directory',
    validateProjectFailed: 'Failed to validate project',
    loadArticlesFailed: 'Failed to load articles',
    createArticleFailed: 'Failed to create article',
    saveArticleFailed: 'Failed to save article',
    deleteArticleFailed: 'Failed to delete article',

    // 文章创建
    articleTitle: 'Article Title',
    tags: 'Tags',
    categories: 'Categories',
    excerpt: 'Excerpt',
    addTag: 'Add Tag',
    addCategory: 'Add Category',

    // 操作按钮
    saveArticle: 'Save Article',
    deleteArticle: 'Delete Article',
    viewInBrowser: 'View in Browser',

    // 编辑器提示文本
    selectArticleToEdit: 'Select an article to start editing',
    selectProjectFirst: 'Please select a Hexo project directory first',
    selectFromListOrCreate: 'Select an article from the list on the left, or create a new one',
    clickSelectButton: 'Click the "Select" button to choose your Hexo project directory',

    // 主题切换
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    toggleTheme: 'Toggle Theme',

    // 面板设置
    panelSettings: 'Panel Settings',
    postsPerPage: 'Posts Per Page',
    postsPerPageDescription: 'Set the number of articles to display per page in the article list, range 1-100',
    autoSaveInterval: 'Auto Save Interval (minutes)',
    autoSaveIntervalDescription: 'Set the time interval for auto-saving articles, range 1-60 minutes, default is 3 minutes',
    editorMode: 'Editor Mode',
    mode1: 'Mode 1',
    mode2: 'Mode 2 (beta)',
    modeDescription: 'Mode 1: Edit and preview are separated, manual switching required; Mode 2: Edit and preview are displayed simultaneously, split left and right',
    backgroundSettings: 'Background Settings',
    backgroundImageUrl: 'Background Image URL',
    selectImage: 'Select Image',
    clear: 'Clear',
    backgroundImageDescription: 'Enter image URL or select an image from local as background',
    backgroundOpacity: 'Background Opacity',
    backgroundOpacityDescription: 'Adjust background opacity, 0 is completely transparent, 1 is completely opaque',
    saveSettings: 'Save Settings',
    about: 'About',
    versionInfo: 'Version Info',
    projectAddress: 'Project Address',
    contactMe: 'Contact Me',
    supportMessage: 'Your star⭐ is my biggest support😊',
    stopWarning: 'Stop it!',
    disappearWarning: 'This way... it will disappear, meow!',

    // 更新检查
    updateCheck: 'Update Check',
    checkForUpdates: 'Check for Updates',
    autoCheckUpdates: 'Auto Check Updates',
    autoCheckUpdatesDescription: 'If you are bothered by update pop-ups, you can turn off update checking',
    toggleAutoCheckUpdates: 'Toggle Auto Check Updates',
    currentVersion: 'Current Version:',
    lastCheckTime: 'Last Check Time:',
    latestVersion: 'Latest Version:',
    newVersionAvailable: 'New Version Available',
    upToDate: 'Up to Date',
    publishTime: 'Publish Time:',
    updateContent: 'Update Content:',
    downloadLinks: 'Download Links:',
    download: 'Download',
    viewOnGitHub: 'View on GitHub',
    newVersionFound: 'New Version Found',
    newVersionDescription: 'New version {version} has been released',
    alreadyLatest: 'Already Latest Version',
    alreadyLatestDescription: 'Current version {version} is already the latest',
    checkUpdateFailed: 'Failed to check for updates',
    unknownError: 'Unknown error',
  }
};

// 获取当前语言的文本
export const getTexts = (language: Language): I18nTexts => {
  return i18nTexts[language];
};