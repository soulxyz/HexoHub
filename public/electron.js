const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

// Windows兼容性工具
const WindowsCompat = {
  isWindows: () => process.platform === 'win32',
  normalizePath: (p) => p.replace(/[\\/]/g, '/').replace(/\/+/g, '/'),
  toWindowsPath: (p) => p.replace(/\//g, '\\'),
  escapeShellArg: (arg) => {
    if (WindowsCompat.isWindows()) {
      if (arg.includes(' ') || arg.includes('"') || arg.includes('&') || arg.includes('|') || arg.includes('<') || arg.includes('>')) {
        return `"${arg.replace(/"/g, '""')}"`;
      }
      return arg;
    } else {
      if (arg.includes(' ') || arg.includes('"') || arg.includes("'") || arg.includes('\\')) {
        return `"${arg.replace(/(["\\$`!])/g, '\\$1')}"`;
      }
      return arg;
    }
  },
  shouldIgnoreFile: (filename) => {
    if (typeof filename !== 'string') return true;
    
    // 忽略隐藏文件（以点开头的文件）
    if (filename.startsWith('.')) return true;
    
    // Windows系统文件
    if (WindowsCompat.isWindows()) {
      const systemFiles = [
        'desktop.ini', 'thumbs.db', 'folder.htt', 'folder.ini'
      ];
      if (systemFiles.includes(filename.toLowerCase())) return true;
    }
    
    return false;
  },
  getHexoCommand: () => WindowsCompat.isWindows() ? 'hexo.cmd' : 'hexo'
};

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false
    },
    icon: path.join(__dirname, 'icon.ico'),
    show: false
  });

  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../out/index.html')}`;

  // 在生产模式下，拦截请求并重定向到本地文件
  if (!isDev) {
    const { protocol } = require('electron');

    protocol.interceptFileProtocol('file', (request, callback) => {
      const url = request.url.substr(7); // 移除 'file://' 前缀

      // 如果请求的是_next资源，重定向到正确的本地路径
      if (url.includes('/_next/')) {
        const localPath = url.replace(/.*\/_next\//, path.join(__dirname, '../out/_next/'));
        callback(localPath);
      } else {
        callback(url);
      }
    });
  }

  mainWindow.loadURL(startUrl);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for file system operations
ipcMain.handle('select-directory', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    title: '选择Hexo项目目录'
  });
  
  if (canceled) {
    return null;
  }
  
  return filePaths[0];
});

