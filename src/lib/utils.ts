import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { isDesktopApp, getDesktopEnvironment } from "./desktop-api"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 规范化文件路径
 * Windows: 统一使用反斜杠 \
 * macOS/Linux: 统一使用正斜杠 /
 * @param path 要规范化的路径
 * @returns 规范化后的路径
 */
export function normalizePath(path: string): string {
  if (!path) return '';
  
  // 检测操作系统
  const isWindows = typeof navigator !== 'undefined' && 
    (navigator.platform.toLowerCase().includes('win') || 
     navigator.userAgent.toLowerCase().includes('windows'));
  
  if (isWindows) {
    // Windows: 统一转换为反斜杠
    return path.replace(/\//g, '\\');
  } else {
    // macOS/Linux: 统一转换为正斜杠
    return path.replace(/\\/g, '/');
  }
}

/**
 * 打开外部链接
 * 自动检测环境（Electron/Tauri/Browser）并使用相应的方法
 * @param url 要打开的链接地址
 */
export async function openExternalLink(url: string): Promise<void> {
  if (!isDesktopApp()) {
    // 浏览器环境
    window.open(url, '_blank');
    return;
  }

  const env = getDesktopEnvironment();
  
  if (env === 'tauri') {
    // Tauri 环境 - 使用 shell.open
    try {
      const { open } = await import('@tauri-apps/plugin-shell');
      await open(url);
    } catch (error) {
      console.error('Failed to open external link with Tauri shell:', error);
      window.open(url, '_blank');
    }
  } else if (env === 'electron') {
    // Electron 环境 - 使用 electron shell
    try {
      const shell = (window as any).require ? (window as any).require('electron').shell : null;
      if (shell) {
        shell.openExternal(url);
      } else {
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Failed to open external link with Electron shell:', error);
      window.open(url, '_blank');
    }
  } else {
    // Fallback
    window.open(url, '_blank');
  }
}
