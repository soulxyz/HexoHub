
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UpdateChecker } from '@/components/update-checker';
import { getTexts } from '@/utils/i18n';

interface PanelSettingsProps {
  postsPerPage: number;
  onPostsPerPageChange: (value: number) => void;
  autoSaveInterval: number;
  onAutoSaveIntervalChange: (value: number) => void;
  updateAvailable?: boolean;
  onUpdateCheck?: () => void;
  updateCheckInProgress?: boolean;
  autoCheckUpdates?: boolean;
  onAutoCheckUpdatesChange?: (value: boolean) => void;
  editorMode: 'mode1' | 'mode2';
  onEditorModeChange: (mode: 'mode1' | 'mode2') => void;
  backgroundImage?: string;
  onBackgroundImageChange?: (value: string) => void;
  backgroundOpacity?: number;
  onBackgroundOpacityChange?: (value: number) => void;
  language: 'zh' | 'en';
  // 推送设置
  enablePush?: boolean;
  onEnablePushChange?: (value: boolean) => void;
  pushRepoUrl?: string;
  onPushRepoUrlChange?: (value: string) => void;
  pushBranch?: string;
  onPushBranchChange?: (value: string) => void;
  pushUsername?: string;
  onPushUsernameChange?: (value: string) => void;
  pushEmail?: string;
  onPushEmailChange?: (value: string) => void;
  // AI设置
  enableAI?: boolean;
  onEnableAIChange?: (value: boolean) => void;
  apiKey?: string;
  onApiKeyChange?: (value: string) => void;
  prompt?: string;
  onPromptChange?: (value: string) => void;
}

