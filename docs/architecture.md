# WinCV Modern 架構摘要

## 技術棧與版本
- Electron 28 + React 18 + TypeScript 5 + Vite 5
- Zustand 狀態管理、Tailwind CSS + shadcn/ui UI 套件
- 前端虛擬列表：react-virtuoso；檔案監看：chokidar
- 打包：electron-builder；測試：Vitest（單元/整合）、Playwright（E2E）

## 專案目錄藍圖（Roadmap 對齊）
- .github/workflows/: build.yml、test.yml、release.yml
- src/main/: Electron 主進程
  - index.ts（入口）、preload.ts、ipc/{index.ts,file-operations.ts,system-info.ts,settings.ts}
  - services/{file-service.ts,archive-service.ts,hash-service.ts,search-service.ts,watch-service.ts}
  - utils/{path-utils.ts,file-utils.ts,platform-utils.ts}
- src/renderer/: React 渲染層
  - main.tsx、App.tsx、index.html
  - components/layout/{MainLayout.tsx,Header.tsx,Toolbar.tsx,StatusBar.tsx,SplitPane.tsx}
  - components/panels/{FilePanel.tsx,FileList.tsx,FileItem.tsx,PathBar.tsx,PreviewPanel.tsx}
  - components/dialogs/{ConfirmDialog.tsx,RenameDialog.tsx,CreateFolderDialog.tsx,ProgressDialog.tsx,SettingsDialog.tsx}
  - components/common/{Button.tsx,Input.tsx,Checkbox.tsx,Select.tsx,ContextMenu.tsx,Tooltip.tsx}
  - components/icons/FileIcons.tsx
  - hooks/{useFileOperations.ts,useKeyboardShortcuts.ts,useSelection.ts,useFileWatch.ts,useSettings.ts}
  - stores/{index.ts,file-store.ts,panel-store.ts,selection-store.ts,settings-store.ts,ui-store.ts,tab-store.ts}
  - services/{ipc-client.ts,file-type-service.ts}
  - utils/{format-utils.ts,sort-utils.ts,filter-utils.ts}
  - styles/globals.css, styles/themes/{dark.css,light.css}
- src/shared/: constants.ts、types.ts、utils.ts
- tests/: unit/、integration/、e2e/
- scripts/: build.ts、notarize.ts
- resources/: icons/、locales/

## 分層責任與依賴
- 主進程（src/main）: 視窗生命週期、檔案系統與系統 API 呼叫、IPC handler、背景長任務。
- Preload（src/main/preload.ts）: contextBridge 暴露安全 API，僅傳遞 IPC 封裝函式與事件訂閱。
- 渲染層（src/renderer）: UI/UX、快捷鍵、狀態管理、呼叫 preload API，不直接存取 Node API。
- Shared（src/shared）: 型別、常數、純工具，供 main/preload/renderer 共用，避免循環依賴。

## IPC 與 Preload 設計摘要
- IPC Channel 前綴：file:/archive:/hash:/watch:/settings:/system:/window:，集中定義於 src/main/ipc/index.ts。
- Handler 模式：主進程以 invoke/handle 傳回 IPCResponse<T>；長任務透過 progress:update/complete/error 事件回推。
- Preload API：window.api = { file, progress, watch, archive, hash, settings, window }，每個方法對應型別安全參數與回傳。
- 安全性：contextIsolation 與 nodeIntegration:false，僅暴露白名單方法；檔案路徑/輸入需在主進程驗證與捕錯。
