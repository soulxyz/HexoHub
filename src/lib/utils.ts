import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { isDesktopApp, getDesktopEnvironment } from "./desktop-api"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ==================== 路径处理 ====================
// 
// 【重要】不要自己写 path.replace()，统一使用这两个函数
//
// normalizePath() → 显示给用户、保存到 localStorage
// normalizePathInternal() → 传给后端 API、拼接路径
//
// ===================================================

/**
 * 规范化路径用于显示
 * - Windows: D:\Project\HexoHub
 * - macOS/Linux: /Users/project/hexohub
 */
export function normalizePath(path: string): string {
  if (!path) return '';
  
  const isWindows = typeof navigator !== 'undefined' && 
    (navigator.platform.toLowerCase().includes('win') || 
     navigator.userAgent.toLowerCase().includes('windows'));
  
  return isWindows ? path.replace(/\//g, '\\') : path.replace(/\\/g, '/');
}

/**
 * 规范化路径用于内部处理
 * - 统一使用正斜杠: D:/Project/HexoHub
 * - 避免混合分隔符: D:\01/blog → D:/01/blog
 * - 移除重复分隔符: D://blog → D:/blog
 */
export function normalizePathInternal(path: string): string {
  if (!path || typeof path !== 'string') return path || '';
  
  let normalized = path.replace(/[\\/]/g, '/').replace(/\/+/g, '/');
  
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }
  
  return normalized;
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
