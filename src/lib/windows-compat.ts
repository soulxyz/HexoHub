// Windows系统兼容性工具模块

export class WindowsCompat {
  /**
   * 检查是否为Windows系统
   */
  static isWindows(): boolean {
    return typeof process !== 'undefined' && process.platform === 'win32';
  }

  /**
   * 标准化文件路径，处理Windows路径分隔符
   */
  static normalizePath(path: string): string {
    if (typeof path !== 'string') return path;
    
    // 统一路径分隔符
    let normalized = path.replace(/[\\/]/g, '/');
    
    // 移除重复的分隔符
    normalized = normalized.replace(/\/+/g, '/');
    
    // 确保路径不以分隔符结尾（除非是根目录）
    if (normalized.length > 1 && normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }
    
    return normalized;
  }

  /**
   * 转换路径为Windows格式
   */
  static toWindowsPath(path: string): string {
    if (typeof path !== 'string') return path;
    return path.replace(/\//g, '\\');
  }

  /**
   * 转换路径为Unix格式
   */
  static toUnixPath(path: string): string {
    if (typeof path !== 'string') return path;
    return path.replace(/\\/g, '/');
  }

  /**
   * 检查路径是否为绝对路径
   */
  static isAbsolute(path: string): boolean {
    if (typeof path !== 'string') return false;
    
    if (this.isWindows()) {
      // Windows绝对路径： C:\ 或 \\server\share
      return /^[A-Za-z]:\\/.test(path) || /^\\\\[^\\]+\\/.test(path);
    } else {
      // Unix绝对路径： /path
      return path.startsWith('/');
    }
  }

  /**
   * 获取路径的目录部分
   */
  static dirname(path: string): string {
    if (typeof path !== 'string') return '';
    
    const normalized = this.normalizePath(path);
    const lastSlash = normalized.lastIndexOf('/');
    
    if (lastSlash === -1) return '';
    if (lastSlash === 0) return '/';
    
    return normalized.substring(0, lastSlash);
  }

  /**
   * 获取路径的文件名部分
   */
  static basename(path: string, ext?: string): string {
    if (typeof path !== 'string') return '';
    
    const normalized = this.normalizePath(path);
    const basename = normalized.split('/').pop() || '';
    
    if (ext && basename.endsWith(ext)) {
      return basename.slice(0, -ext.length);
    }
    
    return basename;
  }

  /**
   * 获取文件扩展名
   */
  static extname(path: string): string {
    if (typeof path !== 'string') return '';
    
    const basename = this.basename(path);
    const lastDot = basename.lastIndexOf('.');
    
    if (lastDot === -1 || lastDot === 0) return '';
    
    return basename.slice(lastDot);
  }

  /**
   * 拼接路径
   */
  static join(...paths: string[]): string {
    if (paths.length === 0) return '';
    
    let result = this.normalizePath(paths[0]);
    
    for (let i = 1; i < paths.length; i++) {
      const path = this.normalizePath(paths[i]);
      
      if (path.startsWith('/')) {
        result = path;
      } else {
        result = result === '' ? path : `${result}/${path}`;
      }
    }
    
    return result;
  }

  /**
   * 解析路径
   */
  static parse(path: string): {
    root: string;
    dir: string;
    base: string;
    ext: string;
    name: string;
  } {
    if (typeof path !== 'string') {
      return { root: '', dir: '', base: '', ext: '', name: '' };
    }

    const normalized = this.normalizePath(path);
    
    let root = '';
    let dir = '';
    let base = '';
    let ext = '';
    let name = '';

    // 处理根目录
    if (this.isWindows()) {
      const driveMatch = normalized.match(/^([A-Za-z]:)\//);
      if (driveMatch) {
        root = driveMatch[1] + '\\';
        dir = driveMatch[1] + '\\';
      }
      
      const uncMatch = normalized.match(/^(\\\\[^\\]+\\[^\\]+)\//);
      if (uncMatch) {
        root = uncMatch[1];
        dir = uncMatch[1];
      }
    } else {
      if (normalized.startsWith('/')) {
        root = '/';
        dir = '/';
      }
    }

    // 分离目录和文件名
    const lastSlash = normalized.lastIndexOf('/');
    if (lastSlash !== -1) {
      dir = this.toWindowsPath(normalized.substring(0, lastSlash));
      base = normalized.substring(lastSlash + 1);
    } else {
      base = normalized;
    }

    // 分离文件名和扩展名
    const lastDot = base.lastIndexOf('.');
    if (lastDot !== -1 && lastDot > 0) {
      name = base.substring(0, lastDot);
      ext = base.substring(lastDot);
    } else {
      name = base;
    }

    return { root, dir, base, ext, name };
  }

  /**
   * 转义命令行参数（Windows特殊字符处理）
   */
  static escapeShellArg(arg: string): string {
    if (typeof arg !== 'string') return '';
    
    if (this.isWindows()) {
      // Windows命令行转义
      if (arg.includes(' ') || arg.includes('"') || arg.includes('&') || arg.includes('|') || arg.includes('<') || arg.includes('>')) {
        return `"${arg.replace(/"/g, '""')}"`;
      }
      return arg;
    } else {
      // Unix shell转义
      if (arg.includes(' ') || arg.includes('"') || arg.includes("'") || arg.includes('\\')) {
        return `"${arg.replace(/(["\\$`!])/g, '\\$1')}"`;
      }
      return arg;
    }
  }

  /**
   * 检查文件是否为Markdown文件
   */
  static isMarkdownFile(filename: string): boolean {
    if (typeof filename !== 'string') return false;
    
    const ext = this.extname(filename).toLowerCase();
    return ['.md', '.markdown', '.mdown', '.mkdn', '.mkd'].includes(ext);
  }

  /**
   * 检查文件是否应该被忽略（隐藏文件、系统文件等）
   */
  static shouldIgnoreFile(filename: string): boolean {
    if (typeof filename !== 'string') return true;
    
    // 忽略隐藏文件（以点开头的文件）
    if (filename.startsWith('.')) return true;
    
    // Windows系统文件
    if (this.isWindows()) {
      const systemFiles = [
        'desktop.ini', 'thumbs.db', 'folder.htt', 'folder.ini'
      ];
      if (systemFiles.includes(filename.toLowerCase())) return true;
    }
    
    return false;
  }

  /**
   * 格式化文件大小
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 格式化日期时间（Windows兼容）
   */
  static formatDateTime(date: Date): string {
    try {
      if (this.isWindows()) {
        // Windows日期格式
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
      } else {
        // Unix日期格式
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      }
    } catch {
      return date.toString();
    }
  }

  /**
   * 获取环境变量（Windows兼容）
   */
  static getEnvVar(name: string): string | undefined {
    if (typeof process === 'undefined') return undefined;
    
    // Windows环境变量不区分大小写
    if (this.isWindows()) {
      const upperName = name.toUpperCase();
      for (const [key, value] of Object.entries(process.env)) {
        if (key.toUpperCase() === upperName) {
          return value;
        }
      }
      return undefined;
    } else {
      return process.env[name];
    }
  }

  /**
   * 检查命令是否存在
   */
  static async commandExists(command: string): Promise<boolean> {
    if (typeof process === 'undefined') return false;
    
    // 动态导入以避免服务器端问题
    if (typeof window !== 'undefined') {
      // 在浏览器环境中，无法检查命令存在性
      return false;
    }
    
    try {
      const { exec } = eval('require')('child_process');
      const util = eval('require')('util');
      const execPromise = util.promisify(exec);
      
      const execOptions = { windowsHide: true }; // 隐藏命令行窗口
      
      if (this.isWindows()) {
        // Windows使用where命令
        await execPromise(`where ${command}`, execOptions);
      } else {
        // Unix使用which命令
        await execPromise(`which ${command}`, execOptions);
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 获取Hexo命令（Windows兼容）
   */
  static getHexoCommand(): string {
    if (this.isWindows()) {
      // Windows上可能需要使用hexo.cmd
      return 'hexo.cmd';
    } else {
      return 'hexo';
    }
  }
}