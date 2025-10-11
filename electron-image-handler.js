// Electron 环境下的图片处理功能
const { contextBridge, ipcRenderer } = require('electron');

// 暴露给渲染进程的 API
contextBridge.exposeInMainWorld('electronImageHandler', {
  // 复制文件
  copyFile: async (sourcePath, destinationPath) => {
    try {
      await ipcRenderer.invoke('copy-file', sourcePath, destinationPath);
      return { success: true };
    } catch (error) {
      console.error('复制文件失败:', error);
      return { success: false, error: error.message };
    }
  },

  // 从缓冲区写入文件
  writeFileFromBuffer: async (destinationPath, buffer) => {
    try {
      await ipcRenderer.invoke('write-file-from-buffer', destinationPath, buffer);
      return { success: true };
    } catch (error) {
      console.error('写入文件失败:', error);
      return { success: false, error: error.message };
    }
  },

  // 确保目录存在
  ensureDirectoryExists: async (dirPath) => {
    try {
      await ipcRenderer.invoke('ensure-directory-exists', dirPath);
      return { success: true };
    } catch (error) {
      console.error('创建目录失败:', error);
      return { success: false, error: error.message };
    }
  }
});
