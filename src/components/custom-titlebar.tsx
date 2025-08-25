
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Square, Maximize2, X } from 'lucide-react';

interface CustomTitlebarProps {
  title?: string;
}

export const CustomTitlebar: React.FC<CustomTitlebarProps> = ({ title = 'HexoHub' }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // 检查是否在Electron环境中
    const electronEnv = typeof window !== 'undefined' && window.require;
    setIsElectron(!!electronEnv);
  }, []);

  // 最小化窗口
  const minimizeWindow = () => {
    if (isElectron) {
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.send('minimize-window');
    }
  };

  // 最大化/还原窗口
  const maximizeRestoreWindow = () => {
    if (isElectron) {
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.send('maximize-restore-window');
      setIsMaximized(!isMaximized);
    }
  };

  // 关闭窗口
  const closeWindow = () => {
    if (isElectron) {
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.send('close-window');
    }
  };

  // 如果不是在Electron环境中，不显示标题栏
  if (!isElectron) {
    return null;
  }

  return (
    <div className="flex items-center justify-end h-8 bg-card border-b select-none drag-region fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center no-drag">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 rounded-none hover:bg-muted"
          onClick={minimizeWindow}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 rounded-none hover:bg-muted"
          onClick={maximizeRestoreWindow}
        >
          {isMaximized ? (
            <Maximize2 className="h-4 w-4" />
          ) : (
            <Square className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 rounded-none hover:bg-destructive hover:text-destructive-foreground"
          onClick={closeWindow}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
