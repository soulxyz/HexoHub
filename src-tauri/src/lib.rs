use std::fs;
use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::sync::Mutex;
use tauri::{Manager, State};//get_webview_window 方法需要Manager导入
use serde::{Deserialize, Serialize};

// 存储 Hexo 服务器进程
struct HexoServer(Mutex<Option<std::process::Child>>);

#[derive(Debug, Serialize, Deserialize)]
struct CommandResult {
    success: bool,
    stdout: Option<String>,
    stderr: Option<String>,
    error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct ValidationResult {
    valid: bool,
    message: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct FileInfo {
    name: String,
    path: String,
    is_directory: bool,
    size: u64,
    modified_time: String,
}

// 读取文件
#[tauri::command]
async fn read_file(file_path: String) -> Result<String, String> {
    fs::read_to_string(&file_path)
        .map_err(|e| e.to_string())
}

// 写入文件
#[tauri::command]
async fn write_file(file_path: String, content: String) -> Result<bool, String> {
    fs::write(&file_path, content)
        .map(|_| true)
        .map_err(|e| e.to_string())
}

// 删除文件
#[tauri::command]
async fn delete_file(file_path: String) -> Result<bool, String> {
    fs::remove_file(&file_path)
        .map(|_| true)
        .map_err(|e| e.to_string())
}

// 列出目录中的文件
#[tauri::command]
async fn list_files(directory_path: String) -> Result<Vec<FileInfo>, String> {
    let entries = fs::read_dir(&directory_path)
        .map_err(|e| e.to_string())?;
    
    let mut files = Vec::new();
    
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let metadata = entry.metadata().map_err(|e| e.to_string())?;
        let file_name = entry.file_name().to_string_lossy().to_string();
        
        // 忽略隐藏文件
        if file_name.starts_with('.') {
            continue;
        }
        
        // Windows 系统文件
        #[cfg(target_os = "windows")]
        {
            let system_files = ["desktop.ini", "thumbs.db", "folder.htt", "folder.ini"];
            if system_files.contains(&file_name.to_lowercase().as_str()) {
                continue;
            }
        }
        
        if metadata.is_file() {
            files.push(FileInfo {
                name: file_name,
                path: entry.path().to_string_lossy().to_string(),
                is_directory: false,
                size: metadata.len(),
                modified_time: format!("{:?}", metadata.modified().ok()),
            });
        }
    }
    
    Ok(files)
}

// 执行命令
#[tauri::command]
async fn execute_command(command: String) -> CommandResult {
    let output = if cfg!(target_os = "windows") {
        Command::new("powershell")
            .args(&["-NoProfile", "-Command", &command])
            .output()
    } else {
        Command::new("sh")
            .arg("-c")
            .arg(&command)
            .output()
    };
    
    match output {
        Ok(output) => CommandResult {
            success: output.status.success(),
            stdout: Some(String::from_utf8_lossy(&output.stdout).to_string()),
            stderr: Some(String::from_utf8_lossy(&output.stderr).to_string()),
            error: None,
        },
        Err(e) => CommandResult {
            success: false,
            stdout: None,
            stderr: None,
            error: Some(e.to_string()),
        },
    }
}

// 执行 Hexo 命令
#[tauri::command]
async fn execute_hexo_command(command: String, working_dir: String) -> CommandResult {
    let hexo_cmd = if cfg!(target_os = "windows") {
        "hexo.cmd"
    } else {
        "hexo"
    };
    
    let full_command = format!("{} {}", hexo_cmd, command);
    
    let output = if cfg!(target_os = "windows") {
        Command::new("powershell")
            .args(&["-NoProfile", "-Command", &full_command])
            .current_dir(&working_dir)
            .output()
    } else {
        Command::new("sh")
            .arg("-c")
            .arg(&full_command)
            .current_dir(&working_dir)
            .output()
    };
    
    match output {
        Ok(output) => CommandResult {
            success: output.status.success(),
            stdout: Some(String::from_utf8_lossy(&output.stdout).to_string()),
            stderr: Some(String::from_utf8_lossy(&output.stderr).to_string()),
            error: None,
        },
        Err(e) => CommandResult {
            success: false,
            stdout: None,
            stderr: None,
            error: Some(e.to_string()),
        },
    }
}

// 验证 Hexo 项目
#[tauri::command]
async fn validate_hexo_project(directory_path: String, language: String) -> ValidationResult {
    let config_path = PathBuf::from(&directory_path).join("_config.yml");
    let package_path = PathBuf::from(&directory_path).join("package.json");
    
    if config_path.exists() {
        if let Ok(content) = fs::read_to_string(&config_path) {
            if content.contains("title:") || content.contains("theme:") {
                let message = if language == "en" {
                    "Valid Hexo Project".to_string()
                } else {
                    "有效的Hexo项目".to_string()
                };
                return ValidationResult { valid: true, message };
            }
        }
        
        if package_path.exists() {
            if let Ok(content) = fs::read_to_string(&package_path) {
                if content.contains("hexo") {
                    let message = if language == "en" {
                        "Valid Hexo Project".to_string()
                    } else {
                        "有效的Hexo项目".to_string()
                    };
                    return ValidationResult { valid: true, message };
                }
            }
        }
        
        return ValidationResult {
            valid: true,
            message: "找到Hexo配置文件".to_string(),
        };
    }
    
    let message = if language == "en" {
        "Not a valid Hexo project directory".to_string()
    } else {
        "不是有效的Hexo项目目录".to_string()
    };
    ValidationResult { valid: false, message }
}

// 启动 Hexo 服务器
#[tauri::command]
async fn start_hexo_server(working_dir: String, server_state: State<'_, HexoServer>) -> Result<CommandResult, String> {
    // 停止现有服务器
    let mut server = server_state.0.lock().unwrap();
    if let Some(mut child) = server.take() {
        let _ = child.kill();
    }
    
    let hexo_cmd = if cfg!(target_os = "windows") {
        "hexo.cmd"
    } else {
        "hexo"
    };
    
    let child = Command::new(hexo_cmd)
        .arg("server")
        .current_dir(&working_dir)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| e.to_string())?;
    
