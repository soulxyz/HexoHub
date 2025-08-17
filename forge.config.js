const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    name: 'HexoHub',
    icon: 'public/icon',
    appBundleId: 'com.hexo.desktop',
    appCategoryType: 'public.app-category.productivity',
    asar: true,
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
        setupIcon: 'public/icon.ico'
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
          icon: 'public/icon.png'
        }
      }
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          icon: 'public/icon.png'
        }
      }
    }
  ],
  plugins: [
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    })
  ]
};
