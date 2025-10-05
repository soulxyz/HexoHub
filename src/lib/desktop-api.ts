// 统一的桌面应用 API
// 同时支持 Electron 和 Tauri

// 检测当前运行环境
export function getDesktopEnvironment() {
  if (typeof window === 'undefined') {
    return 'browser';
  }
  
  // 检测 Tauri - 兼容 Tauri 2.x 的多种检测方法
  if ((window as any).__TAURI__ || 
      (window as any).__TAURI_INTERNALS__ || 
      (window as any).ipc) {
    return 'tauri';
  }
  
  // 检测 Electron
  if ('require' in window) {
    return 'electron';
  }
  
  return 'browser';
}

// 获取 IPC Renderer（兼容 Electron 和 Tauri）
export async function getIpcRenderer() {
  const env = getDesktopEnvironment();
  
  if (env === 'tauri') {
    const { ipcRenderer } = await import('@/lib/tauri-api');
    return ipcRenderer;
  } else if (env === 'electron') {
    const { ipcRenderer } = (window as any).require('electron');
    return ipcRenderer;
  }
  
  throw new Error('Not running in a desktop environment');
}

// 检查是否在桌面应用中
export function isDesktopApp() {
  const env = getDesktopEnvironment();
  const isDesktop = env === 'tauri' || env === 'electron';
  
  // 开发环境下输出调试信息
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('[Desktop API] Environment:', env);
    console.log('[Desktop API] Is Desktop App:', isDesktop);
    console.log('[Desktop API] Window properties:', {
      hasTauri: '__TAURI__' in window,
      hasTauriInternals: '__TAURI_INTERNALS__' in window,
      hasIpc: (window as any).ipc !== undefined,
      hasRequire: 'require' in window,
    });
  }
  
  return isDesktop;
}

// 检查是否是 Tauri
export function isTauri() {
  return getDesktopEnvironment() === 'tauri';
}

// 检查是否是 Electron  
export function isElectron() {
  return getDesktopEnvironment() === 'electron';
}

