use std::fs;
use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::sync::Mutex;
use std::time::SystemTime;
use tauri::State;

// Manager 仅在 debug 模式下使用（用于 get_webview_window 方法）
#[cfg(debug_assertions)]
use tauri::Manager;

use serde::{Deserialize, Serialize};

// Windows 平台特定的导入，用于隐藏命令行窗口和处理编码
#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

#[cfg(target_os = "windows")]
use encoding_rs::GBK;

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
#[serde(rename_all = "camelCase")]
struct FileInfo {
    name: String,
    path: String,
    is_directory: bool,
    size: u64,
    modified_time: String,
}

// 将 SystemTime 转换为 ISO 8601 格式的字符串
fn format_system_time(time: SystemTime) -> String {
    match time.duration_since(SystemTime::UNIX_EPOCH) {
        Ok(duration) => {
            let timestamp_millis = duration.as_millis();
            // 返回 ISO 8601 格式的时间字符串
            // JavaScript 可以直接使用 new Date(timestamp) 解析
            timestamp_millis.to_string()
        }
        Err(_) => "0".to_string(),
    }
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
            let modified_time = metadata.modified()
                .map(|t| format_system_time(t))
                .unwrap_or_else(|_| "0".to_string());
            
            files.push(FileInfo {
                name: file_name,
                path: entry.path().to_string_lossy().to_string(),
                is_directory: false,
                size: metadata.len(),
                modified_time,
            });
        }
    }
    
    Ok(files)
}

// 智能解码：优先尝试 UTF-8，失败则尝试 GBK（Windows）
#[cfg(target_os = "windows")]
fn smart_decode(bytes: &[u8]) -> String {
    // 首先尝试 UTF-8 解码
    if let Ok(utf8_str) = std::str::from_utf8(bytes) {
        return utf8_str.to_string();
    }
    
    // UTF-8 失败，尝试 GBK 解码（中文 Windows 默认编码）
    let (decoded, _, had_errors) = GBK.decode(bytes);
    if !had_errors {
        return decoded.into_owned();
    }
    
    // 都失败了，使用 lossy 转换
    String::from_utf8_lossy(bytes).to_string()
}

#[cfg(not(target_os = "windows"))]
fn smart_decode(bytes: &[u8]) -> String {
    String::from_utf8_lossy(bytes).to_string()
}

// 执行命令
#[tauri::command]
async fn execute_command(command: String) -> CommandResult {
    let output = if cfg!(target_os = "windows") {
        // 在 Windows 上使用 cmd.exe，它在隐藏窗口模式下更可靠
        // 使用 chcp 65001 切换到 UTF-8 编码，但会产生额外输出
        // 所以我们还是用 GBK 编码，然后在 Rust 侧转码
        let mut cmd = Command::new("cmd");
        cmd.args(&["/C", &command]);
        #[cfg(target_os = "windows")]
        cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
        cmd.output()
    } else {
        Command::new("sh")
            .arg("-c")
            .arg(&command)
            .output()
    };
    
    match output {
        Ok(output) => {
            // 使用智能解码（自动检测 UTF-8/GBK）
            let stdout = smart_decode(&output.stdout);
            let stderr = smart_decode(&output.stderr);
            
            CommandResult {
                success: output.status.success(),
                stdout: Some(stdout.clone()),
                stderr: Some(stderr.clone()),
                error: if !output.status.success() && stdout.is_empty() && stderr.is_empty() {
                    Some("命令执行失败，未返回输出".to_string())
                } else {
                    None
                },
            }
        },
        Err(e) => CommandResult {
            success: false,
            stdout: None,
            stderr: None,
            error: Some(format!("命令执行错误: {}", e)),
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
        // 还是用回 cmd.exe，据说它在隐藏窗口模式下更可靠
        let mut cmd = Command::new("cmd");
        cmd.args(&["/C", &full_command])
           .current_dir(&working_dir);
        #[cfg(target_os = "windows")]
        cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
        cmd.output()
    } else {
        Command::new("sh")
            .arg("-c")
            .arg(&full_command)
            .current_dir(&working_dir)
            .output()
    };
    
    match output {
        Ok(output) => {
            // 使用智能解码（自动检测 UTF-8/GBK）
            let stdout = smart_decode(&output.stdout);
            let stderr = smart_decode(&output.stderr);
            
            CommandResult {
                success: output.status.success(),
                stdout: Some(stdout.clone()),
                stderr: Some(stderr.clone()),
                error: if !output.status.success() && stdout.is_empty() && stderr.is_empty() {
                    Some("命令执行失败，未返回输出".to_string())
                } else {
                    None
                },
            }
        },
        Err(e) => CommandResult {
            success: false,
            stdout: None,
            stderr: None,
            error: Some(format!("命令执行错误: {}", e)),
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
    
    let mut cmd = Command::new(hexo_cmd);
    cmd.arg("server")
        .current_dir(&working_dir)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());
    
    // 在 Windows 上隐藏窗口
    #[cfg(target_os = "windows")]
    cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
    
    let child = cmd.spawn().map_err(|e| e.to_string())?;
    
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

#[tauri::command]
async fn show_in_folder(path: String) -> Result<(), String> {
    // 依据 https://github.com/tauri-apps/plugins-workspace/issues/999 解决本问题
    // 直接打开文件夹（而不是选中它）
    
    use std::path::Path;
    use std::process::Command;
    
    // 标准化路径（将正斜杠转换为反斜杠，仅在 Windows 上）
    #[cfg(target_os = "windows")]
    let normalized_path = path.replace("/", "\\");
    
    #[cfg(not(target_os = "windows"))]
    let normalized_path = path.clone();
    
    println!("[Rust] show_in_folder called with path: {}", path);
    println!("[Rust] Normalized path: {}", normalized_path);
    
    // 检查路径是否存在
    if !Path::new(&normalized_path).exists() {
        let error_msg = format!("Path does not exist: {}", normalized_path);
        println!("[Rust] Error: {}", error_msg);
        return Err(error_msg);
    }
    
    println!("[Rust] Path exists, opening folder...");
    
    // 使用系统命令直接打开文件夹
    #[cfg(target_os = "windows")]
    {
        println!("[Rust] Using Windows explorer to open folder...");
        match Command::new("explorer")
            .arg(&normalized_path)
            .spawn()
        {
            Ok(_) => {
                println!("[Rust] Folder opened successfully");
                Ok(())
            },
            Err(e) => {
                let error_msg = format!("Failed to open folder: {}", e);
                println!("[Rust] Error: {}", error_msg);
                Err(error_msg)
            }
        }
    }
    
    #[cfg(target_os = "macos")]
    {
        println!("[Rust] Using macOS open command...");
        match Command::new("open")
            .arg(&normalized_path)
            .spawn()
        {
            Ok(_) => {
                println!("[Rust] Folder opened successfully");
                Ok(())
            },
            Err(e) => {
                let error_msg = format!("Failed to open folder: {}", e);
                println!("[Rust] Error: {}", error_msg);
                Err(error_msg)
            }
        }
    }
    
    #[cfg(target_os = "linux")]
    {
        println!("[Rust] Using Linux xdg-open command...");
        match Command::new("xdg-open")
            .arg(&normalized_path)
            .spawn()
        {
            Ok(_) => {
                println!("[Rust] Folder opened successfully");
                Ok(())
            },
            Err(e) => {
                let error_msg = format!("Failed to open folder: {}", e);
                println!("[Rust] Error: {}", error_msg);
                Err(error_msg)
            }
        }
    }
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
        show_in_folder,
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
