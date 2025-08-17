const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseVersion, FuseV1Options } = require('@electron/fuses');
const path = require('path');

const config = {
  packagerConfig: {
    asar: true,
    name: 'HexoHub',
    icon: path.join(__dirname, 'public', 'icon.ico'),
    appBundleId: 'com.hexo.desktop',
    appCategoryType: 'public.app-category.productivity',
    win32metadata: {
      CompanyName: 'HexoHub',
      OriginalFilename: 'HexoHub.exe'
    },
    electronDownload: {
      mirror: 'https://npmmirror.com/mirrors/electron/'
    }
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'HexoHub',
        authors: 'HexoHub Team',
        description: 'HexoHub Desktop Application',
        exe: 'HexoHub.exe',
        setupIcon: path.join(__dirname, 'public', 'icon.ico')
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin']
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          icon: path.join(__dirname, 'public', 'icon.png')
        }
      }
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          icon: path.join(__dirname, 'public', 'icon.png')
        }
      }
    }
  ],
  plugins: [
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    })
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'your-github-username',
          name: 'your-repository-name'
        },
        prerelease: true
      }
    }
  ]
};

module.exports = config;
