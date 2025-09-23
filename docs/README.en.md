# HexoHub

[中文文档](https://github.com/forever218/HexoHub/blob/main/README.md)  |  [English](https://github.com/forever218/HexoHub/blob/main/docs/README.en.md)  

[![GitHub Stars](https://img.shields.io/github/stars/forever218/Hexohub)](https://github.com/forever218/Hexohub/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/forever218/Hexohub)](https://github.com/forever218/Hexohub/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/forever218/Hexohub)](https://github.com/forever218/Hexohub/issues)
[![GitHub License](https://img.shields.io/github/license/forever218/Hexohub)](https://github.com/forever218/Hexohub)
[![GitHub all releases](https://img.shields.io/github/downloads/forever218/Hexohub/total)](https://github.com/forever218/Hexohub/releases)

<div align="center">
  <img 
    src="https://github.com/user-attachments/assets/185d93c6-836b-434a-a9b8-55400dc25f3e" 
    alt="image" 
    width="80%" 
  />
</div>

<div align="center">
  <img 
    src="https://github.com/user-attachments/assets/10fadb85-4fb7-438f-884d-b80e90886e5e" 
    alt="image" 
    width="80%" 
  />
</div>

A Hexo blog management desktop application built with Electron + Next.js, providing a graphical interface to replace traditional command-line operations.
> Say goodbye to tedious traditional command-line methods (I'm already tired of hexo xxxx🫠), manage your Hexo blog in a more elegant way.

## Article Management

In this application, you can visually: **Create new articles**, **View article list**, **Edit articles**, **Real-time preview**, **Start local preview**, **Generate and push static files**, **Delete articles**

## Image Drag & Drop
This might be one of the highlights of this application. When you enable Hexo's asset folder feature ([What is this?](https://hexo.io/docs/asset-folders)), you can use the `{% asset_img example.jpg %}` tag to reference local images in your blog.
However, frequently typing `{% asset_img example.jpg %}` is obviously unsatisfactory (especially when image filenames are complex). So in this application, you just need to place images in the asset folder with the same name as the article (e.g., `\blog\source\_posts\Test Article`), then drag the image into the editing window to automatically insert the `{% asset_img example.jpg %}` tag, saving you the trouble of typing filenames.

<div align="center">
  <img 
    src="https://github.com/user-attachments/assets/2aced4e0-ef08-4daf-af8b-6a31f43a2d56" 
    alt="image" 
    width="80%" 
  />
</div>  

<div align="center">
  <img 
    src="https://github.com/user-attachments/assets/be796a74-7990-4780-a93e-4c3c72d07335" 
    alt="image" 
    width="80%" 
  />
</div>

## Hexo Operations 
**Command Execution**: Graphically execute common Hexo commands, including:  
  - `hexo clean` - Clean cache files
  - `hexo generate` - Generate static files
  - `hexo deploy` - Deploy to remote server
  - `hexo serve` - Start local preview   
**Real-time Feedback**: Display command execution results and error messages

## Configuration Management
**Basic Settings**: Website title, subtitle, author, language  
**Advanced Settings**: URL configuration, permalink format  
**YAML Editing**: Support direct editing of raw configuration files  
**Import/Export**: Configuration file backup and restore, making theme migration more convenient

# Quick Start  
## Usage

If you only need to "use" this application:   
- **Operating System**: Windows 10 or higher    
- **Storage**: Recommended 900MB available space  
- **Hexo**: https://hexo.io/
- **Npm**: `npm>10`    👉https://www.npmjs.com/
- **Node.js**: `nodejs>20`    👉https://nodejs.org/   

Then go to [Releases](https://github.com/forever218/HexoHub/releases/) to download the latest version.  
  
## Development   

If you need to "develop" this application, here are the additional requirements:   
- **Git**: https://git-scm.com/   
- **nodejs**: `TypeScript>4.5`, `React>19`, `Next.js>15`   

⚠️ For speed considerations, I used `cnpm` during development and modified some `package.json` content. Please consider this when using. If you want to use `cnpm`, please execute:  

```bash
npm install -g cnpm --registry=http://registry.npm.taobao.org
```

Then you can replace `npm` with `cnpm`

1. **Clone this repository**
   ```bash
   git clone https://github.com/forever218/HexoHub.git
   ```
 
2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run in development mode** - You can use it at this step
   ```bash
   npm run electron
   ```

4. **Package the application** (Optional)
   ```bash
   npm run build
   npm run make
   ```

> **Note**: This application is packaged with `electron-builder`, not `electron-forge`. When modifying related configuration files, please note to use the `electron-builder` configuration file format. [electron-builder](https://www.electron.build/)

## Linux Compatibility & Troubleshooting
The AppImage ships with an embedded Electron runtime. On some Arch / Manjaro / Wayland or Mesa driver setups you may see repeated console lines like:

```
GetVSyncParametersIfAvailable() failed for X times!
```

These are Chromium GPU / VSync timing warnings and usually harmless. To mitigate or suppress them:

1. The app already adds `--disable-gpu-vsync` internally to reduce spam.
2. If you still see flickering / blank window, run with GPU disabled:
  ```bash
  HEXOHUB_DISABLE_GPU=1 ./HexoHub-<version>.AppImage
  ```
3. On Wayland, Electron tries auto ozone platform detection. If window decorations or input behave oddly, try switching session (Wayland <-> X11).
4. In headless / remote desktop (llvmpipe / no real GPU) environments, prefer the `HEXOHUB_DISABLE_GPU=1` launch.

When reporting graphics issues, please include:
```
Distribution & version:
Desktop environment & session (X11/Wayland):
GPU vendor / driver (e.g. NVIDIA proprietary, Mesa AMD, Intel):
Whether HEXOHUB_DISABLE_GPU was required (yes/no):
```

If disabling GPU fully resolves the issue, open an Issue—we may add smarter auto detection paths.

# Tech Stack

- **Next.js 15** - React full-stack framework
- **React** - User interface library
- **TypeScript** - Type-safe JavaScript  
- **Tailwind CSS** - CSS framework  
- **Electron** - Cross-platform desktop application framework
- **electron-builder** - Application packaging tool
- **NSIS** - Windows installer creation tool
- **remark-gfm** - GitHub Flavored Markdown extension
- [Hexo](https://hexo.io/) - Static blog generator

# Contributing Guidelines

Issues and Pull Requests are welcome!  
1. Fork the project
2. Create a feature branch
3. Commit changes
4. Create a Pull Request

---

I encountered many problems during development. If you can join this project and become a like-minded friend, I would be extremely grateful and buy you a cup of coffee! ☕
You can contact me through:
- Email: 3316703158@qq.com
- My blog: https://2am.top
- GitHub

## Internationalization (i18n)
This project uses `next-i18next` for internationalization. You can configure your language packs in `i18n.js`, aimed at helping your project easily support multiple languages, allowing users worldwide to use it without barriers.   

-  Multi-language support: Easily switch between different languages   
-  Simple integration: Quick to get started, compatible with mainstream frameworks   
-  Extensible: Custom translations and language packs  

```bash
# Install module
npm install your-i18n-module
```

```typescript
// Initialize
import i18n from 'your-i18n-module';

i18n.init({
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'zh', 'es', 'fr']
});
```

## Code Standards
No standards (actually my code is a mess👻), as long as what you write is human language

# LICENSE

This project uses the [MIT](https://choosealicense.com/licenses/mit/) license. Please comply with relevant laws and regulations when using this project.

# Changelog
For more logs, please check releases
## v3 (2025-08-16)
New features:  
- Added right-click logic to the "Article List" interface for quick operations  
- Added "Tag Cloud" on the left side  
 
Bug fixes: 
- Fixed the issue where "Website Title" setting failed in Hexo configuration   
- Fixed occasional sorting confusion when "Sort by Article Name"  
- Fixed the error when generating static files when "Author" is empty  

## v2 (2025-08-13)
New features:  
- Refactored "Article List" functionality, placed it in the right main window   
- Added "Display articles by tags/categories" functionality   
- Added batch article processing (batch delete/add tags/add categories) 
- Added internationalization support   

Bug fixes:  
- Fixed some light/dark theme switching anomalies  

## v1 (2025-08-10)
- Initial build  
- Basic commands, article sorting by date/name  
- Basic functionality implementation