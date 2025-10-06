use std::fs;
use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::sync::Mutex;
use std::time::SystemTime;
use tauri::State;

// 导入 Manager trait（用于 state、get_webview_window 等方法）
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

// 复制文件
#[tauri::command]
async fn copy_file(source_path: String, destination_path: String) -> Result<String, String> {
    // 确保目标目录存在
    if let Some(parent) = PathBuf::from(&destination_path).parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    
    // 复制文件
    fs::copy(&source_path, &destination_path)
        .map(|_| destination_path)
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

// 执行命令（使用 Tauri Shell 插件，自动处理参数和引号）
#[tauri::command]
async fn execute_command(command: String, app_handle: tauri::AppHandle) -> CommandResult {
    use tauri_plugin_shell::ShellExt;
    
    // 使用 Tauri Shell 插件执行命令
    // 优势：
    // 1. 自动处理引号和转义问题
    // 2. 跨平台兼容性好
    // 3. 正确处理带空格的路径
    let shell = app_handle.shell();
    
    let output_result = if cfg!(target_os = "windows") {
        // Windows: 使用 cmd /C 执行命令
        // Tauri shell 插件会正确处理参数，不会出现引号被当作路径的问题
        shell
            .command("cmd")
            .args(["/C", &command])
            .output()
            .await
    } else {
        // Unix: 使用 sh -c 执行命令
        shell
            .command("sh")
            .args(["-c", &command])
            .output()
            .await
    };
    
    match output_result {
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
    
    #[allow(unused_mut)]
    if let Some(mut child) = server.take() {
        let pid = child.id();
        println!("正在停止 Hexo 服务器进程 PID: {}", pid);
        
        #[cfg(target_os = "windows")]
        {
            // Windows: 使用 taskkill 杀死整个进程树
            // /T 参数会终止指定进程及其所有子进程
            // /F 参数强制终止
            let output = Command::new("taskkill")
                .args(&["/pid", &pid.to_string(), "/T", "/F"])
                .output();
            
            match output {
                Ok(result) => {
                    if result.status.success() {
                        println!("成功终止进程树 PID: {}", pid);
                    } else {
                        eprintln!("taskkill 失败: {}", String::from_utf8_lossy(&result.stderr));
                        // 尝试直接 kill
                        let _ = child.kill();
                    }
                },
                Err(e) => {
                    eprintln!("执行 taskkill 失败: {}", e);
                    // 回退到直接 kill
                    let _ = child.kill();
                }
            }
            
            // 额外保险：杀死所有占用 4000 端口的进程
            let _ = Command::new("cmd")
                .args(&["/C", "for /f \"tokens=5\" %a in ('netstat -ano ^| findstr :4000 ^| findstr LISTENING') do @taskkill /F /PID %a"])
                .output();
        }
        
        #[cfg(not(target_os = "windows"))]
        {
            // Linux/Mac: 发送 SIGTERM 信号
            use std::thread;
            use std::time::Duration;
            
            match child.kill() {
                Ok(_) => {
                    println!("发送 SIGTERM 信号到进程 {}", pid);
                    
                    // 等待进程退出
                    thread::sleep(Duration::from_millis(1000));
                    
                    // 检查进程是否还在运行，如果是则强制 kill
                    let check = Command::new("kill")
                        .args(&["-0", &pid.to_string()])
                        .output();
                    
                    if let Ok(result) = check {
                        if result.status.success() {
                            // 进程还在，使用 SIGKILL
                            println!("进程仍在运行，发送 SIGKILL");
                            let _ = Command::new("kill")
                                .args(&["-9", &pid.to_string()])
                                .output();
                        } else {
                            println!("进程已终止");
                        }
                    }
                },
                Err(e) => {
                    eprintln!("终止进程失败: {}", e);
                }
            }
        }
        
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
async fn close_window(window: tauri::Window, app_handle: tauri::AppHandle) {
    // 在关闭窗口前清理 Hexo 服务器进程
    if let Some(server_state) = app_handle.try_state::<HexoServer>() {
        if let Ok(mut server) = server_state.0.try_lock() {
            #[allow(unused_mut)]
            if let Some(mut child) = server.take() {
                let pid = child.id();
                println!("窗口关闭前清理 Hexo 服务器进程 PID: {}", pid);
                
                #[cfg(target_os = "windows")]
                {
                    // Windows: 使用 taskkill 杀死整个进程树
                    let _ = Command::new("taskkill")
                        .args(&["/pid", &pid.to_string(), "/T", "/F"])
                        .output();
                    
                    // 额外清理 4000 端口
                    let _ = Command::new("cmd")
                        .args(&["/C", "for /f \"tokens=5\" %a in ('netstat -ano ^| findstr :4000 ^| findstr LISTENING') do @taskkill /F /PID %a"])
                        .output();
                }
                
                #[cfg(not(target_os = "windows"))]
                {
                    let _ = child.kill();
                }
                
                println!("Hexo 服务器进程已清理");
            }
        }
    }
    
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
        copy_file,
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
        // 延迟操作以避免事件循环警告
        let app_handle = _app.handle().clone();
        std::thread::spawn(move || {
          std::thread::sleep(std::time::Duration::from_millis(500));
          if let Some(window) = app_handle.get_webview_window("main") {
            let _ = window.open_devtools();
          }
        });
      }

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