    *server = Some(child);
    
    Ok(CommandResult {
        success: true,
        stdout: Some("Hexo服务器已启动在 http://localhost:4000".to_string()),
        stderr: None,
        error: None,
    })
}

// 停止 Hexo 服务器
#[tauri::command]
async fn stop_hexo_server(server_state: State<'_, HexoServer>) -> Result<CommandResult, String> {
    let mut server = server_state.0.lock().unwrap();
    
    if let Some(mut child) = server.take() {
        child.kill().map_err(|e| e.to_string())?;
        Ok(CommandResult {
            success: true,
            stdout: Some("服务器已停止".to_string()),
            stderr: None,
            error: None,
        })
    } else {
        Ok(CommandResult {
            success: false,
            stdout: None,
            stderr: None,
            error: Some("没有正在运行的服务器".to_string()),
        })
    }
}

// 窗口控制命令
#[tauri::command]
async fn minimize_window(window: tauri::Window) {
    let _ = window.minimize();
}

#[tauri::command]
async fn maximize_restore_window(window: tauri::Window) {
    if window.is_maximized().unwrap_or(false) {
        let _ = window.unmaximize();
    } else {
        let _ = window.maximize();
    }
}

#[tauri::command]
async fn close_window(window: tauri::Window) {
    let _ = window.close();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_window_state::Builder::default().build())
    .manage(HexoServer(Mutex::new(None)))
    .invoke_handler(tauri::generate_handler![
        read_file,
        write_file,
        delete_file,
        list_files,
        execute_command,
        execute_hexo_command,
        validate_hexo_project,
        start_hexo_server,
        stop_hexo_server,
        minimize_window,
        maximize_restore_window,
        close_window,
    ])
    .setup(|_app| {
      #[cfg(debug_assertions)]
      {
        _app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
        
        // 在开发模式下自动打开开发者工具
        if let Some(window) = _app.get_webview_window("main") {
          window.open_devtools();
          window.close_devtools();  // 先关闭
          window.open_devtools();   // 再打开，确保显示
        }
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
