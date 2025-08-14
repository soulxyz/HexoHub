'use client';

import { useState, useEffect } from 'react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FolderOpen,
  FileText,
  Settings,
  Play,
  Save,
  Trash2,
  Plus,
  Eye,
  Edit,
  Globe,
  Terminal,
  Server,
  Square,
  Languages,
  Sun,
  Moon
} from 'lucide-react';
import { Language, getTexts } from '@/utils/i18n';
import { MarkdownEditor } from '@/components/markdown-editor';
import { MarkdownPreview } from '@/components/markdown-preview';
import { PostList } from '@/components/post-list';
import { HexoConfig } from '@/components/hexo-config';
import { CreatePostDialog } from '@/components/create-post-dialog';

interface Post {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modifiedTime: Date;
}

interface CommandResult {
  success: boolean;
  stdout?: string;
  stderr?: string;
  error?: string;
}

export default function Home() {
  const [hexoPath, setHexoPath] = useState<string>('');
  const [isValidHexoProject, setIsValidHexoProject] = useState<boolean>(false);
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [postContent, setPostContent] = useState<string>('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [commandResult, setCommandResult] = useState<CommandResult | null>(null);
  const [activeTab, setActiveTab] = useState<string>('editor');
  const [mainView, setMainView] = useState<string>('posts');
  const [showCreateDialog, setShowCreateDialog] = useState<boolean>(false);
  const [isServerRunning, setIsServerRunning] = useState<boolean>(false);
  const [serverProcess, setServerProcess] = useState<any>(null);
  const [language, setLanguage] = useState<Language>('zh');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // 命令输出框的大小状态
  const [outputBoxHeight, setOutputBoxHeight] = useState<number>(128); // 默认高度 32 * 4 = 128px
  const [outputBoxWidth, setOutputBoxWidth] = useState<number>(320); // 默认宽度 80 * 4 = 320px
  const [isResizing, setIsResizing] = useState<{ type: 'height' | 'width' | null }>({ type: null });

  // 获取当前语言的文本
  const t = getTexts(language);

  // 检查是否在Electron环境中
  const isElectron = typeof window !== 'undefined' && window.require;

  // 组件加载时，尝试从localStorage加载上次选择的路径和语言设置
  useEffect(() => {
    const loadSavedSettings = async () => {
      if (typeof window !== 'undefined') {
        // 加载语言设置
        const savedLanguage = localStorage.getItem('app-language') as Language;
        if (savedLanguage && (savedLanguage === 'zh' || savedLanguage === 'en')) {
          setLanguage(savedLanguage);
        }

        // 加载主题设置
        const savedTheme = localStorage.getItem('app-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldUseDark = savedTheme === 'dark' || (savedTheme === null && prefersDark);
        setIsDarkMode(shouldUseDark);

        // 应用主题到document
        if (shouldUseDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }

        // 加载项目路径
        const savedPath = localStorage.getItem('hexo-project-path');
        if (savedPath && isElectron) {
          setHexoPath(savedPath);
          await validateHexoProject(savedPath);
        }
      }
    };

    loadSavedSettings();
  }, [isElectron]);

  // 切换语言
  const toggleLanguage = () => {
    const newLanguage: Language = language === 'zh' ? 'en' : 'zh';
    setLanguage(newLanguage);
    if (typeof window !== 'undefined') {
      localStorage.setItem('app-language', newLanguage);
    }
  };

  // 切换主题
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);

    if (typeof window !== 'undefined') {
      // 保存主题设置
      localStorage.setItem('app-theme', newTheme ? 'dark' : 'light');

      // 应用主题到document
      if (newTheme) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  // 清除保存的项目路径
  const clearSavedPath = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hexo-project-path');
    }
    setHexoPath('');
    setIsValidHexoProject(false);
    setValidationMessage('');
    setPosts([]);
    setSelectedPost(null);
    setPostContent('');
  };

  // 选择Hexo项目目录
  const selectHexoDirectory = async () => {
    if (!isElectron) {
      alert(t.onlyAvailableInDesktop);
      return;
    }

    try {
      const { ipcRenderer } = window.require('electron');
      const selectedPath = await ipcRenderer.invoke('select-directory');

      if (selectedPath) {
        setHexoPath(selectedPath);
        // 保存路径到localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('hexo-project-path', selectedPath);
        }
        await validateHexoProject(selectedPath);
      }
    } catch (error) {
      console.error('选择目录失败:', error);
      setValidationMessage('选择目录失败: ' + error.message);
    }
  };

  // 验证Hexo项目
  const validateHexoProject = async (path: string) => {
    if (!isElectron) return;

    try {
      const { ipcRenderer } = window.require('electron');
      const result = await ipcRenderer.invoke('validate-hexo-project', path);

      setIsValidHexoProject(result.valid);
      setValidationMessage(result.message);

      if (result.valid) {
        await loadPosts(path);
      }
    } catch (error) {
      console.error('验证项目失败:', error);
      setValidationMessage('验证项目失败: ' + error.message);
    }
  };

  // 加载文章列表
  const loadPosts = async (path: string) => {
    if (!isElectron) return;

    setIsLoading(true);
    try {
      const { ipcRenderer } = window.require('electron');
      const files = await ipcRenderer.invoke('list-files', path + '/source/_posts');

      const markdownFiles = files.filter((file: Post) =>
        !file.isDirectory && (file.name.endsWith('.md') || file.name.endsWith('.markdown'))
      );

      setPosts(markdownFiles);
    } catch (error) {
      console.error('加载文章失败:', error);
      setValidationMessage('加载文章失败: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 创建新文章
  const createNewPost = () => {
    if (!isElectron || !hexoPath) {
      alert(t.selectValidHexoProject);
      return;
    }
    setShowCreateDialog(true);
  };

  // 处理文章创建确认
  const handleCreatePostConfirm = async (postData: {
    title: string;
    tags: string[];
    categories: string[];
    excerpt?: string;
  }) => {
    setIsLoading(true);
    try {
      const { ipcRenderer } = window.require('electron');

      // 构建Hexo new命令
      let command = `new "${postData.title}"`;

      // 如果有标签或分类，创建文章后需要更新front matter
      const result = await ipcRenderer.invoke('execute-hexo-command', command, hexoPath);

      setCommandResult(result);
      if (result.success) {
        // 如果有额外的标签、分类或摘要，需要更新文件
        if (postData.tags.length > 0 || postData.categories.length > 0 || postData.excerpt) {
          await updatePostFrontMatter(postData);
        }

        // 延迟一点再加载文章列表，确保文件系统操作完成
        setTimeout(async () => {
          await loadPosts(hexoPath);
        }, 500);
      }
    } catch (error) {
      console.error('创建文章失败:', error);
      setCommandResult({
        success: false,
        error: '创建文章失败: ' + (error?.message || '未知错误')
      });
    } finally {
      setIsLoading(false);
      setShowCreateDialog(false);
    }
  };

  // 更新文章的front matter
  const updatePostFrontMatter = async (postData: {
    title: string;
    tags: string[];
    categories: string[];
    excerpt?: string;
  }) => {
    try {
      const { ipcRenderer } = window.require('electron');
      const postsDir = hexoPath + '/source/_posts';
      const fileName = postData.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-') + '.md';
      const filePath = `${postsDir}/${fileName}`;

      // 读取现有文件内容
      let content = await ipcRenderer.invoke('read-file', filePath);

      // 解析front matter
      const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (frontMatterMatch) {
        let frontMatter = frontMatterMatch[1];

        // 添加标签
        if (postData.tags.length > 0) {
          const tagsString = postData.tags.map(tag => `  - ${tag}`).join('\n');
          frontMatter += `\ntags:\n${tagsString}`;
        }

        // 添加分类
        if (postData.categories.length > 0) {
          const categoriesString = postData.categories.map(cat => `  - ${cat}`).join('\n');
          frontMatter += `\ncategories:\n${categoriesString}`;
        }

        // 添加摘要
        if (postData.excerpt) {
          frontMatter += `\nexcerpt: "${postData.excerpt}"`;
        }

        // 重新构建文件内容
        const newContent = content.replace(/^---\n[\s\S]*?\n---/, `---\n${frontMatter}\n---`);

        // 写回文件
        await ipcRenderer.invoke('write-file', filePath, newContent);
      }
    } catch (error) {
      console.error('更新文章元数据失败:', error);
    }
  };

  // 选择文章
  const selectPost = async (post: Post) => {
    if (!isElectron) return;

    setSelectedPost(post);
    setIsLoading(true);

    try {
      const { ipcRenderer } = window.require('electron');
      const content = await ipcRenderer.invoke('read-file', post.path);
      setPostContent(content);
    } catch (error) {
      console.error('读取文章失败:', error);
      setCommandResult({
        success: false,
        error: '读取文章失败: ' + error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 保存文章
  const savePost = async () => {
    if (!isElectron || !selectedPost) return;

    setIsLoading(true);
    try {
      const { ipcRenderer } = window.require('electron');
      await ipcRenderer.invoke('write-file', selectedPost.path, postContent);

      setCommandResult({
        success: true,
        stdout: '文章保存成功'
      });
    } catch (error) {
      console.error('保存文章失败:', error);
      setCommandResult({
        success: false,
        error: '保存文章失败: ' + error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 删除文章
  const deletePost = async () => {
    if (!isElectron || !selectedPost) return;

    if (!confirm(`确定要删除文章 "${selectedPost.name}" 吗？`)) return;

    setIsLoading(true);
    try {
      const { ipcRenderer } = window.require('electron');
      await ipcRenderer.invoke('delete-file', selectedPost.path);

      setCommandResult({
        success: true,
        stdout: '文章删除成功'
      });

      setSelectedPost(null);
      setPostContent('');
      await loadPosts(hexoPath);
    } catch (error) {
      console.error('删除文章失败:', error);
      setCommandResult({
        success: false,
        error: '删除文章失败: ' + error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 执行Hexo命令
  const executeHexoCommand = async (command: string) => {
    if (!isElectron || !hexoPath) return;

    setIsLoading(true);
    try {
      const { ipcRenderer } = window.require('electron');
      const result = await ipcRenderer.invoke('execute-hexo-command', command, hexoPath);

      setCommandResult(result);
    } catch (error) {
      console.error('执行命令失败:', error);
      setCommandResult({
        success: false,
        error: '执行命令失败: ' + error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 启动Hexo服务器
  const startHexoServer = async () => {
    if (!isElectron || !hexoPath || isServerRunning) return;

    setIsLoading(true);
    try {
      const { ipcRenderer } = window.require('electron');
      const result = await ipcRenderer.invoke('start-hexo-server', hexoPath);

      if (result.success) {
        setIsServerRunning(true);
        setServerProcess(result.process);
        setCommandResult({
          success: true,
          stdout: 'Hexo服务器已启动，访问 http://localhost:4000 预览网站'
        });

        // 打开浏览器预览
        setTimeout(() => {
          ipcRenderer.invoke('open-url', 'http://localhost:4000');
        }, 2000);
      } else {
        setCommandResult(result);
      }
    } catch (error) {
      console.error('启动服务器失败:', error);
      setCommandResult({
        success: false,
        error: '启动服务器失败: ' + error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 停止Hexo服务器
  const stopHexoServer = async () => {
    if (!isElectron || !isServerRunning) return;

    setIsLoading(true);
    try {
      const { ipcRenderer } = window.require('electron');
      const result = await ipcRenderer.invoke('stop-hexo-server');

      if (result.success) {
        setIsServerRunning(false);
        setServerProcess(null);
        setCommandResult({
          success: true,
          stdout: 'Hexo服务器已停止'
        });
      } else {
        setCommandResult(result);
      }
    } catch (error) {
      console.error('停止服务器失败:', error);
      setCommandResult({
        success: false,
        error: '停止服务器失败: ' + error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 渲染命令结果
  const renderCommandResult = () => {
    if (!commandResult) return null;

    // 限制输出长度和宽度
    const truncateText = (text, maxLength = 500) => {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    };

    const formatOutput = (text) => {
      if (!text) return '';
      // 限制每行长度，避免过宽
      const lines = text.split('\n');
      const formattedLines = lines.map(line => {
        if (line.length > 80) {
          return line.substring(0, 80) + '...';
        }
        return line;
      });
      return truncateText(formattedLines.join('\n'));
    };

    return (
      <Alert className={commandResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
        <AlertDescription>
          <div className="font-mono text-xs whitespace-pre-wrap break-words overflow-hidden max-w-full">
            {commandResult.success ? (
              <div className="text-green-700">
                <div className="font-semibold">✓ 命令执行成功</div>
                {commandResult.stdout && (
                  <div className="mt-2 max-h-32 overflow-y-auto overflow-x-hidden">
                    {formatOutput(commandResult.stdout)}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-red-700">
                <div className="font-semibold">✗ 命令执行失败</div>
                {commandResult.error && (
                  <div className="mt-2 max-h-32 overflow-y-auto overflow-x-hidden">
                    {formatOutput(commandResult.error)}
                  </div>
                )}
                {commandResult.stderr && (
                  <div className="mt-2 max-h-32 overflow-y-auto overflow-x-hidden">
                    {formatOutput(commandResult.stderr)}
                  </div>
                )}
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 */}
      <header className="border-b bg-card">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Hexo Desktop</h1>
            {isValidHexoProject && (
              <Badge variant="default" className="bg-green-500">
                {language === 'zh' ? '已连接' : 'Connected'}
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant={mainView === 'posts' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMainView('posts')}
            >
              <FileText className="w-4 h-4 mr-2" />
              {t.articles}
            </Button>
            <Button
              variant={mainView === 'config' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMainView('config')}
              disabled={!isValidHexoProject}
            >
              <Settings className="w-4 h-4 mr-2" />
              {t.hexoConfig}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => executeHexoCommand('clean')}
              disabled={!isValidHexoProject || isLoading}
            >
              <Terminal className="w-4 h-4 mr-2" />
              {t.clean}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => executeHexoCommand('generate')}
              disabled={!isValidHexoProject || isLoading}
            >
              <Play className="w-4 h-4 mr-2" />
              {t.generate}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => executeHexoCommand('deploy')}
              disabled={!isValidHexoProject || isLoading}
            >
              <Globe className="w-4 h-4 mr-2" />
              {t.deploy}
            </Button>
            <Button
              variant={isServerRunning ? "destructive" : "default"}
              size="sm"
              onClick={isServerRunning ? stopHexoServer : startHexoServer}
              disabled={!isValidHexoProject || isLoading}
            >
              {isServerRunning ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  {t.stopServer}
                </>
              ) : (
                <>
                  <Server className="w-4 h-4 mr-2" />
                  {t.startServer}
                </>
              )}
            </Button>

            {/* 语言切换按钮 */}
            <div className="border-l pl-2 ml-2 flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLanguage}
                title={language === 'zh' ? 'Switch to English' : '切换到中文'}
              >
                <Languages className="w-4 h-4 mr-1" />
                {language === 'zh' ? 'EN' : '中文'}
              </Button>

              {/* 主题切换按钮 */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                title={isDarkMode ? t.lightMode : t.darkMode}
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* 侧边栏 */}
        <aside className="w-80 border-r bg-card/50 flex flex-col">
          {/* 项目选择 */}
          <Card className="m-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <FolderOpen className="w-4 h-4 mr-2" />
                {t.hexoProject}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex space-x-2">
                <Input
                  value={hexoPath}
                  placeholder={t.selectHexoDirectory}
                  readOnly
                  className="text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectHexoDirectory}
                  disabled={isLoading}
                >
                  {t.select}
                </Button>
                {hexoPath && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSavedPath}
                    disabled={isLoading}
                    title={t.clearSavedPath}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>

              {validationMessage && (
                <div className={`text-xs p-2 rounded ${
                  isValidHexoProject
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                  {validationMessage}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 文章列表 */}
          <Card className="m-4 flex-1 flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  {t.articleList}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    createNewPost();
                  }}
                  disabled={!isValidHexoProject || isLoading}
                  title={t.createNewArticle}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <PostList
                posts={posts}
                selectedPost={selectedPost}
                onPostSelect={selectPost}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>

          {/* 命令结果 */}
          {commandResult && (
            <Card className="m-4">
              <CardContent className="p-3">
                <div className="max-w-full overflow-hidden">
                  {renderCommandResult()}
                </div>
              </CardContent>
            </Card>
          )}
        </aside>

        {/* 主内容区域 */}
        <main className="flex-1 flex flex-col">
          {mainView === 'posts' ? (
            selectedPost ? (
              <div className="flex-1 flex flex-col">
                {/* 文章操作栏 */}
                <div className="border-b p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-lg font-semibold">{selectedPost.name}</h2>
                    <Badge variant="outline">
                      {selectedPost.size} bytes
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={savePost}
                      disabled={isLoading}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      保存
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={deletePost}
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      删除
                    </Button>
                  </div>
                </div>

                {/* 编辑器区域 */}
                <div className="flex-1">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="editor" className="flex items-center">
                        <Edit className="w-4 h-4 mr-2" />
                        {t.edit}
                      </TabsTrigger>
                      <TabsTrigger value="preview" className="flex items-center">
                        <Eye className="w-4 h-4 mr-2" />
                        {t.preview}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="editor" className="h-full m-0">
                      <MarkdownEditor
                        value={postContent}
                        onChange={setPostContent}
                        isLoading={isLoading}
                        language={language}
                      />
                    </TabsContent>

                    <TabsContent value="preview" className="h-full m-0">
                      <div className="h-full overflow-auto">
                        <MarkdownPreview
                          content={postContent}
                          className="p-6"
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <FileText className="w-16 h-16 mx-auto text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900">
                    {isValidHexoProject ? t.selectArticleToEdit : t.selectProjectFirst}
                  </h3>
                  <p className="text-gray-500">
                    {isValidHexoProject
                      ? t.selectFromListOrCreate
                      : t.clickSelectButton
                    }
                  </p>
                </div>
              </div>
            )
          ) : (
            /* 配置视图 */
            <div className="flex-1 p-6 overflow-auto">
              <HexoConfig
                hexoPath={hexoPath}
                onConfigUpdate={() => {
                  setCommandResult({
                    success: true,
                    stdout: '配置已更新'
                  });
                }}
              />
            </div>
          )}
        </main>
      </div>

      {/* 创建文章对话框 */}
      <CreatePostDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onConfirm={handleCreatePostConfirm}
        isLoading={isLoading}
      />
    </div>
  );
}