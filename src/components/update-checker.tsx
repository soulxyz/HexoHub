
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, ExternalLink, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  body: string;
  html_url: string;
  published_at: string;
  assets: Array<{
    name: string;
    browser_download_url: string;
    size: number;
  }>;
}

interface UpdateCheckerProps {
  currentVersion: string;
  repoOwner: string;
  repoName: string;
  autoCheckUpdates?: boolean;
  onAutoCheckUpdatesChange?: (value: boolean) => void;
}

export function UpdateChecker({ currentVersion, repoOwner, repoName, autoCheckUpdates = true, onAutoCheckUpdatesChange }: UpdateCheckerProps) {
  const [latestRelease, setLatestRelease] = useState<GitHubRelease | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const { toast } = useToast();

  // 从localStorage加载上次检查时间和自动更新设置
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLastChecked = localStorage.getItem('last-update-check');
      if (savedLastChecked) {
        setLastChecked(savedLastChecked);
      }
      
      const savedAutoCheckUpdates = localStorage.getItem('auto-check-updates');
      if (savedAutoCheckUpdates !== null) {
        const autoCheck = savedAutoCheckUpdates === 'true';
        if (onAutoCheckUpdatesChange && autoCheck !== autoCheckUpdates) {
          onAutoCheckUpdatesChange(autoCheck);
        }
      }
    }
  }, []);

  // 检查更新
  const checkForUpdates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`);
      if (!response.ok) {
        throw new Error('获取更新信息失败');
      }

      const release: GitHubRelease = await response.json();
      setLatestRelease(release);

      // 保存检查时间
      const now = new Date().toISOString();
      setLastChecked(now);
      if (typeof window !== 'undefined') {
        localStorage.setItem('last-update-check', now);
      }

      // 比较版本号
      const isUpdateAvailable = compareVersions(currentVersion, release.tag_name);
      setUpdateAvailable(isUpdateAvailable);

      if (isUpdateAvailable) {
        toast({
          title: '发现新版本',
          description: `新版本 ${release.tag_name} 已发布`,
          variant: 'default',
        });
      } else {
        toast({
          title: '已是最新版本',
          description: `当前版本 ${currentVersion} 已是最新`,
          variant: 'success',
        });
      }
    } catch (error) {
      console.error('检查更新失败:', error);
      toast({
        title: '检查更新失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 处理自动更新设置变化
  const handleAutoCheckChange = (checked: boolean) => {
    if (onAutoCheckUpdatesChange) {
      onAutoCheckUpdatesChange(checked);
    }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('auto-check-updates', checked.toString());
    }
  };

  // 比较版本号
  const compareVersions = (current: string, latest: string): boolean => {
    // 移除'v'前缀并分割版本号
    const currentVersion = current.replace(/^v/i, '').split('.').map(Number);
    const latestVersion = latest.replace(/^v/i, '').split('.').map(Number);

    // 确保版本号格式正确
    if (currentVersion.some(isNaN) || latestVersion.some(isNaN)) {
      return false;
    }

    // 比较主版本号、次版本号和修订号
    for (let i = 0; i < Math.max(currentVersion.length, latestVersion.length); i++) {
      const currentPart = currentVersion[i] || 0;
      const latestPart = latestVersion[i] || 0;

      if (latestPart > currentPart) {
        return true;
      } else if (latestPart < currentPart) {
        return false;
      }
    }

    return false;
  };

  // 格式化日期
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
    else return Math.round(bytes / 1048576 * 10) / 10 + ' MB';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>更新检查</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkForUpdates}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            检查更新
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 自动检查更新开关 */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="font-medium">是否自动检查更新</div>
            <p className="text-sm text-muted-foreground">
              如果您被更新弹窗所困扰，可以选择关闭更新检查
            </p>
          </div>
          <button
            type="button"
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${autoCheckUpdates ? 'bg-green-500' : 'bg-gray-200'}`}
            role="switch"
            aria-checked={autoCheckUpdates}
            onClick={() => handleAutoCheckChange(!autoCheckUpdates)}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${autoCheckUpdates ? 'translate-x-5' : 'translate-x-0'}`}
            />
            <span className="sr-only">切换自动检查更新</span>
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <span>当前版本:</span>
          <Badge variant="outline">{currentVersion}</Badge>
        </div>

        {lastChecked && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>上次检查时间:</span>
            <span>{new Date(lastChecked).toLocaleString('zh-CN')}</span>
          </div>
        )}

        {latestRelease && (
          <>
            <div className="flex items-center justify-between">
              <span>最新版本:</span>
              <div className="flex items-center gap-2">
                <Badge variant={updateAvailable ? "default" : "secondary"}>
                  {latestRelease.tag_name}
                </Badge>
                {updateAvailable ? (
                  <Badge variant="default" className="bg-green-600">
                    有新版本
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    已是最新
                  </Badge>
                )}
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              发布时间: {formatDate(latestRelease.published_at)}
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">更新内容:</h4>
              <div className="text-sm bg-muted p-3 rounded-md max-h-40 overflow-y-auto">
                {latestRelease.body.split('\n').map((line, index) => (
                  <p key={index} className="mb-1 last:mb-0">
                    {line}
                  </p>
                ))}
              </div>
            </div>

            {updateAvailable && latestRelease.assets.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">下载链接:</h4>
                <div className="space-y-2">
                  {latestRelease.assets.map((asset, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                      <div>
                        <div className="font-medium">{asset.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatFileSize(asset.size)}
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => window.open(asset.browser_download_url, '_blank')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        下载
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={(e) => {
                  e.preventDefault();
                  if (typeof window !== 'undefined' && window.require) {
                    const { shell } = window.require('electron');
                    shell.openExternal(latestRelease.html_url);
                  }
                }}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                在GitHub上查看
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