export function PanelSettings({ postsPerPage, onPostsPerPageChange, autoSaveInterval, onAutoSaveIntervalChange, updateAvailable, onUpdateCheck, updateCheckInProgress, autoCheckUpdates = true, onAutoCheckUpdatesChange, editorMode, onEditorModeChange, backgroundImage = '', onBackgroundImageChange, backgroundOpacity = 1, onBackgroundOpacityChange, language, enablePush = false, onEnablePushChange, pushRepoUrl = '', onPushRepoUrlChange, pushBranch = 'main', onPushBranchChange, pushUsername = '', onPushUsernameChange, pushEmail = '', onPushEmailChange, enableAI = false, onEnableAIChange, apiKey = '', onApiKeyChange, prompt = '你是一个灵感提示机器人，我是一个独立博客的博主，我想写一篇博客，请你给我一个可写内容的灵感，不要超过200字，不要分段', onPromptChange }: PanelSettingsProps) {
  // 当前应用版本，从package.json中获取
  const currentVersion = '2.4.0';
  // 获取当前语言的文本
  const t = getTexts(language);
  const [tempPostsPerPage, setTempPostsPerPage] = useState<number>(postsPerPage);
  const [tempAutoSaveInterval, setTempAutoSaveInterval] = useState<number>(autoSaveInterval);
  const [tempEditorMode, setTempEditorMode] = useState<'mode1' | 'mode2'>(editorMode);
  const [tempBackgroundImage, setTempBackgroundImage] = useState<string>(backgroundImage);
  const [tempBackgroundOpacity, setTempBackgroundOpacity] = useState<number>(backgroundOpacity);
  const [showWarningToast, setShowWarningToast] = useState<boolean>(false);
  // 推送设置相关状态
  const [tempEnablePush, setTempEnablePush] = useState<boolean>(enablePush);
  const [tempPushRepoUrl, setTempPushRepoUrl] = useState<string>(pushRepoUrl);
  const [tempPushBranch, setTempPushBranch] = useState<string>(pushBranch);
  const [tempPushUsername, setTempPushUsername] = useState<string>(pushUsername);
  const [tempPushEmail, setTempPushEmail] = useState<string>(pushEmail);
  // AI设置相关状态
  const [tempEnableAI, setTempEnableAI] = useState<boolean>(enableAI);
  const [tempApiKey, setTempApiKey] = useState<string>(apiKey);
  const [tempPrompt, setTempPrompt] = useState<string>(prompt);
  const { toast } = useToast();

  // 当传入的postsPerPage变化时，更新临时值
  useEffect(() => {
    setTempPostsPerPage(postsPerPage);
  }, [postsPerPage]);

  // 当传入的autoSaveInterval变化时，更新临时值
  useEffect(() => {
    setTempAutoSaveInterval(autoSaveInterval);
  }, [autoSaveInterval]);

  // 当传入的editorMode变化时，更新临时值
  useEffect(() => {
    setTempEditorMode(editorMode);
  }, [editorMode]);

  // 当传入的backgroundImage变化时，更新临时值
  useEffect(() => {
    setTempBackgroundImage(backgroundImage);
  }, [backgroundImage]);

  // 当传入的backgroundOpacity变化时，更新临时值
  useEffect(() => {
    setTempBackgroundOpacity(backgroundOpacity);
  }, [backgroundOpacity]);

  // 当传入的enablePush变化时，更新临时值
  useEffect(() => {
    setTempEnablePush(enablePush);
  }, [enablePush]);

  // 当传入的pushRepoUrl变化时，更新临时值
  useEffect(() => {
    setTempPushRepoUrl(pushRepoUrl);
  }, [pushRepoUrl]);

  // 当传入的pushBranch变化时，更新临时值
  useEffect(() => {
    setTempPushBranch(pushBranch);
  }, [pushBranch]);

  // 当传入的pushUsername变化时，更新临时值
  useEffect(() => {
    setTempPushUsername(pushUsername);
  }, [pushUsername]);

  // 当传入的pushEmail变化时，更新临时值
  useEffect(() => {
    setTempPushEmail(pushEmail);
  }, [pushEmail]);

  // 当传入的enableAI变化时，更新临时值
  useEffect(() => {
    setTempEnableAI(enableAI);
  }, [enableAI]);

  // 当传入的apiKey变化时，更新临时值
  useEffect(() => {
    setTempApiKey(apiKey);
  }, [apiKey]);

  // 当传入的prompt变化时，更新临时值
  useEffect(() => {
    setTempPrompt(prompt);
  }, [prompt]);

  // 保存设置
  const saveSettings = () => {
    if (tempPostsPerPage < 1 || tempPostsPerPage > 100) {
      toast({
        title: t.error,
        description: t.postsPerPageRangeError || '每页显示文章数量必须在1-100之间',
        variant: 'error',
      });
      return;
    }

    if (tempAutoSaveInterval === "" || tempAutoSaveInterval < 1 || tempAutoSaveInterval > 60) {
      toast({
        title: t.error,
        description: t.autoSaveIntervalRangeError,
        variant: 'error',
      });
      return;
    }

    onPostsPerPageChange(tempPostsPerPage);
    onAutoSaveIntervalChange(tempAutoSaveInterval === "" ? 3 : tempAutoSaveInterval);
    onEditorModeChange(tempEditorMode);
    if (onBackgroundImageChange) onBackgroundImageChange(tempBackgroundImage);
    if (onBackgroundOpacityChange) onBackgroundOpacityChange(tempBackgroundOpacity);
    // 保存推送设置
    if (onEnablePushChange) onEnablePushChange(tempEnablePush);
    if (onPushRepoUrlChange) onPushRepoUrlChange(tempPushRepoUrl);
    if (onPushBranchChange) onPushBranchChange(tempPushBranch);
    if (onPushUsernameChange) onPushUsernameChange(tempPushUsername);
    if (onPushEmailChange) onPushEmailChange(tempPushEmail);
    // 保存AI设置
    if (onEnableAIChange) onEnableAIChange(tempEnableAI);
    if (onApiKeyChange) onApiKeyChange(tempApiKey);
    if (onPromptChange) onPromptChange(tempPrompt);

    // 保存到localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('posts-per-page', tempPostsPerPage.toString());
      if (tempAutoSaveInterval !== "") {
        localStorage.setItem('auto-save-interval', tempAutoSaveInterval.toString());
      }
      localStorage.setItem('editor-mode', tempEditorMode);
      localStorage.setItem('background-image', tempBackgroundImage);
      localStorage.setItem('background-opacity', tempBackgroundOpacity.toString());
      // 保存推送设置
      localStorage.setItem('enable-push', tempEnablePush.toString());
      localStorage.setItem('push-repo-url', tempPushRepoUrl);
      localStorage.setItem('push-branch', tempPushBranch);
      localStorage.setItem('push-username', tempPushUsername);
      localStorage.setItem('push-email', tempPushEmail);
      // 保存AI设置
      localStorage.setItem('enable-ai', tempEnableAI.toString());
      localStorage.setItem('api-key', tempApiKey);
      localStorage.setItem('prompt', tempPrompt);
    }

    toast({
      title: t.success,
      description: t.settingsSaved,
      variant: 'success',
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            {t.panelSettings}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="postsPerPage">{t.postsPerPage}</Label>
              <Input
                id="postsPerPage"
                type="number"
                min="1"
                max="100"
                value={tempPostsPerPage}
                onChange={(e) => setTempPostsPerPage(Number(e.target.value))}
                className="w-32"
              />
              <p className="text-sm text-muted-foreground">
                {t.postsPerPageDescription}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="autoSaveInterval">{t.autoSaveInterval}</Label>
              <Input
                id="autoSaveInterval"
                type="number"
                min="1"
                max="60"
                value={tempAutoSaveInterval}
                onChange={(e) => setTempAutoSaveInterval(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-32"
              />
              <p className="text-sm text-muted-foreground">
                {t.autoSaveIntervalDescription}
              </p>
            </div>

            <div className="space-y-2">
              <Label>{t.editorMode}</Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="mode1"
                    name="editorMode"
                    value="mode1"
                    checked={tempEditorMode === 'mode1'}
                    onChange={() => setTempEditorMode('mode1')}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="mode1">{t.mode1}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="mode2"
                    name="editorMode"
                    value="mode2"
                    checked={tempEditorMode === 'mode2'}
                    onChange={() => setTempEditorMode('mode2')}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="mode2">{t.mode2}</Label>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {t.modeDescription}
              </p>
            </div>

            <div className="space-y-2">
              <Label>{t.backgroundSettings}</Label>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="backgroundImage">{t.backgroundImageUrl}</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="backgroundImage"
                      type="text"
                      value={tempBackgroundImage}
                      onChange={(e) => setTempBackgroundImage(e.target.value)}
                      placeholder={t.backgroundImageDescription}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (typeof window !== 'undefined' && window.require) {
                          const { ipcRenderer } = window.require('electron');
                          ipcRenderer.invoke('select-file').then((filePath: string) => {
                            if (filePath) {
                              // 将本地文件路径转换为file://协议格式
                              const normalizedPath = filePath.replace(/\\/g, '/');
                              const fileUrl = `file:///${normalizedPath}`;
                              setTempBackgroundImage(fileUrl);
                            }
                          });
                        } else {
                          // 在浏览器环境中使用文件选择
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                if (event.target?.result) {
                                  setTempBackgroundImage(event.target.result as string);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          };
                          input.click();
                        }
                      }}
                    >
                      {t.selectImage}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTempBackgroundImage('');
                      }}
                    >
                      {t.clear}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t.backgroundImageDescription}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backgroundOpacity">{t.backgroundOpacity} ({Math.round(tempBackgroundOpacity * 100)}%)</Label>
                  <div className="relative w-full">
                    <Input
                      id="backgroundOpacity"
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={tempBackgroundOpacity}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        setTempBackgroundOpacity(value);
                      }}
                      className="w-full"
                      style={{
                        background: `linear-gradient(to right, 
                          #ef4444 0%, 
                          #ef4444 30%, 
                          ${tempBackgroundOpacity >= 0.3 ? "#3b82f6" : "#ef4444"} 30%, 
                          ${tempBackgroundOpacity >= 0.3 ? "#3b82f6" : "#ef4444"} 100%)
                        `
                      }}
                    />
                    <div 

                    ></div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t.backgroundOpacityDescription}
                  </p>
                </div>
              </div>
            </div>

            {/* 推送设置 */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enablePush"
                  checked={tempEnablePush}
                  onChange={(e) => setTempEnablePush(e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="enablePush">{t.enablePush || '启用推送'}</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                {t.enablePushDescription || '启用后可以将Hexo项目推送到远程Git仓库'}
              </p>

              {tempEnablePush && (
                <div className="mt-4 space-y-4 pl-6 border-l-2 border-gray-200">
                  <div className="space-y-2">
                    <Label htmlFor="pushRepoUrl">{t.pushRepoUrl || '仓库地址'}</Label>
                    <Input
                      id="pushRepoUrl"
                      type="text"
                      value={tempPushRepoUrl}
                      onChange={(e) => setTempPushRepoUrl(e.target.value)}
                      placeholder={t.pushRepoUrlPlaceholder || '例如: https://github.com/username/repo.git'}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pushBranch">{t.pushBranch || '分支名称'}</Label>
                    <Input
                      id="pushBranch"
                      type="text"
                      value={tempPushBranch}
                      onChange={(e) => setTempPushBranch(e.target.value)}
                      placeholder={t.pushBranchPlaceholder || '例如: main'}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pushUsername">{t.pushUsername || '用户名'}</Label>
                    <Input
                      id="pushUsername"
                      type="text"
                      value={tempPushUsername}
                      onChange={(e) => setTempPushUsername(e.target.value)}
                      placeholder={t.pushUsernamePlaceholder || 'Git用户名'}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pushEmail">{t.pushEmail || '邮箱'}</Label>
                    <Input
                      id="pushEmail"
                      type="email"
                      value={tempPushEmail}
                      onChange={(e) => setTempPushEmail(e.target.value)}
                      placeholder={t.pushEmailPlaceholder || 'Git邮箱'}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI设置 */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enableAI"
                checked={tempEnableAI}
                onChange={(e) => setTempEnableAI(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="enableAI">{t.enableAI}</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              {t.enableAIDescription}
            </p>

            {tempEnableAI && (
              <div className="mt-4 space-y-4 pl-6 border-l-2 border-gray-200">
                <div className="space-y-2">
                  <Label htmlFor="aiProvider">{t.aiProvider}</Label>
                  <Input
                    id="aiProvider"
                    type="text"
                    value="DeepSeek"
                    disabled
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    {t.aiProviderDescription}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiKey">{t.apiKey}</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder={t.apiKeyPlaceholder}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prompt">{t.prompt}</Label>
                  <Textarea
                    id="prompt"
                    value={tempPrompt}
                    onChange={(e) => setTempPrompt(e.target.value)}
                    placeholder={t.promptPlaceholder}
                    className="w-full"
                    rows={4}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={saveSettings}>
              <Save className="w-4 h-4 mr-2" />
              {t.saveSettings}
            </Button>
          </div>
        </CardContent>
      </Card>
      
            {/* 更新检查模块 */}
      <UpdateChecker 
        currentVersion={currentVersion}
        repoOwner="forever218"
        repoName="HexoHub"
        updateAvailable={updateAvailable}
        onCheckUpdates={onUpdateCheck}
        isLoading={updateCheckInProgress}
        autoCheckUpdates={autoCheckUpdates}
        onAutoCheckUpdatesChange={onAutoCheckUpdatesChange}
        language={language}
      />

      {/* 关于模块 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            {t.about}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t.versionInfo}</Label>
            <p className="text-sm text-muted-foreground">HexoHub v{currentVersion}</p>
          </div>
          
          <div className="space-y-2">
            <Label>{t.projectAddress}</Label>
            <a 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (typeof window !== 'undefined' && window.require) {
                  const { shell } = window.require('electron');
                  shell.openExternal('https://github.com/forever218/HexoHub');
                }
              }} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline block"
            >
              https://github.com/forever218/HexoHub
            </a>
          </div>
          
          <div className="space-y-2">
            <Label>{t.contactMe}</Label>
            <a 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (typeof window !== 'undefined' && window.require) {
                  const { shell } = window.require('electron');
                  shell.openExternal('https://github.com/forever218');
                }
              }} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline block"
            >
              https://github.com/forever218
            </a>
          </div>
          
          <div className="pt-4 text-center text-muted-foreground">
            {t.supportMessage}
          </div>
        </CardContent>
      </Card>


    </div>
  );
}
