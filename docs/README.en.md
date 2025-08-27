# HexoHub

[中文文档](https://github.com/forever218/HexoHub/blob/main/README.md)  |  [English](https://github.com/forever218/HexoHub/blob/main/docs/README.en.md)

[![GitHub Stars](https://img.shields.io/github/stars/forever218/Hexohub)](https://github.com/forever218/Hexohub/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/forever218/Hexohub)](https://github.com/forever218/Hexohub/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/forever218/Hexohub)](https://github.com/forever218/Hexohub/issues)
[![GitHub License](https://img.shields.io/github/license/forever218/Hexohub)](https://github.com/forever218/Hexohub)
[![GitHub all releases](https://img.shields.io/github/downloads/forever218/Hexohub/total)](https://github.com/forever218/Hexohub/releases)

<div align="center">
  <img 
    src="https://github.com/user-attachments/assets/cac9facb-b0e1-414e-b0a9-21c488f790ef" 
    alt="image" 
    width="80%" 
  />
</div>

A Hexo blog management desktop application built with Electron + Next.js, providing a graphical interface to replace traditional command-line operations.  
> Say goodbye to the cumbersome command line (I’m tired of typing hexo xxxx🫠) and manage your Hexo blog in a more elegant way.


## 📝 Post Management

In this application, you can visually: **create new posts**, **view post list**, **edit posts**, **real-time preview**, **start local preview**, **generate and deploy static files**, **delete posts**.

## 🧩 Drag-and-Drop Images
This might be one of the highlights of this app. When you enable Hexo’s asset folder ([what’s this?](https://hexo.io/docs/asset-folders)), you can use the `{% asset_img example.jpg %}` tag to reference local images in your blog.  
However, frequently typing `{% asset_img example.jpg %}` is clearly inconvenient (especially when filenames are complex). In this app, you only need to place the image into the resource folder with the same name as the post (for example: `\blog\source\_posts\Test Post`) and drag the image into the editor window—it will automatically insert `{% asset_img example.jpg %}` for you, saving the trouble of typing filenames.    

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


## ⚙️ Hexo Operations 
**Command Execution**: Graphical execution of common Hexo commands, including:  
  - `hexo clean` - Clear cache files
  - `hexo generate` - Generate static files
  - `hexo deploy` - Deploy to remote server
  - `hexo se` - Start local preview   
**Real-time Feedback**: Display execution results and error messages.

## 🔧 Configuration Management
**Basic Settings**: Site title, subtitle, author, language  
**Advanced Settings**: URL configuration, permalink format  
**YAML Editing**: Directly edit raw configuration files  
**Import/Export**: Backup and restore configuration files, making theme migration easier.

# 🚀 Quick Start  
## Usage

If you just want to “use” this app:   
- **OS**: Windows 10 or higher  
- **Storage**: Recommended 400MB available space  
- **Hexo**: https://hexo.io/
- **Npm**: `npm > 10` 👉 https://www.npmjs.com/
- **Node.js**: `nodejs > 20` 👉 https://nodejs.org/   
Then go to [Releases](https://github.com/forever218/HexoHub/releases/) to download the latest version.  
  
## Development   

If you want to “develop” this app, you’ll also need:   
- **Git**: https://git-scm.com/   
- **nodejs**: `TypeScript > 4.5`, `React > 19`, `Next.js > 15`   


⚠️ For speed, I used `cnpm` during development and modified some parts of `package.json`. Please take this into consideration. If you want to use `cnpm`, run:  

```bash
npm install -g cnpm --registry=http://registry.npm.taobao.org
```

Then you can replace `npm` with `cnpm`.

1. **Clone the repository**
   ```bash
   git clone https://github.com/forever218/HexoHub.git
   ```
 
2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run in development mode**—you can already use it at this step
   ```bash
   npm run electron
   ```

4. **Package the app** (optional)
   ```bash
   npm run make
   ```

> **Note**: This application is packaged with `electron-builder`, not `electron-forge`. When modifying config files, make sure to follow the `electron-builder` format. [electron-builder](https://www.electron.build/)


# 🛠️ Tech Stack

- **Next.js 15** - React full-stack framework
- **React** - UI library
- **TypeScript** - Type-safe JavaScript  
- **Tailwind CSS** - CSS framework  
- **Electron** - Cross-platform desktop framework
- **electron-builder** - App packaging tool
- **NSIS** - Windows installer builder
- **remark-gfm** - GitHub flavored Markdown extension



# 🤝 Contribution Guide

Issues and Pull Requests are welcome!  
1. Fork the repo  
2. Create a feature branch  
3. Commit changes  
4. Create a Pull Request  

---

I encountered many problems during development. If you could join this project as a like-minded friend, I’d be very grateful—I’ll even buy you a coffee! ☕  
You can reach me via:  
- Email: 3316703158@qq.com  
- Blog: https://2am.top  
- GitHub  

## Internationalization (i18n)
This project uses `next-i18next` for i18n. You can configure your language packs in `i18n.js`, helping your project easily support multiple languages so users worldwide can use it without barriers.   

-  Multi-language support: easily switch languages  
-  Simple integration: quick setup, compatible with popular frameworks  
-  Extensible: customize translations and language packs  

```bash
# Install module
npm install your-i18n-module
```

```typescript
// Initialization
import i18n from 'your-i18n-module';

i18n.init({
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'zh', 'es', 'fr']
});
```


## Code Style
No strict rules (my code is actually a mess👻), as long as it’s readable. 
 
#  LICENSE

This project is licensed under the [MIT](https://choosealicense.com/licenses/mit/) License. Please comply with relevant laws and regulations when using this project.


# 🙏 Acknowledgements

- [Next.js](https://nextjs.org/) - React framework  
- [Electron](https://www.electronjs.org/) - Desktop framework  
- [shadcn/ui](https://ui.shadcn.com/) - UI component library  
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework  
- [Hexo](https://hexo.io/) - Static site generator  

# Changelog
## v3 (2025-08-16)
New Features:  
- Added right-click logic in “Post List” for quick actions  
- Added “Tag Cloud” on the left sidebar  
 
Bug Fixes:  
- Fixed “Site Title” setting failure under Hexo config  
- Fixed occasional sorting disorder when sorting by post name  
- Fixed error when generating static files if “Author” was empty  

## v2 (2025-08-13)
New Features:  
- Refactored “Post List” to the right main window  
- Added “Show posts by tag/category” feature  
- Added batch post processing (batch delete/add tags/add categories)  
- Added internationalization support  

Bug Fixes:  
- Fixed some light/dark mode anomalies  

## v1 (2025-08-10)
- Initial build  
- Basic commands, post sorting by date/name  
- Basic feature implementation  
