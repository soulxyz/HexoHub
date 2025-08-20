
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UpdateChecker } from '@/components/update-checker';

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
}

export function PanelSettings({ postsPerPage, onPostsPerPageChange, autoSaveInterval, onAutoSaveIntervalChange, updateAvailable, onUpdateCheck, updateCheckInProgress, autoCheckUpdates = true, onAutoCheckUpdatesChange, editorMode, onEditorModeChange }: PanelSettingsProps) {
  // 当前应用版本，从package.json中获取
  const currentVersion = '1.2.2';
  const [tempPostsPerPage, setTempPostsPerPage] = useState<number>(postsPerPage);
  const [tempAutoSaveInterval, setTempAutoSaveInterval] = useState<number>(autoSaveInterval);
  const [tempEditorMode, setTempEditorMode] = useState<'mode1' | 'mode2'>(editorMode);
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

  // 保存设置
  const saveSettings = () => {
    if (tempPostsPerPage < 1 || tempPostsPerPage > 100) {
      toast({
        title: '错误',
        description: '每页显示文章数量必须在1-100之间',
        variant: 'error',
      });
      return;
    }

    if (tempAutoSaveInterval === "" || tempAutoSaveInterval < 1 || tempAutoSaveInterval > 60) {
      toast({
        title: '错误',
        description: '自动保存间隔必须在1-60分钟之间',
        variant: 'error',
      });
      return;
    }

    onPostsPerPageChange(tempPostsPerPage);
    onAutoSaveIntervalChange(tempAutoSaveInterval === "" ? 3 : tempAutoSaveInterval);
    onEditorModeChange(tempEditorMode);

    // 保存到localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('posts-per-page', tempPostsPerPage.toString());
      if (tempAutoSaveInterval !== "") {
        localStorage.setItem('auto-save-interval', tempAutoSaveInterval.toString());
      }
      localStorage.setItem('editor-mode', tempEditorMode);
    }

    toast({
      title: '成功',
      description: '设置已保存',
      variant: 'success',
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            面板设置
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="postsPerPage">每页显示文章数量</Label>
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
                设置文章列表每页显示的文章数量，范围1-100
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="autoSaveInterval">自动保存间隔（分钟）</Label>
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
                设置文章自动保存的时间间隔，范围1-60分钟，默认为3分钟
              </p>
            </div>

            <div className="space-y-2">
              <Label>编辑模式</Label>
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
                  <Label htmlFor="mode1">模式1</Label>
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
                  <Label htmlFor="mode2">模式2(beta)</Label>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                模式1：编辑和预览分离，需要手动切换；模式2：编辑和预览同时显示，左右分栏
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={saveSettings}>
              <Save className="w-4 h-4 mr-2" />
              保存设置
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
      />

      {/* 关于模块 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            关于
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>版本信息</Label>
            <p className="text-sm text-muted-foreground">HexoHub v1.2.2</p>
          </div>
          
          <div className="space-y-2">
            <Label>项目地址</Label>
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
            <Label>联系我</Label>
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
            您的star⭐是对我最大的支持😊
          </div>
        </CardContent>
      </Card>


    </div>
  );
}
