// Electron 主进程中的 IPC 处理程序
const { ipcMain, fs, dialog } = require('electron');
const path = require('path');

// 注册复制文件的 IPC 处理程序
ipcMain.handle('copy-file', async (event, sourcePath, destinationPath) => {
  try {
    // 确保目标目录存在
    const destDir = path.dirname(destinationPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // 复制文件
    fs.copyFileSync(sourcePath, destinationPath);
    return { success: true };
  } catch (error) {
    console.error('复制文件失败:', error);
    throw error;
  }
});

// 注册从缓冲区写入文件的 IPC 处理程序
ipcMain.handle('write-file-from-buffer', async (event, destinationPath, buffer) => {
  try {
    // 确保目标目录存在
    const destDir = path.dirname(destinationPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // 写入文件
    fs.writeFileSync(destinationPath, Buffer.from(buffer));
    return { success: true };
  } catch (error) {
    console.error('写入文件失败:', error);
    throw error;
  }
});

// 注册确保目录存在的 IPC 处理程序
ipcMain.handle('ensure-directory-exists', async (event, dirPath) => {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    return { success: true };
  } catch (error) {
    console.error('创建目录失败:', error);
    throw error;
  }
});



// 注册写入文件的 IPC 处理程序
ipcMain.handle('write-file', async (event, filePath, content) => {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    return { success: true };
  } catch (error) {
    console.error('写入文件失败:', error);
    throw error;
  }
});



// 注册检查 Hexo 项目的 IPC 处理程序
ipcMain.handle('validate-hexo-project', async (event, directoryPath, language) => {
  try {
    const packageJsonPath = path.join(directoryPath, 'package.json');
    const configYmlPath = path.join(directoryPath, '_config.yml');

    const [packageExists, configExists] = await Promise.all([
      fs.existsSync(packageJsonPath),
      fs.existsSync(configYmlPath)
    ]);

    if (configExists) {
      // 检查是否是有效的Hexo配置
      try {
        const configContent = fs.readFileSync(configYmlPath, 'utf8');
        if (configContent.includes('title:') || configContent.includes('theme:')) {
          const validMessage = language === 'en' ? 'Valid Hexo Project' : '有效的Hexo项目';
          return { valid: true, message: validMessage };
        }
      } catch (configError) {
        // 配置文件读取失败，但存在，可能是权限问题
        return { valid: true, message: '找到Hexo配置文件（无法读取内容）' };
      }

      // 检查package.json是否包含hexo
      if (packageExists) {
        try {
          const packageContent = fs.readFileSync(packageJsonPath, 'utf8');
          if (packageContent.includes('hexo')) {
            const validMessage = language === 'en' ? 'Valid Hexo Project' : '有效的Hexo项目';
            return { valid: true, message: validMessage };
          }
        } catch (packageError) {
          // package.json读取失败，但配置文件存在
          return { valid: true, message: '找到Hexo配置文件' };
        }
      }

      return { valid: true, message: '找到Hexo配置文件' };
    }

    const invalidMessage = language === 'en' ? 'Not a valid Hexo project directory' : '不是有效的Hexo项目目录';
    return { valid: false, message: invalidMessage };
  } catch (error) {
    return { valid: false, message: '验证失败: ' + error.message };
  }
});

// 注册检查更新的 IPC 处理程序
ipcMain.handle('check-for-updates', async () => {
  try {
    // 这里可以实现实际的更新检查逻辑
    // 目前返回一个模拟响应
    return {
      success: true,
      updateAvailable: false,
      currentVersion: '2.6.1',
      latestVersion: '2.6.1',
      releaseNotes: '',
      downloadUrl: '',
      publishedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('检查更新失败:', error);
    throw error;
  }
});
