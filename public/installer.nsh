; NSIS安装程序脚本 - Hexo Desktop
; 此文件用于自定义Windows安装程序的行为

; 添加卸载时的注册表清理
Section "Uninstall"
  ; 删除桌面快捷方式
  Delete "$DESKTOP\Hexo Desktop.lnk"
  
  ; 删除开始菜单快捷方式
  Delete "$STARTMENU\Programs\Hexo Desktop.lnk"
  
  ; 删除安装目录
  RMDir /r "$INSTDIR"
  
  ; 删除注册表项
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Hexo Desktop"
  DeleteRegKey HKCU "Software\Hexo Desktop"
SectionEnd

; 添加安装时的注册表写入
Section "Main" SEC01
  ; 写入注册表信息
  WriteRegExpandStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Hexo Desktop" "InstallLocation" "$INSTDIR"
  WriteRegExpandStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Hexo Desktop" "UninstallString" '"$INSTDIR\uninstall.exe"'
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Hexo Desktop" "NoModify" 1
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Hexo Desktop" "NoRepair" 1
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Hexo Desktop" "DisplayName" "Hexo Desktop"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Hexo Desktop" "Publisher" "Hexo Desktop"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Hexo Desktop" "DisplayVersion" "0.1.0"
SectionEnd

; 添加文件关联（可选）
Section "File Associations"
  ; 关联 .md 文件（可选，取消注释以启用）
  ; WriteRegStr HKCR ".md" "" "HexoDesktop.Document"
  ; WriteRegStr HKCR "HexoDesktop.Document" "" "Markdown Document"
  ; WriteRegStr HKCR "HexoDesktop.Document\DefaultIcon" "" "$INSTDIR\Hexo Desktop.exe,0"
  ; WriteRegStr HKCR "HexoDesktop.Document\shell\open\command" "" '"$INSTDIR\Hexo Desktop.exe" "%1"'
SectionEnd

; 添加环境变量检查（可选）
Function .onInit
  ; 检查是否已安装 Node.js
  ReadRegStr $0 HKLM "SOFTWARE\Node.js" "InstallPath"
  StrCmp $0 "" 0 NodeJSFound
  ReadRegStr $0 HKCU "SOFTWARE\Node.js" "InstallPath"
  StrCmp $0 "" NodeJSNotFound NodeJSFound
  
NodeJSNotFound:
  MessageBox MB_YESNO|MB_ICONQUESTION "未检测到 Node.js 安装。$\nHexo 需要 Node.js 才能正常工作。$\n$\n是否继续安装？" IDYES NodeJSFound
  Abort "请先安装 Node.js 后再运行此安装程序。"
  
NodeJSFound:
FunctionEnd

; 添加安装完成后的操作
Function .onInstSuccess
  ; 询问是否立即启动应用
  MessageBox MB_YESNO|MB_ICONQUESTION "安装完成！$\n$\n是否立即启动 Hexo Desktop？" IDNO NoLaunch
    ExecShell "" "$INSTDIR\Hexo Desktop.exe"
  NoLaunch:
FunctionEnd