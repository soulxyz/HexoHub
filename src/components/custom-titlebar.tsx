
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Square, Maximize2, X } from 'lucide-react';
import { isDesktopApp as checkIsDesktopApp, getIpcRenderer } from '@/lib/desktop-api';

interface CustomTitlebarProps {
  title?: string;
}

export const CustomTitlebar: React.FC<CustomTitlebarProps> = ({ title = 'HexoHub' }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // 检查是否在桌面应用环境中（Electron 或 Tauri）
    setIsDesktop(checkIsDesktopApp());
  }, []);

  // 最小化窗口
  const minimizeWindow = async () => {
    try {
      const ipcRenderer = await getIpcRenderer();
      ipcRenderer.send('minimize-window');
    } catch (error) {
      console.error('Failed to minimize window:', error);
    }
  };

  // 最大化/还原窗口
  const maximizeRestoreWindow = async () => {
    try {
      const ipcRenderer = await getIpcRenderer();
      ipcRenderer.send('maximize-restore-window');
      setIsMaximized(!isMaximized);
    } catch (error) {
      console.error('Failed to maximize/restore window:', error);
    }
  };

  // 关闭窗口
  const closeWindow = async () => {
    try {
      const ipcRenderer = await getIpcRenderer();
      ipcRenderer.send('close-window');
    } catch (error) {
      console.error('Failed to close window:', error);
    }
  };

  // 如果不是在桌面应用环境中，不显示标题栏
  if (!isDesktop) {
    return null;
  }

  return (
    <div 
      className="flex items-center justify-between h-10 bg-card border-b select-none fixed top-0 left-0 right-0 z-50"
      data-tauri-drag-region
      style={{ WebkitAppRegion: 'drag' } as any}
    >
      {/* 左侧标题 */}
      <div className="flex items-center px-4 h-full pointer-events-none">
        <span className="text-sm font-semibold">{title}</span>
      </div>
      
      {/* 右侧窗口控制按钮 */}
      <div 
        className="flex items-center h-full"
        style={{ WebkitAppRegion: 'no-drag' } as any}
      >
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-12 p-0 rounded-none hover:bg-muted"
          onClick={minimizeWindow}
          title="最小化"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-12 p-0 rounded-none hover:bg-muted"
          onClick={maximizeRestoreWindow}
          title={isMaximized ? "还原" : "最大化"}
        >
          {isMaximized ? (
            <Maximize2 className="h-3.5 w-3.5" />
          ) : (
            <Square className="h-3.5 w-3.5" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-12 p-0 rounded-none hover:bg-destructive hover:text-destructive-foreground"
          onClick={closeWindow}
          title="关闭"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
