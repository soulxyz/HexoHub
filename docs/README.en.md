# HexoHub

<div style="text-align: center;">[中文文档](https://github.com/forever218/HexoHub/)  |  English</div>  

<div align="center">
  <img 
    src="https://github.com/user-attachments/assets/cac9facb-b0e1-414e-b0a9-21c488f790ef" 
    alt="image" 
    width="80%" 
  />
</div>

A Hexo blog management desktop application built with Electron + Next.js, providing a graphical user interface to replace traditional command-line operations.  
> Say goodbye to the tedious traditional command-line approach (I’m already tired of `hexo xxxx` 🫠) and manage your Hexo blog in a more elegant way.

# ✨ Key Features

## 📝 Post Management

Within this application, you can visually **create new posts**, **view the post list**, **edit posts**, **preview in real time**, **start a local preview**, **generate and deploy static files**, and **delete posts**.

## 🧩 Image Drag-and-Drop
This might be one of the highlights of the app. When you have enabled Hexo’s asset folder feature ([What’s this?](https://hexo.io/docs/asset-folders)), you can use the `{% asset_img example.jpg %}` tag to reference local images in your blog.  
However, typing `{% asset_img example.jpg %}` repeatedly can be quite inconvenient—especially when the file name is complex.  
In this application, you simply place the image inside the asset folder with the same name as your post (e.g., `\blog\source\_posts\test-post`) and then drag the image into the editor window. The `{% asset_img example.jpg %}` tag will be automatically inserted, saving you from typing the file name yourself.

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

## ⚙️ Hexo Commands  
**Command Execution**: Run common Hexo commands through a graphical interface, including:  
  - `hexo clean` – Clear cache files  
  - `hexo generate` – Generate static files  
  - `hexo deploy` – Deploy to remote server  
  - `hexo se` – Start local preview  
**Real-time Feedback**: Displays command execution results and error messages.

## 🔧 Configuration Management  
**Basic Settings**: Site title, subtitle, author, language  
**Advanced Settings**: URL settings, permalink format  
**YAML Editing**: Directly edit the raw configuration file  
**Import/Export**: Back up and restore configuration files, making it easier to migrate your theme.

# 🚀 Quick Start

- **OS**: Windows 10 or later  
- **Node.js**: Node.js and Hexo CLI required  
- **RAM**: Recommended 4GB+  
- **Storage**: Recommended 100MB free space  
⚠️ For speed considerations, I used `cnpm` during development and modified part of the `package.json`. Please decide whether to use `cnpm`. If so, run:  
```bash
npm install -g cnpm --registry=http://registry.npm.taobao.org
```
Then you can use `cnpm` instead of `npm`.

1. **Clone this repository**
   ```bash
   git clone https://github.com/forever218/HexoHub.git
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run in development mode** – You can already use the app at this step.
   ```bash
   npm run electron
   ```

4. **Build the app** (optional)
   ```bash
   npm run dist
   ```
⚠️ Due to my limited technical ability, I encountered problems when packaging the app, so I haven’t released a public build yet. Please use the `npm run electron` command to start the program.

# 🛠️ Tech Stack

## Frontend
- **Next.js 15** – React full-stack framework  
- **React 19** – UI library  
- **TypeScript** – Type-safe JavaScript  
- **Tailwind CSS** – Utility-first CSS framework  
- **shadcn/ui** – High-quality React component library  
- **Electron** – Cross-platform desktop app framework  
- **electron-builder** – App packaging tool  
- **NSIS** – Windows installer creator  
- **react-markdown** – Markdown rendering  
- **react-syntax-highlighter** – Code syntax highlighting  
- **remark-gfm** – GitHub-flavored Markdown extension  
- **date-fns** – Date utility library

# 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Main page
│   ├── layout.tsx                # App layout
│   └── globals.css               # Global styles
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── markdown-editor.tsx       # Markdown editor
│   ├── markdown-preview.tsx      # Markdown preview
│   ├── post-list.tsx             # Post list
│   └── hexo-config.tsx           # Hexo configuration management
├── lib/
│   ├── windows-compat.ts         # Windows compatibility utilities
│   ├── utils.ts                  # Utility functions
│   └── db.ts                     # Database connection
└── hooks/
    ├── use-toast.ts               # Toast notification hook
    └── use-mobile.ts              # Mobile device detection hook

public/
├── electron.js                   # Electron main process
├── icon.svg                       # App icon
├── installer.nsh                  # NSIS installer script
└── logo.svg                       # App logo
```

# 🤝 Contributing

Issues and Pull Requests are welcome!  
1. Fork the repository  
2. Create a feature branch  
3. Commit your changes  
4. Create a Pull Request  

---

I faced many challenges during development. If you’d like to join this project and become like-minded friends, I’d be extremely grateful—and I’ll buy you a coffee! ☕  
You can contact me via:  
- Email: 3316703158@qq.com  
- Blog: https://2am.top  
- GitHub  

## Code Style
No strict rules (honestly, my code is a mess 👻). As long as it’s human-readable, it’s fine.

# 🙏 Acknowledgements

- [Next.js](https://nextjs.org/) – React framework  
- [Electron](https://www.electronjs.org/) – Desktop app framework  
- [shadcn/ui](https://ui.shadcn.com/) – UI component library  
- [Tailwind CSS](https://tailwindcss.com/) – CSS framework  
- [Hexo](https://hexo.io/) – Static blog generator  
