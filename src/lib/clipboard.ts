/**
 * 统一的剪贴板工具
 * 自动检测运行环境并使用最优的剪贴板 API
 * 
 * - Tauri: 使用 @tauri-apps/plugin-clipboard-manager（更原生、性能更好）
 * - Electron: 使用 Electron IPC
 * - Web: 使用浏览器的 navigator.clipboard API
 */

/**
 * 检测运行环境
 */
function isTauriEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window as any).__TAURI__ || 
         !!(window as any).__TAURI_INTERNALS__ || 
         !!(window as any).ipc;
}

function isElectronEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  return 'require' in window;
}

/**
 * 写入文本到剪贴板
 */
export async function writeClipboardText(text: string): Promise<void> {
  // Tauri 环境：使用官方剪贴板插件
  if (isTauriEnvironment()) {
    try {
      const { clipboardOperations } = await import('./tauri-api');
      await clipboardOperations.writeText(text);
      return;
    } catch (error) {
      console.warn('[Clipboard] Tauri clipboard failed, falling back to web API:', error);
    }
  }
  
  // Electron 环境：使用 Electron clipboard API
  if (isElectronEnvironment()) {
    try {
      const { clipboard } = (window as any).require('electron');
      clipboard.writeText(text);
      return;
    } catch (error) {
      console.warn('[Clipboard] Electron clipboard failed, falling back to web API:', error);
    }
  }
  
  // Web 环境或后备方案：使用浏览器 Clipboard API
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error('[Clipboard] Failed to write to clipboard:', error);
    throw error;
  }
}

/**
 * 从剪贴板读取文本
 */
export async function readClipboardText(): Promise<string> {
  // Tauri 环境：使用官方剪贴板插件
  if (isTauriEnvironment()) {
    try {
      const { clipboardOperations } = await import('./tauri-api');
      return await clipboardOperations.readText();
    } catch (error) {
      console.warn('[Clipboard] Tauri clipboard failed, falling back to web API:', error);
    }
  }
  
  // Electron 环境：使用 Electron clipboard API
  if (isElectronEnvironment()) {
    try {
      const { clipboard } = (window as any).require('electron');
      return clipboard.readText();
    } catch (error) {
      console.warn('[Clipboard] Electron clipboard failed, falling back to web API:', error);
    }
  }
  
  // Web 环境或后备方案：使用浏览器 Clipboard API
  try {
    return await navigator.clipboard.readText();
  } catch (error) {
    console.error('[Clipboard] Failed to read from clipboard:', error);
    throw error;
  }
}

/**
 * 检查剪贴板 API 是否可用
 */
export function isClipboardAvailable(): boolean {
  if (isTauriEnvironment() || isElectronEnvironment()) {
    return true;
  }
  
  return !!(typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText);
}

