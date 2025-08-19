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
import { TagCloud } from '@/components/tag-cloud';
import { PublishStats } from '@/components/publish-stats';
import { PanelSettings } from '@/components/panel-settings';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

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
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [currentFilter, setCurrentFilter] = useState<{ type: 'tag' | 'category'; value: string } | null>(null);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [allTagsForCloud, setAllTagsForCloud] = useState<string[]>([]);
  // 面板设置相关状态
  const [postsPerPage, setPostsPerPage] = useState<number>(15); // 默认每页显示15篇文章
  const [currentPage, setCurrentPage] = useState<number>(1); // 当前页码
  const [autoSaveInterval, setAutoSaveInterval] = useState<number>(3); // 默认自动保存间隔为3分钟
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null); // 自动保存定时器
  
  // 更新检查相关状态
  const [updateInfo, setUpdateInfo] = useState<any>(null);
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [updateCheckInProgress, setUpdateCheckInProgress] = useState<boolean>(false);
  const [autoCheckUpdates, setAutoCheckUpdates] = useState<boolean>(true);

  // 命令输出框的大小状态
  const [outputBoxHeight, setOutputBoxHeight] = useState<number>(128); // 默认高度 32 * 4 = 128px
  const [outputBoxWidth, setOutputBoxWidth] = useState<number>(320); // 默认宽度 80 * 4 = 320px
  const [isResizing, setIsResizing] = useState<{ type: 'height' | 'width' | null }>({ type: null });

  // 获取当前语言的文本
  const t = getTexts(language);
  
  // 初始化 toast hook
  const { toast } = useToast();

  // 检查是否在Electron环境中
  const isElectron = typeof window !== 'undefined' && window.require;

  // 处理每页显示文章数量变化
  const handlePostsPerPageChange = (value: number) => {
    setPostsPerPage(value);
    // 重置到第一页
    setCurrentPage(1);
  };

  // 处理自动保存间隔变化
  const handleAutoSaveIntervalChange = (value: number) => {
    setAutoSaveInterval(value);
    // 重新设置自动保存定时器
    setupAutoSaveTimer();
  };

  // 设置自动保存定时器
  const setupAutoSaveTimer = () => {
    // 清除现有定时器
    if (autoSaveTimer) {
      clearInterval(autoSaveTimer);
      setAutoSaveTimer(null);
    }

    // 设置新的定时器
    if (selectedPost && postContent) {
      const timer = setInterval(() => {
        savePost();
      }, autoSaveInterval * 60 * 1000); // 转换为毫秒
      setAutoSaveTimer(timer);
    }
  };

  // 当postContent变化时重置自动保存定时器
  useEffect(() => {
    if (selectedPost && postContent) {
      setupAutoSaveTimer();
    }
  }, [postContent]);

  // 组件卸载时清除自动保存定时器
  useEffect(() => {
    return () => {
      if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
      }
    };
  }, [autoSaveTimer]);

  // 当selectedPost变化时重置自动保存定时器
  useEffect(() => {
    if (selectedPost) {
      setupAutoSaveTimer();
    } else {
      // 如果没有选中的文章，清除自动保存定时器
      if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
        setAutoSaveTimer(null);
      }
    }
  }, [selectedPost]);

  // 当autoSaveInterval变化时重置自动保存定时器
  useEffect(() => {
    if (selectedPost && postContent) {
      setupAutoSaveTimer();
    }
  }, [autoSaveInterval]);

  // 组件加载时，尝试从localStorage加载上次选择的路径和语言设置，并检查更新
  useEffect(() => {
    const loadSavedSettings = async () => {
      // 从localStorage加载自动更新设置
      if (typeof window !== 'undefined') {
        const savedAutoCheckUpdates = localStorage.getItem('auto-check-updates');
        if (savedAutoCheckUpdates !== null) {
          setAutoCheckUpdates(savedAutoCheckUpdates === 'true');
        }
      }
      
      // 检查更新
      if (autoCheckUpdates) {
        await checkForUpdates(true); // 启动时静默检查
      }
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

        // 加载每页显示文章数量设置
        const savedPostsPerPage = localStorage.getItem('posts-per-page');
        if (savedPostsPerPage) {
          const value = parseInt(savedPostsPerPage, 10);
          if (!isNaN(value) && value >= 1 && value <= 100) {
            setPostsPerPage(value);
          }
        }

        // 加载自动保存间隔设置
        const savedAutoSaveInterval = localStorage.getItem('auto-save-interval');
        if (savedAutoSaveInterval) {
          const value = parseInt(savedAutoSaveInterval, 10);
          if (!isNaN(value) && value >= 1 && value <= 60) {
            setAutoSaveInterval(value);
          }
        } else {
          // 如果没有保存的设置，使用默认值3分钟
          setAutoSaveInterval(3);
        }

        // 加载项目路径
        const savedPath = localStorage.getItem('hexo-project-path');
        if (savedPath && isElectron) {
          setHexoPath(savedPath);
          await validateHexoProject(savedPath);
        }
      }
      
      // 检查更新
      await checkForUpdates(true); // 启动时静默检查
    };

    loadSavedSettings();
  }, [isElectron]);

  // 监听筛选条件变化
  useEffect(() => {
    applyFilter();
  }, [currentFilter, posts]);

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
  
  // 处理自动更新设置变化
  const handleAutoCheckUpdatesChange = (value: boolean) => {
    setAutoCheckUpdates(value);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('auto-check-updates', value.toString());
    }
  };
  
  // 检查更新
  const checkForUpdates = async (silent = false) => {
    if (!isElectron) return;
    
    if (!silent) {
      setUpdateCheckInProgress(true);
    }
    
    try {
      const { ipcRenderer } = window.require('electron');
      const result = await ipcRenderer.invoke('check-for-updates');
      
      if (result.success) {
        setUpdateInfo(result);
        setUpdateAvailable(result.updateAvailable);
        
        // 如果有更新且不是静默检查，显示通知
        if (result.updateAvailable && !silent) {
          toast({
            title: '发现新版本',
            description: `新版本 ${result.latestVersion} 已发布`,
            variant: 'default',
          });
        } else if (!result.updateAvailable && !silent) {
          toast({
            title: '已是最新版本',
            description: `当前版本 ${result.currentVersion} 已是最新`,
            variant: 'success',
          });
        }
        
        // 如果是静默检查且有更新，显示通知
        if (result.updateAvailable && silent) {
          toast({
            title: '发现新版本',
            description: `新版本 ${result.latestVersion} 已发布，点击设置查看详情`,
            variant: 'default',
          });
        }
      } else if (!silent) {
        toast({
          title: '检查更新失败',
          description: result.error,
          variant: 'error',
        });
      }
    } catch (error) {
      console.error('检查更新失败:', error);
      if (!silent) {
        toast({
          title: '检查更新失败',
          description: error instanceof Error ? error.message : '未知错误',
          variant: 'error',
        });
      }
    } finally {
      if (!silent) {
        setUpdateCheckInProgress(false);
      }
    }
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

  // 提取文章中的标签和分类
  const extractTagsAndCategories = async (posts: Post[]) => {
    if (!isElectron) return;
    
    const tagsSet = new Set<string>();
    const categoriesSet = new Set<string>();
    const allTagsList: string[] = []; // 收集所有标签（包括重复的）用于标签云
    
    try {
      const { ipcRenderer } = window.require('electron');
      
      for (const post of posts) {
        try {
          // 读取文件内容
          const content = await ipcRenderer.invoke('read-file', post.path);
          
          // 解析front matter
          const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
          if (frontMatterMatch) {
            const frontMatter = frontMatterMatch[1];
            
            // 提取标签
            const tagsMatch = frontMatter.match(/^tags:\s*([\s\S]*?)(?=\n\w|\n*$)/m);
            if (tagsMatch) {
              const tags = tagsMatch[1].split('\n')
                .map(line => line.trim().replace(/^\-\s*/, ''))
                .filter(tag => tag);
              tags.forEach(tag => {
                tagsSet.add(tag);
                allTagsList.push(tag); // 添加到所有标签列表
              });
            }
            
            // 提取分类
            const categoriesMatch = frontMatter.match(/^categories:\s*([\s\S]*?)(?=\n\w|\n*$)/m);
            if (categoriesMatch) {
              const categories = categoriesMatch[1].split('\n')
                .map(line => line.trim().replace(/^\-\s*/, ''))
                .filter(cat => cat);
              categories.forEach(category => categoriesSet.add(category));
            }
          }
        } catch (error) {
          console.error(`读取文章 ${post.name} 失败:`, error);
        }
      }
      
      setAvailableTags(Array.from(tagsSet));
      setAvailableCategories(Array.from(categoriesSet));
      setAllTagsForCloud(allTagsList); // 设置所有标签列表
    } catch (error) {
      console.error('提取标签和分类失败:', error);
    }
  };

  // 应用筛选
  const applyFilter = async () => {
    if (!currentFilter) {
      setFilteredPosts(posts);
      return;
    }
    
    setIsLoading(true);
    try {
      const { ipcRenderer } = window.require('electron');
      const filtered: Post[] = [];
      
      for (const post of posts) {
        try {
          // 读取文件内容
          const content = await ipcRenderer.invoke('read-file', post.path);
          
          // 解析front matter
          const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
          if (frontMatterMatch) {
            const frontMatter = frontMatterMatch[1];
            
            if (currentFilter.type === 'tag') {
              // 检查标签
              const tagsMatch = frontMatter.match(/^tags:\s*([\s\S]*?)(?=\n\w|\n*$)/m);
              if (tagsMatch) {
                const tags = tagsMatch[1].split('\n')
                  .map(line => line.trim().replace(/^\-\s*/, ''))
                  .filter(tag => tag);
                if (tags.includes(currentFilter.value)) {
                  filtered.push(post);
                }
              }
            } else if (currentFilter.type === 'category') {
              // 检查分类
              const categoriesMatch = frontMatter.match(/^categories:\s*([\s\S]*?)(?=\n\w|\n*$)/m);
              if (categoriesMatch) {
                const categories = categoriesMatch[1].split('\n')
                  .map(line => line.trim().replace(/^\-\s*/, ''))
                  .filter(cat => cat);
                if (categories.includes(currentFilter.value)) {
                  filtered.push(post);
                }
              }
            }
          }
        } catch (error) {
          console.error(`读取文章 ${post.name} 失败:`, error);
        }
      }
      
      setFilteredPosts(filtered);
    } catch (error) {
      console.error('应用筛选失败:', error);
      setFilteredPosts(posts);
    } finally {
      setIsLoading(false);
    }
  };

  // 按标签筛选
  const filterByTag = (tag: string) => {
    setCurrentFilter({ type: 'tag', value: tag });
    // 重置页码到第一页
    setCurrentPage(1);
  };

  // 按分类筛选
  const filterByCategory = (category: string) => {
    setCurrentFilter({ type: 'category', value: category });
    // 重置页码到第一页
    setCurrentPage(1);
  };

  // 清除筛选
  const clearFilter = () => {
    setCurrentFilter(null);
    // 重置页码到第一页
    setCurrentPage(1);
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
      setFilteredPosts(markdownFiles);
      
      // 提取标签和分类
      await extractTagsAndCategories(markdownFiles);
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
        // 显示成功通知
        toast({
          title: '成功',
          description: '文章创建成功',
          variant: 'success',
        });
        
        // 如果有额外的标签、分类或摘要，需要更新文件
        if (postData.tags.length > 0 || postData.categories.length > 0 || postData.excerpt) {
          await updatePostFrontMatter(postData);
        }

        // 延迟一点再加载文章列表，确保文件系统操作完成
        setTimeout(async () => {
          await loadPosts(hexoPath);
        }, 500);
      } else {
        // 显示失败通知
        toast({
          title: '失败',
          description: '文章创建失败',
          variant: 'error',
        });
      }
    } catch (error) {
      console.error('创建文章失败:', error);
      setCommandResult({
        success: false,
        error: '创建文章失败: ' + (error?.message || '未知错误')
      });
      
      // 显示错误通知
      toast({
        title: '失败',
        description: '文章创建失败',
        variant: 'error',
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
          frontMatter += `\\ntags:\\n${tagsString}`;
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
      // 选择文章后设置自动保存定时器
      setupAutoSaveTimer();
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
      
      // 显示成功通知
      toast({
        title: '成功',
        description: '文章保存成功',
        variant: 'success',
      });
    } catch (error) {
      console.error('保存文章失败:', error);
      setCommandResult({
        success: false,
        error: '保存文章失败: ' + error.message
      });
      
      // 显示错误通知
      toast({
        title: '失败',
        description: '文章保存失败',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
      // 保存文章后重置自动保存定时器
      setupAutoSaveTimer();
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
      
      // 显示成功通知
      toast({
        title: '成功',
        description: '文章删除成功',
        variant: 'success',
      });
    } catch (error) {
      console.error('删除文章失败:', error);
      setCommandResult({
        success: false,
        error: '删除文章失败: ' + error.message
      });
      
      // 显示错误通知
      toast({
        title: '失败',
        description: '文章删除失败',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 批量删除文章
  const deletePosts = async (postsToDelete: Post[]) => {
    if (!isElectron || postsToDelete.length === 0) return;

    if (!confirm(`确定要删除选中的 ${postsToDelete.length} 篇文章吗？此操作不可撤销。`)) return;

    setIsLoading(true);
    try {
      const { ipcRenderer } = window.require('electron');

      // 逐个删除文章
      for (const post of postsToDelete) {
        await ipcRenderer.invoke('delete-file', post.path);
      }

      setCommandResult({
        success: true,
        stdout: `成功删除 ${postsToDelete.length} 篇文章`
      });

      // 如果当前选中的文章在被删除的文章中，清空选择
      if (selectedPost && postsToDelete.some(p => p.path === selectedPost.path)) {
        setSelectedPost(null);
        setPostContent('');
      }

      await loadPosts(hexoPath);
      
      // 显示成功通知
      toast({
        title: '成功',
        description: `成功删除 ${postsToDelete.length} 篇文章`,
        variant: 'success',
      });
    } catch (error) {
      console.error('批量删除文章失败:', error);
      setCommandResult({
        success: false,
        error: '批量删除文章失败: ' + error.message
      });
      
      // 显示错误通知
      toast({
        title: '失败',
        description: '批量删除文章失败',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 批量添加标签到文章
  const addTagsToPosts = async (postsToUpdate: Post[], tags: string[]) => {
    if (!isElectron || postsToUpdate.length === 0 || tags.length === 0) return;

    setIsLoading(true);
    try {
      const { ipcRenderer } = window.require('electron');
      let successCount = 0;

      // 逐个更新文章
      for (const post of postsToUpdate) {
        try {
          // 读取现有文件内容
          let content = await ipcRenderer.invoke('read-file', post.path);

          // 解析front matter
          const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
          if (frontMatterMatch) {
            let frontMatter = frontMatterMatch[1];

            // 检查是否已有tags字段
            const tagsMatch = frontMatter.match(/^tags:\s*([\s\S]*?)(?=\n\w|\n*$)/m);

            if (tagsMatch) {
              // 已有tags字段，添加新标签
              const existingTags = tagsMatch[1].split('\n')
                .map(line => line.trim().replace(/^-\s*/, ''))
                .filter(tag => tag);

              // 合并标签，去重
              const allTags = [...new Set([...existingTags, ...tags])];
              const tagsString = allTags.map(tag => `  - ${tag}`).join('\n');

              // 替换原有tags字段
              frontMatter = frontMatter.replace(/^tags:\s*([\s\S]*?)(?=\n\w|\n*$)/m, `tags:\n${tagsString}`);
            } else {
              // 没有tags字段，添加新字段
              const tagsString = tags.map(tag => `  - ${tag}`).join('\n');
              frontMatter += `\\ntags:\\n${tagsString}`;
            }

            // 重新构建文件内容
const newContent = content.replace(/^---\n[\s\S]*?\n---/, `---\n${frontMatter}\n---`);
            // 写回文件
            await ipcRenderer.invoke('write-file', post.path, newContent);
            successCount++;
          }
        } catch (error) {
          console.error(`更新文章 ${post.name} 失败:`, error);
        }
      }

      setCommandResult({
        success: true,
        stdout: `成功为 ${successCount}/${postsToUpdate.length} 篇文章添加标签`
      });

      // 如果当前选中的文章在被更新的文章中，重新加载内容
      if (selectedPost && postsToUpdate.some(p => p.path === selectedPost.path)) {
        const content = await ipcRenderer.invoke('read-file', selectedPost.path);
        setPostContent(content);
      }
    } catch (error) {
      console.error('批量添加标签失败:', error);
      setCommandResult({
        success: false,
        error: '批量添加标签失败: ' + error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 批量添加分类到文章
  const addCategoriesToPosts = async (postsToUpdate: Post[], categories: string[]) => {
    if (!isElectron || postsToUpdate.length === 0 || categories.length === 0) return;

    setIsLoading(true);
    try {
      const { ipcRenderer } = window.require('electron');
      let successCount = 0;

      // 逐个更新文章
      for (const post of postsToUpdate) {
        try {
          // 读取现有文件内容
          let content = await ipcRenderer.invoke('read-file', post.path);

          // 解析front matter
          const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
          if (frontMatterMatch) {
            let frontMatter = frontMatterMatch[1];

            // 检查是否已有categories字段
            const categoriesMatch = frontMatter.match(/^categories:\s*([\s\S]*?)(?=\n\w|\n*$)/m);

            if (categoriesMatch) {
              // 已有categories字段，添加新分类
              const existingCategories = categoriesMatch[1].split('\n')
                .map(line => line.trim().replace(/^-\s*/, ''))
                .filter(cat => cat);

              // 合并分类，去重
              const allCategories = [...new Set([...existingCategories, ...categories])];
              const categoriesString = allCategories.map(cat => `  - ${cat}`).join('\n');

              // 替换原有categories字段
              frontMatter = frontMatter.replace(/^categories:\s*([\s\S]*?)(?=\n\w|\n*$)/m, `categories:\n${categoriesString}`);
            } else {
              // 没有categories字段，添加新字段
              const categoriesString = categories.map(cat => `  - ${cat}`).join('\n');
              frontMatter += `\ncategories:\n${categoriesString}`;
            }

            // 重新构建文件内容
const newContent = content.replace(/^---\n[\s\S]*?\n---/, `---\n${frontMatter}\n---`);


            // 写回文件
            await ipcRenderer.invoke('write-file', post.path, newContent);
            successCount++;
          }
        } catch (error) {
          console.error(`更新文章 ${post.name} 失败:`, error);
        }
      }

      setCommandResult({
        success: true,
        stdout: `成功为 ${successCount}/${postsToUpdate.length} 篇文章添加分类`
      });

      // 如果当前选中的文章在被更新的文章中，重新加载内容
      if (selectedPost && postsToUpdate.some(p => p.path === selectedPost.path)) {
        const content = await ipcRenderer.invoke('read-file', selectedPost.path);
        setPostContent(content);
      }
    } catch (error) {
      console.error('批量添加分类失败:', error);
      setCommandResult({
        success: false,
        error: '批量添加分类失败: ' + error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 删除单篇文章
  const deleteSinglePost = async (postToDelete: Post) => {
    if (!isElectron || !postToDelete) return;

    if (!confirm(`确定要删除文章 "${postToDelete.name}" 吗？此操作不可撤销。`)) return;

    setIsLoading(true);
    try {
      const { ipcRenderer } = window.require('electron');
      await ipcRenderer.invoke('delete-file', postToDelete.path);

      setCommandResult({
        success: true,
        stdout: '文章删除成功'
      });

      // 如果删除的是当前选中的文章，清空选择
      if (selectedPost && selectedPost.path === postToDelete.path) {
        setSelectedPost(null);
        setPostContent('');
      }
      
      await loadPosts(hexoPath);
      
      // 显示成功通知
      toast({
        title: '成功',
        description: '文章删除成功',
        variant: 'success',
      });
    } catch (error) {
      console.error('删除文章失败:', error);
      setCommandResult({
        success: false,
        error: '删除文章失败: ' + error.message
      });
      
      // 显示错误通知
      toast({
        title: '失败',
        description: '删除文章失败',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 为单篇文章添加标签
  const addTagsToPost = async (postToUpdate: Post, tags: string[]) => {
    if (!isElectron || !postToUpdate || tags.length === 0) return;

    setIsLoading(true);
    try {
      const { ipcRenderer } = window.require('electron');
      
      // 读取现有文件内容
      let content = await ipcRenderer.invoke('read-file', postToUpdate.path);

      // 解析front matter
      const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (frontMatterMatch) {
        let frontMatter = frontMatterMatch[1];

        // 检查是否已有tags字段
        const tagsMatch = frontMatter.match(/^tags:\s*([\s\S]*?)(?=\n\w|\n*$)/m);
        
        if (tagsMatch) {
          // 已有tags字段，添加新标签
          const existingTags = tagsMatch[1].split('\n')
            .map(line => line.trim().replace(/^\-\s*/, ''))
            .filter(tag => tag);
          
          // 合并标签，去重
          const allTags = [...new Set([...existingTags, ...tags])];
          const tagsString = allTags.map(tag => `  - ${tag}`).join('\n');
          
          // 替换原有tags字段
          frontMatter = frontMatter.replace(/^tags:\s*([\s\S]*?)(?=\n\w|\n*$)/m, `tags:\n${tagsString}`);
        } else {
          // 没有tags字段，添加新字段
          const tagsString = tags.map(tag => `  - ${tag}`).join('\n');
          frontMatter += `\ntags:\n${tagsString}`;
        }

        // 重新构建文件内容
        const newContent = content.replace(/^---\n([\s\S]*?)\n---/, `---\n${frontMatter}\n---`);

        // 写回文件
        await ipcRenderer.invoke('write-file', postToUpdate.path, newContent);

        setCommandResult({
          success: true,
          stdout: '标签添加成功'
        });

        // 如果更新的是当前选中的文章，重新加载内容
        if (selectedPost && selectedPost.path === postToUpdate.path) {
          const content = await ipcRenderer.invoke('read-file', selectedPost.path);
          setPostContent(content);
        }
      }
    } catch (error) {
      console.error('添加标签失败:', error);
      setCommandResult({
        success: false,
        error: '添加标签失败: ' + error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 为单篇文章添加分类
  const addCategoriesToPost = async (postToUpdate: Post, categories: string[]) => {
    if (!isElectron || !postToUpdate || categories.length === 0) return;

    setIsLoading(true);
    try {
      const { ipcRenderer } = window.require('electron');
      
      // 读取现有文件内容
      let content = await ipcRenderer.invoke('read-file', postToUpdate.path);

      // 解析front matter
      const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (frontMatterMatch) {
        let frontMatter = frontMatterMatch[1];

        // 检查是否已有categories字段
        const categoriesMatch = frontMatter.match(/^categories:\s*([\s\S]*?)(?=\n\w|\n*$)/m);
        
        if (categoriesMatch) {
          // 已有categories字段，添加新分类
          const existingCategories = categoriesMatch[1].split('\n')
            .map(line => line.trim().replace(/^\-\s*/, ''))
            .filter(cat => cat);
          
          // 合并分类，去重
          const allCategories = [...new Set([...existingCategories, ...categories])];
          const categoriesString = allCategories.map(cat => `  - ${cat}`).join('\n');
          
          // 替换原有categories字段
          frontMatter = frontMatter.replace(/^categories:\s*([\s\S]*?)(?=\n\w|\n*$)/m, `categories:\n${categoriesString}`);
        } else {
          // 没有categories字段，添加新字段
          const categoriesString = categories.map(cat => `  - ${cat}`).join('\n');
          frontMatter += `\ncategories:\n${categoriesString}`;
        }

        // 重新构建文件内容
        const newContent = content.replace(/^---\n([\s\S]*?)\n---/, `---\n${frontMatter}\n---`);

        // 写回文件
        await ipcRenderer.invoke('write-file', postToUpdate.path, newContent);

        setCommandResult({
          success: true,
          stdout: '分类添加成功'
        });

        // 如果更新的是当前选中的文章，重新加载内容
        if (selectedPost && selectedPost.path === postToUpdate.path) {
          const content = await ipcRenderer.invoke('read-file', selectedPost.path);
          setPostContent(content);
        }
      }
    } catch (error) {
      console.error('添加分类失败:', error);
      setCommandResult({
        success: false,
        error: '添加分类失败: ' + error.message
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
      
      // 显示通知
      if (result.success) {
        let message = '命令执行成功';
        if (command === 'clean') message = '清理缓存成功';
        else if (command === 'generate') message = '生成静态文章成功';
        else if (command === 'deploy') message = '部署成功';
        
        toast({
          title: '成功',
          description: message,
          variant: 'success',
        });
      } else {
        let message = '命令执行失败';
        if (command === 'clean') message = '清理缓存失败';
        else if (command === 'generate') message = '生成静态文章失败';
        else if (command === 'deploy') message = '部署失败';
        
        toast({
          title: '失败',
          description: message,
          variant: 'error',
        });
      }
    } catch (error) {
      console.error('执行命令失败:', error);
      setCommandResult({
        success: false,
        error: '执行命令失败: ' + error.message
      });
      
      // 显示错误通知
      toast({
        title: '失败',
        description: '执行命令失败',
        variant: 'error',
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

        // 显示成功通知
        toast({
          title: '成功',
          description: 'Hexo服务器已启动',
          variant: 'success',
        });

        // 打开浏览器预览
        setTimeout(() => {
          ipcRenderer.invoke('open-url', 'http://localhost:4000');
        }, 2000);
      } else {
        setCommandResult(result);
        
        // 显示错误通知
        toast({
          title: '失败',
          description: 'Hexo服务器启动失败',
          variant: 'error',
        });
      }
    } catch (error) {
      console.error('启动服务器失败:', error);
      setCommandResult({
        success: false,
        error: '启动服务器失败: ' + error.message
      });
      
      // 显示错误通知
      toast({
        title: '失败',
        description: '启动服务器失败',
        variant: 'error',
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
        
        // 显示成功通知
        toast({
          title: '成功',
          description: 'Hexo服务器已停止',
          variant: 'success',
        });
      } else {
        setCommandResult(result);
        
        // 显示失败通知
        toast({
          title: '失败',
          description: 'Hexo服务器停止失败',
          variant: 'error',
        });
      }
    } catch (error) {
      console.error('停止服务器失败:', error);
      setCommandResult({
        success: false,
        error: '停止服务器失败: ' + error.message
      });
      
      // 显示错误通知
      toast({
        title: '失败',
        description: '停止服务器失败',
        variant: 'error',
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
            <h1 className="text-xl font-bold">Hexo Hub</h1>
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

          {/* 文章列表按钮 */}
          <Card className="m-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                {t.articleList}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setSelectedPost(null);
                  setMainView('posts');
                }}
                disabled={!isValidHexoProject || isLoading}
              >
                <FileText className="w-4 h-4 mr-2" />
                {t.viewArticleList}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  createNewPost();
                }}
                disabled={!isValidHexoProject || isLoading}
                title={t.createNewArticle}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t.createNewArticle}
              </Button>
            </CardContent>
          </Card>

          {/* 文章统计 */}
          <Card className="m-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                {t.articleStatistics}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setSelectedPost(null);
                  setMainView('statistics');
                }}
                disabled={!isValidHexoProject || isLoading}
              >
                <FileText className="w-4 h-4 mr-2" />
                {t.viewTagCloud}
              </Button>
            </CardContent>
          </Card>

          {/* 面板设置 */}
          <Card className="m-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                面板设置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setSelectedPost(null);
                  setMainView('settings');
                }}
                disabled={!isValidHexoProject || isLoading}
              >
                <Settings className="w-4 h-4 mr-2" />
                面板设置
              </Button>
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
          {mainView === 'statistics' ? (
            <div className="flex-1 p-6 overflow-auto">
              <TagCloud tags={allTagsForCloud} language={language} />
              <PublishStats posts={posts} language={language} />
            </div>
          ) : mainView === 'settings' ? (
            <div className="flex-1 p-6 overflow-auto">
              <PanelSettings
                updateAvailable={updateAvailable}
                onUpdateCheck={() => checkForUpdates(false)}
                updateCheckInProgress={updateCheckInProgress}
                autoCheckUpdates={autoCheckUpdates}
                onAutoCheckUpdatesChange={handleAutoCheckUpdatesChange} 
              autoSaveInterval={autoSaveInterval}
              onAutoSaveIntervalChange={handleAutoSaveIntervalChange}

                postsPerPage={postsPerPage}
                onPostsPerPageChange={handlePostsPerPageChange}
              />
            </div>
          ) : mainView === 'posts' ? (
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
                      onClick={() => {
                        setSelectedPost(null);
                      }}
                      disabled={isLoading}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      返回列表
                    </Button>
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

                    <TabsContent value="editor" className="h-full m-0 overflow-hidden">
                      <MarkdownEditor
                        value={postContent}
                        onChange={setPostContent}
                        onSave={savePost}
                        isLoading={isLoading}
                        language={language}
                      />
                    </TabsContent>

                    <TabsContent value="preview" className="h-full m-0 overflow-hidden">
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
              <div className="flex-1 flex flex-col">
                {/* 文章列表头部 */}
                <div className="border-b p-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">{t.articleList}</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      createNewPost();
                    }}
                    disabled={!isValidHexoProject || isLoading}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t.createNewArticle}
                  </Button>
                </div>

                {/* 文章列表内容 */}
                <div className="flex-1 p-6 overflow-auto">
                  {isValidHexoProject ? (
                    <PostList
                      posts={filteredPosts}
                      selectedPost={selectedPost}
                      onPostSelect={(post) => {
                        selectPost(post);
                      }}
                      isLoading={isLoading}
                      onDeletePosts={deletePosts}
                      onAddTagsToPosts={addTagsToPosts}
                      onAddCategoriesToPosts={addCategoriesToPosts}
                      onDeletePost={deleteSinglePost}
                      onAddTagsToPost={addTagsToPost}
                      onAddCategoriesToPost={addCategoriesToPost}
                      availableTags={availableTags}
                      availableCategories={availableCategories}
                      onFilterByTag={filterByTag}
                      onFilterByCategory={filterByCategory}
                      onClearFilter={clearFilter}
                      currentFilter={currentFilter}
                      currentPage={currentPage}
                      postsPerPage={postsPerPage}
                      onPageChange={setCurrentPage}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center space-y-4">
                        <FileText className="w-16 h-16 mx-auto text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900">
                          {t.selectProjectFirst}
                        </h3>
                        <p className="text-gray-500">
                          {t.clickSelectButton}
                        </p>
                      </div>
                    </div>
                  )}
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
      
      {/* 通知弹窗 */}
      <Toaster />
    </div>
  );
}