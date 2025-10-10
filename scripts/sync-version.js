#!/usr/bin/env node

/**
 * 版本同步脚本
 * 从 package.json 读取版本号，并自动同步到所有配置文件
 * 
 * 使用方法：
 * node scripts/sync-version.js
 * 
 * 或在 package.json 中添加 script：
 * "sync-version": "node scripts/sync-version.js"
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

console.log(colors.blue('\n🔄 开始同步版本号...\n'));

// 读取 package.json 版本号
const packageJsonPath = path.join(__dirname, '..', 'package.json');
let packageJson;
try {
  packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
} catch (error) {
  console.error(colors.red(`❌ 读取 package.json 失败: ${error.message}`));
  process.exit(1);
}

const version = packageJson.version;
console.log(colors.green(`✓ 从 package.json 读取版本号: ${version}\n`));

// 需要同步的文件列表
const filesToSync = [
  {
    path: 'src-tauri/tauri.conf.json',
    update: (content) => {
      const config = JSON.parse(content);
      const oldVersion = config.version;
      config.version = version;
      if (oldVersion !== version) {
        console.log(colors.yellow(`  更新 tauri.conf.json: ${oldVersion} → ${version}`));
        return JSON.stringify(config, null, 2);
      } else {
        console.log(colors.green(`  ✓ tauri.conf.json 版本已是最新`));
        return null;
      }
    },
  },
  {
    path: 'src-tauri/Cargo.toml',
    update: (content) => {
      const versionRegex = /^version\s*=\s*"([^"]+)"/m;
      const match = content.match(versionRegex);
      if (match) {
        const oldVersion = match[1];
        if (oldVersion !== version) {
          console.log(colors.yellow(`  更新 Cargo.toml: ${oldVersion} → ${version}`));
          return content.replace(versionRegex, `version = "${version}"`);
        } else {
          console.log(colors.green(`  ✓ Cargo.toml 版本已是最新`));
          return null;
        }
      } else {
        console.log(colors.red(`  ⚠ Cargo.toml 中未找到版本号`));
        return null;
      }
    },
  },
];

// 执行同步
let hasChanges = false;
filesToSync.forEach(file => {
  const filePath = path.join(__dirname, '..', file.path);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(colors.yellow(`  ⚠ 文件不存在，跳过: ${file.path}`));
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const updatedContent = file.update(content);
    
    if (updatedContent !== null) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      hasChanges = true;
    }
  } catch (error) {
    console.error(colors.red(`  ❌ 处理 ${file.path} 失败: ${error.message}`));
  }
});

console.log('');
if (hasChanges) {
  console.log(colors.green('✅ 版本同步完成！'));
} else {
  console.log(colors.green('✅ 所有文件版本号已是最新！'));
}
console.log('');

