// Electron 环境下的图片处理 API
import { isElectron } from './desktop-api';

// Electron 环境下的图片处理功能
export async function copyFileInElectron(sourcePath: string, destinationPath: string): Promise<boolean> {
  if (!isElectron()) {
    console.error('[Electron Image API] Not running in Electron environment');
    return false;
  }

  try {
    const { ipcRenderer } = (window as any).require('electron');
    await ipcRenderer.invoke('copy-file', sourcePath, destinationPath);
    return true;
  } catch (error) {
    console.error('[Electron Image API] 复制文件失败:', error);
    return false;
  }
}

// 从缓冲区写入文件（Electron）
export async function writeFileFromBufferInElectron(destinationPath: string, buffer: Uint8Array): Promise<boolean> {
  if (!isElectron()) {
    console.error('[Electron Image API] Not running in Electron environment');
    return false;
  }

  try {
    const { ipcRenderer } = (window as any).require('electron');
    await ipcRenderer.invoke('write-file-from-buffer', destinationPath, buffer);
    return true;
  } catch (error) {
    console.error('[Electron Image API] 写入文件失败:', error);
    return false;
  }
}

// 确保目录存在（Electron）
export async function ensureDirectoryExistsInElectron(dirPath: string): Promise<boolean> {
  if (!isElectron()) {
    console.error('[Electron Image API] Not running in Electron environment');
    return false;
  }

  try {
    const { ipcRenderer } = (window as any).require('electron');
    await ipcRenderer.invoke('ensure-directory-exists', dirPath);
    return true;
  } catch (error) {
    console.error('[Electron Image API] 创建目录失败:', error);
    return false;
  }
}
