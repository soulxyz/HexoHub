#!/usr/bin/env node

/**
 * 版本同步检查脚本
 * 检查所有配置文件的版本号是否与 package.json 一致
 * 
 * 使用方法：
 * node scripts/check-version-sync.js
 */

const fs = require('fs');
const path = require('path');

// 颜色输出辅助函数
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
};

console.log(colors.blue('\n🔍 检查版本号同步状态...\n'));

// 读取 package.json 版本号
const packageJsonPath = path.join(__dirname, '..', 'package.json');
let packageJson;
try {
  packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
} catch (error) {
  console.error(colors.red(`❌ 读取 package.json 失败: ${error.message}`));
  process.exit(1);
}

const expectedVersion = packageJson.version;
console.log(colors.blue(`📦 package.json 版本号: ${expectedVersion}\n`));

// 检查文件列表
const filesToCheck = [
  {
    name: 'tauri.conf.json',
    path: 'src-tauri/tauri.conf.json',
    getVersion: (content) => {
      const config = JSON.parse(content);
      return config.version;
    },
  },
  {
    name: 'Cargo.toml',
    path: 'src-tauri/Cargo.toml',
    getVersion: (content) => {
      const versionRegex = /^version\s*=\s*"([^"]+)"/m;
      const match = content.match(versionRegex);
      return match ? match[1] : null;
    },
  },
];

let allSynced = true;

// 执行检查
filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, '..', file.path);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(colors.yellow(`⚠  ${file.name}: 文件不存在`));
      allSynced = false;
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const actualVersion = file.getVersion(content);
    
    if (actualVersion === expectedVersion) {
      console.log(colors.green(`✓  ${file.name}: ${actualVersion} ${colors.green('(已同步)')}`));
    } else {
      console.log(colors.red(`✗  ${file.name}: ${actualVersion} ${colors.red(`(期望: ${expectedVersion})`)}`));
      allSynced = false;
    }
  } catch (error) {
    console.error(colors.red(`✗  ${file.name}: 读取失败 - ${error.message}`));
    allSynced = false;
  }
});

console.log('');

if (allSynced) {
  console.log(colors.green('✅ 所有版本号已同步！'));
  console.log('');
  process.exit(0);
} else {
  console.log(colors.red('❌ 发现版本号不同步！'));
  console.log(colors.yellow('\n💡 运行以下命令同步版本号：'));
  console.log(colors.blue('   npm run sync-version\n'));
  process.exit(1);
}

