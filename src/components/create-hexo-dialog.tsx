
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
import { Language, getTexts } from '@/utils/i18n';

interface CreateHexoDialogProps {
  onCreateSuccess?: (path: string) => void;
  children: React.ReactNode;
  language: Language;
}

interface CommandResult {
  success: boolean;
  stdout?: string;
  stderr?: string;
  error?: string;
}

export function CreateHexoDialog({ onCreateSuccess, children, language }: CreateHexoDialogProps) {
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
  const t = getTexts(language);

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
    setCommandOutput(t.checkingEnvironment);

    try {
      const { ipcRenderer } = window.require('electron');

      // 检查npm
      setCommandOutput(prev => prev + t.checkingNpm);
      const npmResult = await ipcRenderer.invoke('execute-command', 'npm -v');
      if (npmResult.success) {
        setNpmInstalled(true);
        setCommandOutput(prev => prev + t.npmInstalled.replace('{version}', npmResult.stdout));
      } else {
        setCommandOutput(prev => prev + t.npmNotInstalled.replace('{error}', npmResult.stderr || npmResult.error));
      }

      // 检查git
      setCommandOutput(prev => prev + t.checkingGit);
      const gitResult = await ipcRenderer.invoke('execute-command', 'git --version');
      if (gitResult.success) {
        setGitInstalled(true);
        setCommandOutput(prev => prev + t.gitInstalled.replace('{version}', gitResult.stdout));
      } else {
        setCommandOutput(prev => prev + t.gitNotInstalled.replace('{error}', gitResult.stderr || gitResult.error));
      }

      // 检查hexo
      setCommandOutput(prev => prev + t.checkingHexo);
      const hexoResult = await ipcRenderer.invoke('execute-command', 'hexo -v');
      if (hexoResult.success) {
        setHexoInstalled(true);
        // 提取版本号
        const versionMatch = hexoResult.stdout.match(/hexo-cli?: ([0-9.]+)/);
        if (versionMatch) {
          setHexoVersion(versionMatch[1]);
        }
        setCommandOutput(prev => prev + t.hexoInstalled.replace('{version}', hexoResult.stdout));
      } else {
        setCommandOutput(prev => prev + t.hexoNotInstalled.replace('{error}', hexoResult.stderr || hexoResult.error));
      }
    } catch (error) {
      console.error('检查环境失败:', error);
      setCommandOutput(prev => prev + t.environmentCheckFailed.replace('{error}', error instanceof Error ? error.message : String(error)));
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
        title: t.selectDirectoryFailed,
        description: error instanceof Error ? error.message : t.unknownError,
        variant: 'error',
      });
    }
  };

  const createHexoProject = async () => {
    if (!isElectron) return;
    if (!npmInstalled) {
      toast({
        title: t.missingDependency,
        description: t.pleaseInstallNpm,
        variant: 'error',
      });
      return;
    }
    if (!gitInstalled) {
      toast({
        title: t.missingDependency,
        description: t.pleaseInstallGit,
        variant: 'error',
      });
      return;
    }

    setIsInstalling(true);
    setProgress(0);
    setCommandOutput(t.creatingHexoProject.replace('{path}', `${hexoPath}/${folderName}`));

    try {
      const { ipcRenderer } = window.require('electron');
      const projectPath = `${hexoPath}/${folderName}`;

      // 设置淘宝镜像源
      if (useTaobaoMirror) {
        setProgress(10);
        setCommandOutput(prev => prev + t.settingTaobaoMirror);
        const mirrorResult = await ipcRenderer.invoke('execute-command', 'npm config set registry https://registry.npmmirror.com');
        if (!mirrorResult.success) {
          throw new Error(`${t.settingTaobaoMirror}: ${mirrorResult.stderr || mirrorResult.error}`);
        }
        setCommandOutput(prev => prev + t.taobaoMirrorSetSuccess);
      }

      // 安装 hexo-cli（如果未安装）
      if (!hexoInstalled) {
        setProgress(20);
        setCommandOutput(prev => prev + t.installingHexoCli);
        const installHexoResult = await ipcRenderer.invoke('execute-command', 'npm install hexo-cli');
        if (!installHexoResult.success) {
          throw new Error(`${t.installingHexoCli}: ${installHexoResult.stderr || installHexoResult.error}`);
        }
        setCommandOutput(prev => prev + t.hexoCliInstallSuccess + '\n' + installHexoResult.stdout);
      }

      // 创建 hexo 项目
      setProgress(40);
      setCommandOutput(prev => prev + t.creatingHexoProject.replace('{path}', projectPath));
      const initResult = await ipcRenderer.invoke('execute-command', `hexo init ${projectPath}`);
      if (!initResult.success) {
        throw new Error(`${t.creatingHexoProject}: ${initResult.stderr || initResult.error}`);
      }
      setCommandOutput(prev => prev + t.hexoProjectCreatedSuccess + '\n' + initResult.stdout);

      // 进入项目目录（hexo init已经自动安装了依赖）
      setProgress(60);
      setCommandOutput(prev => prev + t.dependenciesInstalled);

      // 安装部署插件
      if (installDeployPlugin) {
        setProgress(80);
        setCommandOutput(prev => prev + t.installingDeployPlugin);
        const installPluginResult = await ipcRenderer.invoke('execute-command', `cd ${projectPath} && npm install hexo-deployer-git --save`);
        if (!installPluginResult.success) {
          throw new Error(`${t.installingDeployPlugin}: ${installPluginResult.stderr || installPluginResult.error}`);
        }
        setCommandOutput(prev => prev + t.deployPluginInstallSuccess + '\n' + installPluginResult.stdout);
      }

      setProgress(100);
      setCommandOutput(prev => prev + t.hexoProjectCreationComplete);

      toast({
        title: t.createSuccess,
        description: t.hexoProjectCreatedSuccessfully,
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
      setCommandOutput(prev => prev + `${t.createFailed}: ${error instanceof Error ? error.message : String(error)}`);
      toast({
        title: t.createFailed,
        description: error instanceof Error ? error.message : t.unknownError,
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
      <DialogContent className="max-w-2xl bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Download className="w-5 h-5 mr-2" />
            {t.createHexoProject}
          </DialogTitle>
          <DialogDescription>
            {t.createHexoProjectDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isCheckingEnvironment ? (
            <div className="space-y-2">
              <div className="flex items-center">
                <Info className="w-4 h-4 mr-2" />
                {t.checkingEnvironment}
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-sm font-mono h-32 overflow-y-auto whitespace-pre-wrap">
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
                        t.hexoAlreadyInstalled.replace('{version}', hexoVersion)
                      ) : (
                        t.hexoNotInstalled
                      )
                    ) : (
                      t.installNpmAndGitFirst
                    )}
                  </AlertDescription>
                </Alert>

                <div className="space-y-1">
                  <Label htmlFor="hexo-path">{t.hexoProjectLocation}</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="hexo-path"
                      value={hexoPath}
                      placeholder={t.selectDirectory}
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
                  <Label htmlFor="folder-name">{t.projectFolderName}</Label>
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
                  <Label htmlFor="taobao-mirror">{t.useTaobaoMirrorRecommended}</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="deploy-plugin"
                    checked={installDeployPlugin}
                    onCheckedChange={(checked) => setInstallDeployPlugin(!!checked)}
                    disabled={isInstalling}
                  />
                  <Label htmlFor="deploy-plugin">{t.installDeployPluginDescription}</Label>
                </div>
              </div>

              {isInstalling && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t.installationProgress}</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}

              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-sm font-mono h-48 overflow-y-auto whitespace-pre-wrap">
                {commandOutput || t.commandOutput}
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
            {isCheckingEnvironment ? t.cancel : t.close}
          </Button>
          {!isCheckingEnvironment && (
            <Button
              onClick={createHexoProject}
              disabled={isInstalling || !hexoPath || !npmInstalled || !gitInstalled}
            >
              {isInstalling ? t.creating : t.createProject}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