ipcMain.handle('read-file', async (event, filePath) => {
  const fs = require('fs').promises;
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return content;
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('write-file', async (event, filePath, content) => {
  const fs = require('fs').promises;
  try {
    await fs.writeFile(filePath, content, 'utf8');
    return true;
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('delete-file', async (event, filePath) => {
  const fs = require('fs').promises;
  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('list-files', async (event, directoryPath) => {
  const fs = require('fs').promises;
  const path = require('path');
  
  try {
    // 使用Windows兼容性工具标准化路径
    const normalizedPath = WindowsCompat.normalizePath(directoryPath);
    const files = await fs.readdir(normalizedPath);
    const fileList = [];
    
    for (const file of files) {
      // 使用Windows兼容性工具检查是否应该忽略文件
      if (WindowsCompat.shouldIgnoreFile && WindowsCompat.shouldIgnoreFile(file)) continue;
      
      const fullPath = path.join(normalizedPath, file);
      const stats = await fs.stat(fullPath);
      
      if (stats.isFile()) {
        fileList.push({
          name: file,
          path: fullPath,
          isDirectory: stats.isDirectory(),
          size: stats.size,
          modifiedTime: stats.mtime
        });
      }
    }
    
    return fileList;
  } catch (error) {
    throw error;
  }
});

// Execute hexo commands
ipcMain.handle('execute-hexo-command', async (event, command, workingDir) => {
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);
  
  try {
    // 使用Windows兼容性工具
    const hexoCommand = WindowsCompat.getHexoCommand();
    const fullCommand = `${hexoCommand} ${command}`;
    
    const { stdout, stderr } = await execPromise(fullCommand, {
      cwd: workingDir,
      windowsHide: false,
      env: { ...process.env, FORCE_COLOR: '0' }, // 禁用颜色输出以避免编码问题
      shell: true // 使用shell以支持命令查找
    });
    
    return {
      success: true,
      stdout: stdout,
      stderr: stderr
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      stdout: error.stdout,
      stderr: error.stderr
    };
  }
});

// Check if directory is a valid hexo project
ipcMain.handle('validate-hexo-project', async (event, directoryPath) => {
  const fs = require('fs').promises;
  const path = require('path');
  
  try {
    // 使用Windows兼容性工具标准化路径
    const normalizedPath = WindowsCompat.normalizePath(directoryPath);
    const packageJsonPath = path.join(normalizedPath, 'package.json');
    const configYmlPath = path.join(normalizedPath, '_config.yml');
    
    const [packageExists, configExists] = await Promise.all([
      fs.access(packageJsonPath).then(() => true).catch(() => false),
      fs.access(configYmlPath).then(() => true).catch(() => false)
    ]);
    
    if (configExists) {
      // 检查是否是有效的Hexo配置
      try {
        const configContent = await fs.readFile(configYmlPath, 'utf8');
        if (configContent.includes('title:') || configContent.includes('theme:')) {
          return { valid: true, message: '有效的Hexo项目' };
        }
      } catch (configError) {
        // 配置文件读取失败，但存在，可能是权限问题
        return { valid: true, message: '找到Hexo配置文件（无法读取内容）' };
      }
      
      // 检查package.json是否包含hexo
      if (packageExists) {
        try {
          const packageContent = await fs.readFile(packageJsonPath, 'utf8');
          if (packageContent.includes('hexo')) {
            return { valid: true, message: '有效的Hexo项目' };
          }
        } catch (packageError) {
          // package.json读取失败，但配置文件存在
          return { valid: true, message: '找到Hexo配置文件' };
        }
      }
      
      return { valid: true, message: '找到Hexo配置文件' };
    }
    
    return { valid: false, message: '不是有效的Hexo项目目录' };
  } catch (error) {
    return { valid: false, message: '验证失败: ' + error.message };
  }
});

// 全局变量存储服务器进程
let hexoServerProcess = null;

// 启动Hexo服务器
ipcMain.handle('start-hexo-server', async (event, workingDir) => {
  const { spawn } = require('child_process');

  try {
    // 如果已经有服务器在运行，先停止它
    if (hexoServerProcess) {
      hexoServerProcess.kill();
      hexoServerProcess = null;
    }

    // 使用Windows兼容性工具
    const hexoCommand = WindowsCompat.getHexoCommand();

    // 启动Hexo服务器
    hexoServerProcess = spawn(hexoCommand, ['server'], {
      cwd: workingDir,
      shell: true,
      detached: false,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    return new Promise((resolve) => {
      let output = '';
      let errorOutput = '';
      let serverStarted = false;

      // 监听标准输出
      hexoServerProcess.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;

        // 检查服务器是否已启动
        if (text.includes('Hexo is running') || text.includes('localhost:4000')) {
          if (!serverStarted) {
            serverStarted = true;
            resolve({
              success: true,
              stdout: 'Hexo服务器已启动在 http://localhost:4000',
              process: hexoServerProcess.pid
            });
          }
        }
      });

      // 监听错误输出
      hexoServerProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      // 监听进程退出
      hexoServerProcess.on('exit', (code) => {
        if (!serverStarted) {
          resolve({
            success: false,
            error: `服务器启动失败，退出码: ${code}`,
            stderr: errorOutput
          });
        }
        hexoServerProcess = null;
      });

      // 监听错误
      hexoServerProcess.on('error', (error) => {
        if (!serverStarted) {
          resolve({
            success: false,
            error: '启动服务器失败: ' + error.message
          });
        }
        hexoServerProcess = null;
      });

      // 超时处理
      setTimeout(() => {
        if (!serverStarted) {
          resolve({
            success: false,
            error: '服务器启动超时'
          });
        }
      }, 10000); // 10秒超时
    });
  } catch (error) {
    return {
      success: false,
      error: '启动服务器失败: ' + error.message
    };
  }
});

// 停止Hexo服务器
ipcMain.handle('stop-hexo-server', async () => {
  try {
    if (hexoServerProcess) {
      // Windows下需要强制终止进程树
      if (WindowsCompat.isWindows()) {
        const { exec } = require('child_process');
        exec(`taskkill /pid ${hexoServerProcess.pid} /T /F`, (error) => {
          if (error) {
            console.error('强制终止进程失败:', error);
          }
        });
      } else {
        hexoServerProcess.kill('SIGTERM');
      }

      hexoServerProcess = null;

      return {
        success: true,
        stdout: '服务器已停止'
      };
    } else {
      return {
        success: false,
        error: '没有正在运行的服务器'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: '停止服务器失败: ' + error.message
    };
  }
});

// 打开URL
ipcMain.handle('open-url', async (event, url) => {
  const { shell } = require('electron');
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: '打开URL失败: ' + error.message
    };
  }
});

// 应用退出时清理服务器进程
app.on('before-quit', () => {
  if (hexoServerProcess) {
    if (WindowsCompat.isWindows()) {
      const { exec } = require('child_process');
      exec(`taskkill /pid ${hexoServerProcess.pid} /T /F`);
    } else {
      hexoServerProcess.kill('SIGTERM');
    }
    hexoServerProcess = null;
  }
});