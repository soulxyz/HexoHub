
; NSIS 安装程序脚本 - HexoHub
; 此脚本用于创建 HexoHub 的 Windows 安装程序

; 包含现代 UI
!include "MUI2.nsh"

; 包含用于文件关联的宏
!include "FileFunc.nsh"

; 设置应用程序信息
Name "HexoHub"
OutFile "dist\HexoHub-Setup.exe"
InstallDir "$PROGRAMFILES64\HexoHub"
InstallDirRegKey HKLM "Software\HexoHub" "InstallLocation"
RequestExecutionLevel admin

; 设置版本信息
VIProductVersion "0.1.0.0"
VIFileVersion "0.1.0.0"
VIAddVersionKey "ProductName" "HexoHub"
VIAddVersionKey "ProductVersion" "0.1.0"
VIAddVersionKey "FileDescription" "HexoHub Desktop Application"
VIAddVersionKey "LegalCopyright" "Copyright © 2024 HexoHub Team"

; 界面设置
!define MUI_ABORTWARNING
!define MUI_ICON "public\icon.ico"
!define MUI_UNICON "public\icon.ico"
!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_BITMAP "public\icon.bmp"
!define MUI_WELCOMEFINISHPAGE_BITMAP "public\welcome.bmp"

; 欢迎页面
!insertmacro MUI_PAGE_WELCOME
; 许可协议页面
!insertmacro MUI_PAGE_LICENSE "public\LICENSE.txt"
; 安装目录选择页面
!insertmacro MUI_PAGE_DIRECTORY
; 安装进度页面
!insertmacro MUI_PAGE_INSTFILES
; 完成页面
!insertmacro MUI_PAGE_FINISH

; 卸载程序页面
!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

; 设置语言
!insertmacro MUI_LANGUAGE "SimpChinese"

; 包含自定义安装程序脚本
!include "public\installer.nsh"

; 安装程序部分
Section "HexoHub" SEC01
  ; 设置输出路径
  SetOutPath "$INSTDIR"

  ; 复制应用程序文件
  File /r "dist\win-unpacked\*.*"

  ; 创建开始菜单快捷方式
  CreateDirectory "$SMPROGRAMS\HexoHub"
  CreateShortCut "$SMPROGRAMS\HexoHub\HexoHub.lnk" "$INSTDIR\HexoHub.exe" "" "$INSTDIR\HexoHub.exe" 0
  CreateShortCut "$SMPROGRAMS\HexoHub\卸载 HexoHub.lnk" "$INSTDIR\uninstall.exe"

  ; 创建桌面快捷方式
  CreateShortCut "$DESKTOP\HexoHub.lnk" "$INSTDIR\HexoHub.exe" "" "$INSTDIR\HexoHub.exe" 0

  ; 写入注册表
  WriteRegStr HKLM "Software\HexoHub" "InstallLocation" "$INSTDIR"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\HexoHub" "DisplayName" "HexoHub"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\HexoHub" "UninstallString" '"$INSTDIR\uninstall.exe"'
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\HexoHub" "DisplayIcon" "$INSTDIR\HexoHub.exe"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\HexoHub" "Publisher" "HexoHub Team"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\HexoHub" "DisplayVersion" "0.1.0"
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\HexoHub" "NoModify" 1
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\HexoHub" "NoRepair" 1

  ; 创建卸载程序
  WriteUninstaller "$INSTDIR\uninstall.exe"
SectionEnd

; 卸载程序部分
Section "Uninstall"
  ; 删除文件
  RMDir /r "$INSTDIR"

  ; 删除开始菜单快捷方式
  RMDir /r "$SMPROGRAMS\HexoHub"

  ; 删除桌面快捷方式
  Delete "$DESKTOP\HexoHub.lnk"

  ; 删除注册表项
  DeleteRegKey HKLM "Software\HexoHub"
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\HexoHub"
SectionEnd
