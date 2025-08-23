
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FolderOpen, Download, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreateHexoDialogProps {
  onCreateSuccess?: (path: string) => void;
  children: React.ReactNode;
}

interface CommandResult {
  success: boolean;
  stdout?: string;
  stderr?: string;
  error?: string;
}

export function CreateHexoDialog({ onCreateSuccess, children }: CreateHexoDialogProps) {
  const [open, setOpen] = useState(false);
  const [hexoPath, setHexoPath] = useState<string>('');
  const [folderName, setFolderName] = useState<string>('blog');
  const [useTaobaoMirror, setUseTaobaoMirror] = useState<boolean>(true);
  const [installDeployPlugin, setInstallDeployPlugin] = useState<boolean>(true);
  const [isInstalling, setIsInstalling] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [commandOutput, setCommandOutput] = useState<string>('');
  const [hexoInstalled, setHexoInstalled] = useState<boolean>(false);
  const [hexoVersion, setHexoVersion] = useState<string>('');
  const [npmInstalled, setNpmInstalled] = useState<boolean>(false);
  const [gitInstalled, setGitInstalled] = useState<boolean>(false);
  const [isCheckingEnvironment, setIsCheckingEnvironment] = useState<boolean>(true);

  const { toast } = useToast();

  // 检查是否在Electron环境中
  const isElectron = typeof window !== 'undefined' && window.require;

  // 检查环境
  useEffect(() => {
    if (open && isElectron) {
      checkEnvironment();
    }
  }, [open, isElectron]);

  const checkEnvironment = async () => {
    setIsCheckingEnvironment(true);
    setCommandOutput('正在检查环境...');

    try {
      const { ipcRenderer } = window.require('electron');

      // 检查npm
      setCommandOutput(prev => prev + '检查 npm...');
      const npmResult = await ipcRenderer.invoke('execute-command', 'npm -v');
      if (npmResult.success) {
        setNpmInstalled(true);
        setCommandOutput(prev => prev + `npm 已安装: ${npmResult.stdout}
`);
      } else {
        setCommandOutput(prev => prev + `npm 未安装: ${npmResult.stderr || npmResult.error}
`);
      }

      // 检查git
      setCommandOutput(prev => prev + '检查 git...');
      const gitResult = await ipcRenderer.invoke('execute-command', 'git --version');
      if (gitResult.success) {
        setGitInstalled(true);
        setCommandOutput(prev => prev + `git 已安装: ${gitResult.stdout}
`);
      } else {
        setCommandOutput(prev => prev + `git 未安装: ${gitResult.stderr || gitResult.error}
`);
      }

      // 检查hexo
      setCommandOutput(prev => prev + '检查 hexo...');
      const hexoResult = await ipcRenderer.invoke('execute-command', 'hexo -v');
      if (hexoResult.success) {
        setHexoInstalled(true);
        // 提取版本号
        const versionMatch = hexoResult.stdout.match(/hexo-cli?: ([0-9.]+)/);
        if (versionMatch) {
          setHexoVersion(versionMatch[1]);
        }
        setCommandOutput(prev => prev + `hexo 已安装: ${hexoResult.stdout}
`);
      } else {
        setCommandOutput(prev => prev + `hexo 未安装: ${hexoResult.stderr || hexoResult.error}
`);
      }
    } catch (error) {
      console.error('检查环境失败:', error);
      setCommandOutput(prev => prev + `检查环境失败: ${error.message}
`);
    } finally {
      setIsCheckingEnvironment(false);
    }
  };

  const selectDirectory = async () => {
    if (!isElectron) return;

    try {
      const { ipcRenderer } = window.require('electron');
      const selectedPath = await ipcRenderer.invoke('select-directory');

      if (selectedPath) {
        setHexoPath(selectedPath);
      }
    } catch (error) {
      console.error('选择目录失败:', error);
      toast({
        title: '选择目录失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'error',
      });
    }
  };

  const createHexoProject = async () => {
    if (!isElectron) return;
    if (!npmInstalled) {
      toast({
        title: '缺少依赖',
        description: '请先安装 npm',
        variant: 'error',
      });
      return;
    }
    if (!gitInstalled) {
      toast({
        title: '缺少依赖',
        description: '请先安装 git',
        variant: 'error',
      });
      return;
    }

    setIsInstalling(true);
    setProgress(0);
    setCommandOutput('开始创建 Hexo 项目...');

    try {
      const { ipcRenderer } = window.require('electron');
      const projectPath = `${hexoPath}/${folderName}`;

      // 设置淘宝镜像源
      if (useTaobaoMirror) {
        setProgress(10);
        setCommandOutput(prev => prev + '设置淘宝镜像源...');
        const mirrorResult = await ipcRenderer.invoke('execute-command', 'npm config set registry https://registry.npmmirror.com');
        if (!mirrorResult.success) {
          throw new Error(`设置镜像源失败: ${mirrorResult.stderr || mirrorResult.error}`);
        }
        setCommandOutput(prev => prev + '淘宝镜像源设置成功');
      }

      // 安装 hexo-cli（如果未安装）
      if (!hexoInstalled) {
        setProgress(20);
        setCommandOutput(prev => prev + '安装 hexo-cli...');
        const installHexoResult = await ipcRenderer.invoke('execute-command', 'npm install hexo-cli');
        if (!installHexoResult.success) {
          throw new Error(`安装 hexo-cli 失败: ${installHexoResult.stderr || installHexoResult.error}`);
        }
        setCommandOutput(prev => prev + `hexo-cli 安装成功
${installHexoResult.stdout}
`);
      }

      // 创建 hexo 项目
      setProgress(40);
      setCommandOutput(prev => prev + `创建 Hexo 项目到 ${projectPath}...
`);
      const initResult = await ipcRenderer.invoke('execute-command', `hexo init ${projectPath}`);
      if (!initResult.success) {
        throw new Error(`创建 Hexo 项目失败: ${initResult.stderr || initResult.error}`);
      }
      setCommandOutput(prev => prev + `Hexo 项目创建成功
${initResult.stdout}
`);

      // 进入项目目录（hexo init已经自动安装了依赖）
      setProgress(60);
      setCommandOutput(prev => prev + '项目依赖已自动安装');

      // 安装部署插件
      if (installDeployPlugin) {
        setProgress(80);
        setCommandOutput(prev => prev + '安装部署插件...');
        const installPluginResult = await ipcRenderer.invoke('execute-command', `cd ${projectPath} && npm install hexo-deployer-git --save`);
        if (!installPluginResult.success) {
          throw new Error(`安装部署插件失败: ${installPluginResult.stderr || installPluginResult.error}`);
        }
        setCommandOutput(prev => prev + `部署插件安装成功
${installPluginResult.stdout}
`);
      }

      setProgress(100);
      setCommandOutput(prev => prev + 'Hexo 项目创建完成!');

      toast({
        title: '创建成功',
        description: 'Hexo 项目已成功创建',
        variant: 'success',
      });

      // 通知父组件
      if (onCreateSuccess) {
        onCreateSuccess(projectPath);
      }

      // 关闭对话框
      setTimeout(() => setOpen(false), 1500);
    } catch (error) {
      console.error('创建 Hexo 项目失败:', error);
      setCommandOutput(prev => prev + `创建 Hexo 项目失败: ${error.message}
`);
      toast({
        title: '创建失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'error',
      });
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Download className="w-5 h-5 mr-2" />
            创建 Hexo 项目
          </DialogTitle>
          <DialogDescription>
            创建一个新的 Hexo 博客项目
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isCheckingEnvironment ? (
            <div className="space-y-2">
              <div className="flex items-center">
                <Info className="w-4 h-4 mr-2" />
                正在检查环境...
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-sm font-mono h-32 overflow-y-auto">
                {commandOutput}
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    {npmInstalled && gitInstalled ? (
                      hexoInstalled ? (
                        `Hexo 已安装 (版本: ${hexoVersion})，将跳过 Hexo 安装步骤`
                      ) : (
                        'Hexo 未安装，将自动安装 Hexo'
                      )
                    ) : (
                      '请先安装 npm 和 git'
                    )}
                  </AlertDescription>
                </Alert>

                <div className="space-y-1">
                  <Label htmlFor="hexo-path">Hexo 项目安装位置</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="hexo-path"
                      value={hexoPath}
                      placeholder="选择安装目录"
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={selectDirectory}
                      disabled={isInstalling}
                    >
                      <FolderOpen className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="folder-name">项目文件夹名称</Label>
                  <Input
                    id="folder-name"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    placeholder="blog"
                    disabled={isInstalling}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="taobao-mirror"
                    checked={useTaobaoMirror}
                    onCheckedChange={(checked) => setUseTaobaoMirror(!!checked)}
                    disabled={isInstalling}
                  />
                  <Label htmlFor="taobao-mirror">使用淘宝镜像源 (推荐)</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="deploy-plugin"
                    checked={installDeployPlugin}
                    onCheckedChange={(checked) => setInstallDeployPlugin(!!checked)}
                    disabled={isInstalling}
                  />
                  <Label htmlFor="deploy-plugin">安装部署插件 (hexo-deployer-git)</Label>
                </div>
              </div>

              {isInstalling && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>安装进度</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}

              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-sm font-mono h-48 overflow-y-auto">
                {commandOutput || '命令输出将显示在这里...'}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isInstalling}
          >
            {isCheckingEnvironment ? '取消' : '关闭'}
          </Button>
          {!isCheckingEnvironment && (
            <Button
              onClick={createHexoProject}
              disabled={isInstalling || !hexoPath || !npmInstalled || !gitInstalled}
            >
              {isInstalling ? '创建中...' : '创建项目'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
