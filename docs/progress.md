# Checkbox ID 規格（必須遵守）

格式：P{p}-W{ww}-D{dd}-{AREA}-{SCOPE}-T{xx}

- p: 1..4（Phase）
- ww: 01..30（兩位數，確保字串排序）
- dd: 01..05（兩位數，確保字串排序）
- AREA: 僅允許以下固定值（全大寫）：REPO | BOOT | IPC | PRELOAD | SVC | UI | STORE | HOOK | UTIL | TEST | CI | BUILD | DOC
- SCOPE: 必須使用 PascalCase（例如 FileList、FileService、SelectionStore、SettingsDialog、ElectronBuilder）
- xx: 01..08（同一 Day、同一 AREA+SCOPE，最多 8 個原子任務）

### SCOPE PascalCase 規則（必須遵守）

- 一律 PascalCase，不可用 kebab-case、snake_case、全小寫。
- 若 Roadmap 檔名是 kebab-case（例如 file-service.ts、selection-store.ts）：轉成 FileService、SelectionStore
- 若是縮寫（IPC/URL/API/MD5/SHA/CI/E2E）：優先採 Roadmap/TypeScript 常見風格：IpcClient、PreloadApi、HashService、E2eBasicOperations（或 E2ETests 以一致為準）
- 同一個縮寫在整份 progress 必須一致（例如一律用 PreloadApi，不可混用 PreloadAPI/PreloadApi）
- 若是複合詞：依語意切詞再 PascalCase（例如 BasicOperations -> BasicOperations）

### 縮寫/首字母縮略詞（Acronyms）規則（必須遵守）

- 縮寫一律「視為一般單字」處理：只大寫首字母，其餘小寫（提高可讀性）。
- 偏好用法：Ipc、Api、E2e、Url、Id、Html、Css、Json

### 建議 SCOPE（參考 Roadmap，可用於命名一致性）

- UI: MainLayout, Header, Toolbar, StatusBar, SplitPane, FilePanel, PathBar, FileList, FileItem, PreviewPanel, SettingsDialog, ConfirmDialog, RenameDialog, CreateFolderDialog, ProgressDialog, ContextMenu, Tooltip, Button, Input, FileIcons
- SVC: FileService, WatchService, ArchiveService, HashService, SearchService
- IPC: IpcIndex, FileOperationsIpc, SettingsIpc, SystemInfoIpc
- PRELOAD: PreloadApi
- STORE: FileStore, PanelStore, SelectionStore, SettingsStore, UiStore, TabStore
- HOOK: UseFileOperations, UseSelection, UseKeyboardShortcuts, UseFileWatch, UseSettings
- TEST: VitestUnit, PlaywrightE2e, BasicOperationsE2e（或 E2eBasicOperations，擇一但要全程一致）
- CI: BuildWorkflow, TestWorkflow, ReleaseWorkflow
- BUILD: ElectronBuilder, Packaging, Notarize

### Day 對應 Roadmap 的建議映射

- D01 = Day 1-2
- D03 = Day 3-4
- D05 = Day 5

### Day 內拆分規則（必須遵守）

- 每個 Day（例如 P1-W02-D03）必須拆成 3–8 個原子任務（T01..T08）。
- 每個 checkbox 必須是「單一可驗收成果」：能 build / 能操作 / 有測試通過 / 有明確手動驗收步驟。
- 每個 checkbox 行尾都必須包含：1) 預期產物（檔案/資料夾或功能點） 2) 驗收方式（pnpm scripts / Vitest / Playwright / 手動步驟）。
- 不允許建立「超大任務」或「不可驗收任務」。

---

## Phase 1 - MVP 前期（W01-W06）

### W01 專案初始化

#### D01（環境建置）

- [x] P1-W01-D01-REPO-RepoSetup-T01 初始化 Git 倉庫與 .gitignore、branch/PR/issue 模板；驗收：git status 乾淨且 .github 模板可見。
  - ✅ .gitignore 已存在並補充 Electron 專用規則
  - ✅ .github/pull_request_template.md 已建立
  - ✅ .github/ISSUE_TEMPLATE/bug_report.md 已建立
  - ✅ .github/ISSUE_TEMPLATE/feature_request.md 已建立
- [x] P1-W01-D01-BOOT-ProjectInit-T02 pnpm init 並安裝 Electron/React/TypeScript/Vite 基礎依賴；驗收：pnpm run dev 能啟動空白視窗。
  - ✅ 產物：package.json / vite.config.ts / electron/main.cjs / index.html
  - ✅ 驗收：pnpm run dev（看到 Vite ready 且 Electron 啟動無錯；視窗載入空白頁）
- [x] P1-W01-D01-CI-DevEnvironment-T03 配置 ESLint/Prettier/Husky/lint-staged；驗收：pnpm run lint 通過且 commit 時觸發格式化。
  - ✅ 產物：eslint.config.js / .prettierrc.json / .prettierignore / .husky/pre-commit
  - ✅ 驗收：pnpm run lint（已通過）；git commit 時會執行 lint-staged（Prettier + eslint --fix）
- [x] P1-W01-D01-REPO-PackageManager-T03 切換至 pnpm 作為套件管理；驗收：移除 package-lock.json、更新 `package.json`、`.gitignore`、`.prettierignore`、相關 docs 與 PR template，並能使用 `pnpm run dev` 啟動 dev 環境。
  - ✅ 驗收步驟：移除 `package-lock.json`，執行 `pnpm install` 產生 `pnpm-lock.yaml`，執行 `pnpm run dev` 無錯並可開啟空白視窗。
  - ✅ 驗收結果：已產生 `pnpm-lock.yaml`，`pnpm run lint` 無錯（本環境未實際開啟 GUI）。

#### D03（主進程骨架）

- [x] P1-W01-D03-BOOT-MainEntry-T01 建立 src/main/index.ts 設定 BrowserWindow（min 1024x768 標題）；驗收：pnpm run dev 啟動視窗尺寸正確。
  - ✅ 產物：src/main/index.ts（Electron 主進程入口）
  - ✅ 驗收：pnpm run dev（Vite ready；Electron 使用 ts-node 載入 main 並以 1024x768 最小尺寸啟動）
- [x] P1-W01-D03-IPC-IpcIndex-T02 建立 src/main/ipc/index.ts 與 channel 常數，能註冊 file/settings/system handler；驗收：單元測試/手動檢視 IPC handler 載入無錯。
  - ✅ 產物：src/main/ipc/index.ts + src/main/ipc/channels.ts（IPC_CHANNELS）
  - ✅ 驗收：pnpm run dev（主進程啟動時註冊 file/settings/system handlers，啟動過程無錯）；pnpm run lint 通過
- [x] P1-W01-D03-PRELOAD-PreloadApi-T03 建立 src/main/preload.ts 暴露安全 API（contextBridge）；驗收：renderer console 可讀取 window.api 且無 Node 污染警告。
  - ✅ 產物：src/main/preload.ts + electron/preload.cjs（載入 TS preload）
  - ✅ 驗收：pnpm run dev 後開啟 DevTools（Ctrl+Shift+I）在 Console 輸入 window.api 可讀取；pnpm run lint 通過

#### D05（渲染層起步）

- [x] P1-W01-D05-UI-RendererBootstrap-T01 建立 src/renderer/main.tsx、App.tsx，渲染占位頁；驗收：pnpm run dev 顯示 React 佈局。
  - ✅ 產物：src/renderer/main.tsx、src/renderer/App.tsx、index.html（root + module script）、tsconfig.json（jsx）
  - ✅ 驗收：pnpm run dev（畫面顯示 WinCV Modern + 左右面板占位）；pnpm run lint（已通過）
- [x] P1-W01-D05-BUILD-TailwindSetup-T02 配置 Tailwind/tailwind.config.js 與 styles/globals.css 深淺色基礎；驗收：開發伺服器能載入樣式無錯。
  - ✅ 產物：tailwind.config.js、postcss.config.js、src/renderer/styles/globals.css（含深/淺色 CSS 變數基礎）、src/renderer/main.tsx（引入 globals.css）
  - ✅ 驗收：pnpm run dev（Vite 可啟動且畫面樣式正常）；pnpm run lint（已通過）
- [x] P1-W01-D05-STORE-StateScaffold-T03 建立 stores/index.ts 與基本 store 空殼；驗收：tsc 無錯並可從組件匯入。
  - ✅ 產物：src/renderer/stores/index.ts（simple store scaffold + uiStore）、src/renderer/App.tsx（示範匯入）
  - ✅ 驗收：npx tsc --noEmit（通過）；pnpm run lint（通過）

### W02 介面佈局

#### D01（佈局組件）

- [x] P1-W02-D01-UI-MainLayout-T01 建立 MainLayout/Slot 佈局含 Header/Toolbar/StatusBar 區位；驗收：Storybook 或頁面實例呈現框架。
  - ✅ 產物：src/renderer/components/layout/MainLayout.tsx（header/toolbar/statusBar slots）、src/renderer/App.tsx（頁面實例套用）
  - ✅ 驗收：pnpm run dev（可見 Header/Toolbar/內容區/StatusBar 框架）；pnpm run lint、pnpm exec tsc --noEmit（通過）
- [x] P1-W02-D01-UI-Header-T02 Header 顯示標題與目前路徑 placeholder，含視窗控制按鈕；驗收：UI 顯示與按鈕 hover 狀態。
  - ✅ 產物：src/renderer/components/layout/Header.tsx、postcss.config.js（Tailwind v4 PostCSS plugin 修正）
  - ✅ 驗收：pnpm run dev（手動確認 Header 顯示標題/路徑，視窗按鈕 hover 變化）；pnpm run lint && pnpm exec tsc --noEmit && pnpm exec vite build（通過）
- [x] P1-W02-D01-UI-Toolbar-T03 Toolbar 基本按鈕（Copy/Move/Delete/Rename/NewFolder/Refresh）含快捷鍵提示；驗收：按鈕 disabled/hover 狀態正確。
  - ✅ 產物：src/renderer/components/layout/Toolbar.tsx（Toolbar 組件，含 ToolbarButton 子組件）、更新 src/renderer/App.tsx（使用 Toolbar 組件）
  - ✅ 驗收：pnpm run lint（通過）、pnpm exec tsc --noEmit（通過）、pnpm exec vite build（通過）
  - ✅ 手動驗收：六個按鈕正確顯示快捷鍵提示（C/M/D/R/F3/F5）；hasSelection=false 時 Copy/Move/Delete/Rename 呈現 disabled 狀態；hover 時邊框變色（accent）且有縮放效果；disabled 按鈕 hover 時顯示提示「需先選取檔案」

#### D03（面板核心）

- [ ] P1-W02-D03-UI-FilePanel-T01 FilePanel 聚合 PathBar + FileList，支援焦點樣式；驗收：手動切換左右面板時樣式正確。
- [ ] P1-W02-D03-UI-PathBar-T02 PathBar 顯示麵包屑與磁碟下拉 placeholder；驗收：點擊麵包屑可變更顯示路徑。
- [ ] P1-W02-D03-UI-FileList-T03 FileList 虛擬清單欄位（名稱/大小/日期/類型）與空態；驗收：mock 資料列表渲染 1000 筆不卡頓。
- [ ] P1-W02-D03-UI-FileItem-T04 FileItem 顏色與選取/標記/焦點樣式；驗收：hover/selected/marked 狀態切換正確。

#### D05（通用組件）

- [ ] P1-W02-D05-UI-Button-T01 Button 變體（primary/secondary/ghost/danger）與尺寸；驗收：Storybook 或範例頁展示。
- [ ] P1-W02-D05-UI-Input-T02 Input 基本/搜尋模式含錯誤狀態；驗收：受控輸入正常、錯誤樣式可切換。
- [ ] P1-W02-D05-UI-ContextMenu-T03 ContextMenu 支援子選單與快捷鍵提示；驗收：右鍵觸發與點擊外部關閉正常。
- [ ] P1-W02-D05-UI-Tooltip-T04 Tooltip 延遲顯示與四向定位；驗收：UI 手動測試。

### W03 檔案服務與 IPC

#### D01（檔案服務骨架）

- [ ] P1-W03-D01-SVC-FileService-T01 FileService.readDirectory/getFileInfo/getDrives/exists/isDirectory 基礎實作；驗收：Vitest 單元測試覆蓋正常路徑與錯誤路徑。
- [ ] P1-W03-D01-IPC-FileOperationsIpc-T02 IPC handler 連接 FileService（read-directory/get-info/get-drives）；驗收：renderer 透過 preload 調用獲得回傳。
- [ ] P1-W03-D01-PRELOAD-PreloadApi-T03 preload 封裝 file:read-directory/get-info/get-drives 並回傳 IPCResponse；驗收：tsc 無錯且渲染層可呼叫。

#### D03（檔案操作）

- [ ] P1-W03-D03-SVC-FileService-T01 FileService copy/move/delete/rename/createDirectory 含衝突與取消鉤子；驗收：單元測試涵蓋同盤/跨盤與資源回收桶路徑。
- [ ] P1-W03-D03-IPC-FileOperationsIpc-T02 IPC handler 支援 copy/move/delete/rename/create-directory，統一錯誤格式；驗收：Vitest 模擬 ipcMain handler。
- [ ] P1-W03-D03-PRELOAD-PreloadApi-T03 preload 暴露 copy/move/delete/rename/createDirectory 並轉發進度事件；驗收：renderer mock 進度監聽正常。

#### D05（前端整合）

- [ ] P1-W03-D05-HOOK-UseFileOperations-T01 useFileOperations Hook 包裝 CRUD 操作與錯誤狀態；驗收：渲染層可呼叫並在失敗時回報錯誤。
- [ ] P1-W03-D05-UI-ProgressDialog-T02 ProgressDialog 顯示進度/速度/ETA/取消；驗收：手動模擬進度事件 UI 更新。
- [ ] P1-W03-D05-UI-ConfirmDialog-T03 ConfirmDialog 危險操作樣式；驗收：刪除前觸發確認對話。
- [ ] P1-W03-D05-UI-ConflictDialog-T04 ConflictDialog 提供覆蓋/跳過/重新命名與套用全部；驗收：手動選擇各選項狀態正確。

### W04 選取與快捷鍵

#### D01（選取/標記）

- [ ] P1-W04-D01-STORE-SelectionStore-T01 SelectionStore 狀態與 actions（select/deselect/toggle/selectRange/mark/unmark/invert）；驗收：Vitest 單元測試覆蓋集合操作。
- [ ] P1-W04-D01-HOOK-UseSelection-T02 useSelection 整合滑鼠/鍵盤邏輯（單擊、Ctrl、Shift）；驗收：FileList 中手動測試行為符合規格。
- [ ] P1-W04-D01-UI-FileItem-T03 更新 FileItem 樣式連動選取/標記統計；驗收：狀態列顯示標記數與大小變化。

#### D03（快捷鍵系統）

- [ ] P1-W04-D03-HOOK-UseKeyboardShortcuts-T01 useKeyboardShortcuts 註冊 MVP 快捷鍵（C/M/D/R/Enter/Backspace/F3/F5）；驗收：手動操作快捷鍵觸發對應 action。
- [ ] P1-W04-D03-HOOK-UseKeyboardShortcuts-T02 標記快捷鍵（Space/T/U/\*）與導航（Arrow/Home/End/PageUp/PageDown/Tab）；驗收：行為與規格書一致。
- [ ] P1-W04-D03-UI-Toolbar-T03 Toolbar/ContextMenu/Tooltip 顯示快捷鍵提示；驗收：UI 顯示與動態提示一致。

#### D05（狀態列與格式化）

- [ ] P1-W04-D05-UI-StatusBar-T01 StatusBar 顯示檔案/目錄/選取/標記統計與磁碟剩餘；驗收：Mock 資料即時更新。
- [ ] P1-W04-D05-UTIL-FormatUtils-T02 formatFileSize/formatDate/formatNumber 工具；驗收：Vitest 單元測試通過。
- [ ] P1-W04-D05-UI-StatusBar-T03 StatusBar 效能優化（debounce + store 監聽）；驗收：高頻選取時無卡頓。

### W05 主題與設定

#### D01（主題）

- [ ] P1-W05-D01-UI-Themes-T01 建立 styles/themes/dark.css、light.css CSS 變數；驗收：切換 data-theme 屬性顏色正確。
- [ ] P1-W05-D01-STORE-SettingsStore-T02 SettingsStore 支援 theme: dark/light/system 與系統主題監聽；驗收：設定切換後 body class 更新。
- [ ] P1-W05-D01-UI-Header-T03 主題切換按鈕動畫與狀態儲存；驗收：手動切換並重新啟動後狀態保留。

#### D03（設定系統）

- [ ] P1-W05-D03-STORE-SettingsStore-T01 設定欄位（showHiddenFiles/sortBy/sortOrder/showFileSize/showFileDate/useTrashBin/confirmDelete）；驗收：Vitest 狀態持久化測試。
- [ ] P1-W05-D03-UI-SettingsDialog-T02 SettingsDialog 分頁式 UI（外觀/檔案列表/行為）；驗收：開啟對話框可即時預覽設定。
- [ ] P1-W05-D03-PRELOAD-SettingsIpc-T03 IPC + preload 同步設定存取（electron-store）；驗收：渲染層 set/get 設定 roundtrip 成功。

#### D05（排序與過濾）

- [ ] P1-W05-D05-UTIL-SortUtils-T01 sort-utils 實作名稱/大小/日期/副檔名排序與目錄優先；驗收：Vitest 排序案例通過。
- [ ] P1-W05-D05-UTIL-FilterUtils-T02 filter-utils 即時搜尋與模糊匹配；驗收：單元測試覆蓋高亮/大小寫。
- [ ] P1-W05-D05-UI-FileList-T03 FileList 欄位點擊排序與搜尋框；驗收：手動操作排序箭頭與過濾結果正確。

### W06 打包與測試

#### D01（打包）

- [ ] P1-W06-D01-BUILD-ElectronBuilder-T01 建立 electron-builder.yml（Win/macOS/Linux）與 resources/icons；驗收：pnpm run build:win/mac/linux 成功產出安裝檔。
- [ ] P1-W06-D01-BUILD-Packaging-T02 設定 pnpm scripts build:all 與輸出目錄；驗收：dist/ 產物包含三平台包。
- [ ] P1-W06-D01-CI-BuildWorkflow-T03 建立 GitHub Actions build workflow；驗收：CI 觸發後產出 artifact。

#### D03（測試）

- [ ] P1-W06-D03-TEST-VitestUnit-T01 設定 Vitest 與 coverage 門檻；驗收：pnpm run test:unit 通過且覆蓋率報告生成。
- [ ] P1-W06-D03-TEST-PlaywrightE2e-T02 設定 Playwright 基礎啟動測試；驗收：pnpm run test:e2e 通過。
- [ ] P1-W06-D03-TEST-BasicOperationsE2e-T03 E2E 案例：列表顯示、導航、選取、標記、快捷鍵；驗收：Playwright 報告綠燈。

#### D05（MVP 檢查）

- [ ] P1-W06-D05-TEST-MvpChecklist-T01 執行 MVP checklist（雙面板、CRUD、標記、快捷鍵、主題、設定）；驗收：手動檢查單列表。
- [ ] P1-W06-D05-DOC-ReadmeUpdate-T02 更新 README 快速啟動與快捷鍵表；驗收：文件審閱。
- [ ] P1-W06-D05-CI-ReleaseWorkflow-T03 建立 release workflow 串接 build artifact；驗收：CI tags 觸發成功產出。

---

## Phase 2 - 核心完善（W07-W14）

### W07-W08 分頁系統

#### D01

- [ ] P2-W07-D01-STORE-TabStore-T01 TabStore 結構（tabs/activeTabId/add/remove/switch/move/duplicate）；驗收：Vitest 操作測試。
- [ ] P2-W07-D01-UI-TabBar-T02 TabBar 基本渲染與新增分頁按鈕；驗收：手動新增/切換分頁。
- [ ] P2-W07-D01-UI-TabOverflow-T03 Tab overflow 箭頭/下拉處理；驗收：多於 8 個分頁仍可操作。

#### D03

- [ ] P2-W07-D03-UI-Tab-T01 Tab 標籤可編輯標題、關閉按鈕、拖曳排序；驗收：手動拖曳與關閉。
- [ ] P2-W07-D03-UI-TabContextMenu-T02 Tab 右鍵選單（關閉/關閉其他/右側/複製）；驗收：操作結果正確。
- [ ] P2-W07-D03-HOOK-UseKeyboardShortcuts-T03 分頁快捷鍵（Ctrl+T/Ctrl+W/Ctrl+Tab/Ctrl+Shift+Tab/Ctrl+1~9）；驗收：手動觸發切換。

#### D05

- [ ] P2-W07-D05-STORE-TabPersistence-T01 分頁持久化（rememberTabs 設定）；驗收：重啟後分頁狀態恢復。
- [ ] P2-W07-D05-UI-TabLoading-T02 Tab loading/活動狀態指示；驗收：切換路徑時狀態更新。
- [ ] P2-W07-D05-TEST-TabStore-T03 TabStore 單元測試覆蓋移動/刪除邊界；驗收：Vitest 通過。

### W09-W10 書籤與批次改名

#### D01

- [ ] P2-W09-D01-STORE-BookmarkStore-T01 BookmarkStore CRUD/reorder；驗收：Vitest 狀態測試。
- [ ] P2-W09-D01-UI-BookmarkBar-T02 BookmarkBar 顯示/跳轉/右鍵選單；驗收：手動操作路徑跳轉。
- [ ] P2-W09-D01-HOOK-UseBookmarks-T03 Hook 整合拖曳新增（從 FileList 至 BookmarkBar）；驗收：拖曳可建立書籤。

#### D03

- [ ] P2-W09-D03-UI-AddBookmarkDialog-T01 AddBookmarkDialog（名稱/路徑/顏色/圖示）；驗收：表單驗證與建立書籤成功。
- [ ] P2-W09-D03-UI-BookmarkBar-T02 Bookmark 拖曳排序與在新分頁開啟；驗收：手動測試排序與開啟。
- [ ] P2-W09-D03-TEST-BookmarkStore-T03 測試保存順序與刪除；驗收：Vitest 通過。

#### D05

- [ ] P2-W10-D05-UI-BatchRenameDialog-T01 BatchRenameDialog 規則設定（find/replace/prefix/suffix/sequence/case/regex）；驗收：UI 預覽更新。
- [ ] P2-W10-D05-SVC-RenameEngine-T02 改名引擎產生預覽與衝突檢測；驗收：單元測試涵蓋重複與非法字元。
- [ ] P2-W10-D05-UI-BatchRenameDialog-T03 套用/取消流程與錯誤提示；驗收：手動操作批次改名成功。

### W11-W12 壓縮與解壓

#### D01

- [ ] P2-W11-D01-SVC-ArchiveService-T01 ArchiveService compress/extract/list 支援 zip/7z/tar.gz；驗收：單元測試對應格式。
- [ ] P2-W11-D01-IPC-ArchiveIpc-T02 IPC handler 包裝 archive:compress/extract/list；驗收：renderer 調用成功。
- [ ] P2-W11-D01-PRELOAD-PreloadApi-T03 preload 暴露 archive API；驗收：tsc 無錯並可回傳進度。

#### D03

- [ ] P2-W11-D03-UI-CompressDialog-T01 CompressDialog 設定格式/壓縮等級/密碼；驗收：手動壓縮成功並生成檔案。
- [ ] P2-W11-D03-UI-ExtractDialog-T02 ExtractDialog 目標路徑/密碼/覆蓋選項；驗收：解壓成功且錯誤提示正確。
- [ ] P2-W11-D03-UI-ArchivePreview-T03 ArchivePreview 列表與選擇性解壓；驗收：手動預覽與解壓子檔案。

#### D05

- [ ] P2-W12-D05-UI-ArchiveShortcuts-T01 快捷鍵 Alt+Z 壓縮、Alt+U 解壓；驗收：手動操作觸發對話框。
- [ ] P2-W12-D05-HOOK-UseFileOperations-T02 操作進度整合壓縮/解壓；驗收：ProgressDialog 顯示正確。
- [ ] P2-W12-D05-TEST-ArchiveService-T03 ArchiveService/IPC 單元與整合測試；驗收：Vitest 通過。

### W13-W14 預覽與雜湊/比較

#### D01

- [ ] P2-W13-D01-UI-PreviewPanel-T01 PreviewPanel 可開關/調整大小，支援圖像/文字/程式碼格式；驗收：手動預覽不同檔案。
- [ ] P2-W13-D01-UI-ImagePreview-T02 ImagePreview 縮放與資訊顯示；驗收：大圖渲染流暢。
- [ ] P2-W13-D01-UI-TextPreview-T03 TextPreview 語法高亮與搜尋；驗收：搜尋高亮正確。

#### D03

- [ ] P2-W13-D03-SVC-HashService-T01 HashService 計算 MD5/SHA1/SHA256 支援大檔進度；驗收：單元測試比對雜湊。
- [ ] P2-W13-D03-UI-HashDialog-T02 HashDialog 選擇算法/顯示結果/驗證輸入；驗收：手動計算並複製雜湊。
- [ ] P2-W13-D03-IPC-HashIpc-T03 IPC handler + preload 暴露 hash:calculate；驗收：renderer 調用成功。

#### D05

- [ ] P2-W14-D05-UI-CompareDialog-T01 CompareDialog 選檔/比對結果/差異顯示；驗收：文字檔顯示差異，二進位顯示同/異。
- [ ] P2-W14-D05-HOOK-UseFileOperations-T02 整合比較/雜湊入口（Toolbar/ContextMenu/快捷鍵）；驗收：操作流程順暢。
- [ ] P2-W14-D05-TEST-PreviewAndHash-T03 Preview/Hash/Compare E2E 路徑；驗收：Playwright 覆蓋預覽與雜湊對話。

---

## Phase 3 - 進階功能（W15-W26）

### W15-W17 雲端整合

#### D01

- [ ] P3-W15-D01-SVC-CloudProvider-T01 定義 CloudProvider 介面與 Google/OneDrive/Dropbox adapter 骨架；驗收：tsc 無錯與 DI 可注入。
- [ ] P3-W15-D01-SVC-AuthFlow-T02 OAuth/Token 儲存策略與錯誤分類；驗收：單元測試模擬 token 續期。
- [ ] P3-W15-D01-IPC-CloudIpc-T03 IPC handler 驗證認證流程與列表下載；驗收：renderer mock 調用成功。

#### D03

- [ ] P3-W16-D03-UI-CloudAccountsDialog-T01 CloudAccountsDialog 管理帳號（新增/移除/狀態）；驗收：手動新增假 token。
- [ ] P3-W16-D03-UI-CloudDrives-T02 雲端磁碟列入磁碟列表並共用 FileList；驗收：切換雲端路徑可載入列表。
- [ ] P3-W16-D03-HOOK-UseFileOperations-T03 雲端上傳/下載進度整合；驗收：ProgressDialog 顯示傳輸速率。

#### D05

- [ ] P3-W17-D05-SVC-CloudCache-T01 離線快取與同步佇列設計；驗收：單元測試模擬離線再上線同步。
- [ ] P3-W17-D05-UI-CloudStatus-T02 雲端狀態/同步提示 UI；驗收：狀態列或 toast 反饋。
- [ ] P3-W17-D05-TEST-CloudFlows-T03 雲端登入/列表/下載 E2E；驗收：Playwright 使用 mock server 通過。

### W18-W20 同步與進階搜尋

#### D01

- [ ] P3-W18-D01-SVC-SyncService-T01 SyncService 目錄差異分析（新增/修改/刪除）與策略（雙向/單向/鏡像）；驗收：單元測試涵蓋差異案例。
- [ ] P3-W18-D01-UTIL-SyncDiff-T02 差異預覽資料結構與排序；驗收：tsc + 單元測試。
- [ ] P3-W18-D01-IPC-SyncIpc-T03 IPC handler 執行同步與回報進度；驗收：renderer mock 成功。

#### D03

- [ ] P3-W19-D03-UI-SyncDialog-T01 SyncDialog 設定來源/目標/策略/排除規則；驗收：手動預覽差異並套用。
- [ ] P3-W19-D03-UI-SyncProgress-T02 同步進度與衝突提示 UI；驗收：ProgressDialog 顯示同步細節。
- [ ] P3-W19-D03-TEST-SyncService-T03 SyncService 單元與整合測試；驗收：Vitest 通過。

#### D05

- [ ] P3-W20-D05-SVC-SearchService-T01 SearchService 即時檔名與內容搜尋（正則/副檔名/大小/日期）；驗收：單元測試覆蓋條件。
- [ ] P3-W20-D05-UI-AdvancedSearchDialog-T02 AdvancedSearchDialog 條件設定與結果列表；驗收：手動搜尋並開啟結果。
- [ ] P3-W20-D05-TEST-AdvancedSearch-T03 搜尋整合測試含大目錄；驗收：Vitest/Playwright 報告通過。

### W21-W23 終端機與 Git

#### D01

- [ ] P3-W21-D01-UI-TerminalPanel-T01 TerminalPanel (xterm.js) 於當前路徑開啟；驗收：手動執行 ls/dir 輸出正確。
- [ ] P3-W21-D01-HOOK-UseTerminal-T02 多終端分頁切換與 Ctrl+` 快捷鍵；驗收：快捷鍵觸發終端。
- [ ] P3-W21-D01-BUILD-TerminalDeps-T03 平台依賴檢查（Windows/macOS/Linux shell 路徑）；驗收：三平台 smoke 測試。

#### D03

- [ ] P3-W22-D03-SVC-GitService-T01 GitService getStatus 解析 modified/added/deleted/untracked；驗收：單元測試 fixture。
- [ ] P3-W22-D03-UI-GitIndicators-T02 FileList 顯示 Git 狀態圖示與狀態列 branch；驗收：手動檢視圖示正確。
- [ ] P3-W22-D03-TEST-GitService-T03 Git 狀態整合測試（mock repo）；驗收：Vitest/Playwright 通過。

#### D05

- [ ] P3-W23-D05-PERF-PerformanceBudget-T01 設定終端/Git 效能監控與記憶體界線；驗收：性能報告記錄並無回歸。
- [ ] P3-W23-D05-UI-SettingsDialog-T02 終端/Git 設定選項（預設 shell、狀態開關）；驗收：設定更新後行為切換。
- [ ] P3-W23-D05-DOC-DevGuide-T03 更新開發者指南（終端/Git 整合流程）；驗收：文件審閱。

### W24-W26 主題自訂與多語系

#### D01

- [ ] P3-W24-D01-UI-ThemeEditor-T01 Theme Editor UI（顏色選擇/即時預覽/重置）；驗收：手動調整色票即時作用。
- [ ] P3-W24-D01-STORE-ThemePreset-T02 儲存/載入自訂主題；驗收：重啟後自訂主題保留。
- [ ] P3-W24-D01-TEST-ThemeEditor-T03 主題切換單元與視覺回歸快照；驗收：Vitest + 視覺檢查。

#### D03

- [ ] P3-W25-D03-UI-ThemeImportExport-T01 主題匯入/匯出（JSON）；驗收：匯出檔可再匯入套用。
- [ ] P3-W25-D03-UI-ThemePresets-T02 新增預設主題（Monokai/Solarized/Nord/Dracula）；驗收：UI 選單可切換。
- [ ] P3-W25-D03-DOC-ThemeGuide-T03 文件說明主題擴充與格式；驗收：文件審閱。

#### D05

- [ ] P3-W26-D05-STORE-I18n-T01 i18n 架構（react-i18next）與語系檔 zh-TW/zh-CN/en/ja；驗收：語系切換即時生效。
- [ ] P3-W26-D05-UI-LocaleSwitcher-T02 Locale 切換 UI 與持久化；驗收：設定保存並重啟保留。
- [ ] P3-W26-D05-TEST-I18n-T03 主要頁面語系快照/字串覆蓋測試；驗收：Vitest/Playwright 通過。

---

## Phase 4 - 優化與擴展（W27-W30）

### W27 外掛系統

#### D01

- [ ] P4-W27-D01-SVC-PluginApi-T01 設計 Plugin API（生命週期鉤子、權限清單、入口）；驗收：文件與型別定義完成。
- [ ] P4-W27-D01-DOC-PluginManifest-T02 制定 plugin manifest 規範（名稱/版本/權限/入口）；驗收：示例 manifest 通過驗證器。
- [ ] P4-W27-D01-IPC-PluginSandbox-T03 IPC sandbox 設計草稿（白名單 channel）；驗收：安全審閱通過。

#### D03

- [ ] P4-W27-D03-UI-PluginManager-T01 Plugin Manager UI（列表/啟用/停用/更新）；驗收：手動切換狀態有效。
- [ ] P4-W27-D03-SVC-PluginInstaller-T02 安裝/移除流程與簽章檢查；驗收：單元測試驗證哈希/簽章。
- [ ] P4-W27-D03-TEST-PluginLifecycle-T03 外掛生命週期整合測試（載入/卸載事件）；驗收：Vitest 通過。

#### D05

- [ ] P4-W27-D05-SEC-PluginSandbox-T01 沙盒執行/權限隔離策略；驗收：滲透測試腳本無法越權。
- [ ] P4-W27-D05-DOC-PluginGuide-T02 外掛開發指南草稿；驗收：文件審閱。
- [ ] P4-W27-D05-BUILD-PluginPackaging-T03 外掛打包/簽署流程；驗收：範例外掛可安裝。

### W28 自動化與腳本

#### D01

- [ ] P4-W28-D01-SVC-MacroEngine-T01 Macro 錄製/播放引擎；驗收：錄製檔案操作再播放一致。
- [ ] P4-W28-D01-UI-MacroPanel-T02 Macro 管理 UI（列表/編輯/刪除）；驗收：手動操作成功。
- [ ] P4-W28-D01-TEST-MacroEngine-T03 Macro 單元測試；驗收：Vitest 通過。

#### D03

- [ ] P4-W28-D03-SVC-ScriptEngine-T01 JavaScript 腳本執行沙盒與 API；驗收：安全審閱與單元測試。
- [ ] P4-W28-D03-UI-ScriptConsole-T02 腳本主控台/輸出顯示；驗收：手動執行示例腳本成功。
- [ ] P4-W28-D03-DOC-ScriptApi-T03 腳本 API 說明文件；驗收：文件審閱。

#### D05

- [ ] P4-W28-D05-TEST-AutomationE2e-T01 自動化 E2E（錄製/播放/腳本）；驗收：Playwright 模擬流程通過。
- [ ] P4-W28-D05-SEC-ScriptSandbox-T02 腳本權限與資源限制；驗收：安全測試無越權。
- [ ] P4-W28-D05-DOC-AutomationGuide-T03 使用手冊與範例腳本；驗收：文件審閱。

### W29 效能與穩定

#### D01

- [ ] P4-W29-D01-PERF-VirtualList-T01 虛擬列表效能剖析與快取優化；驗收：10000+ 檔案滾動 FPS > 50。
- [ ] P4-W29-D01-PERF-WatchService-T02 WatchService 訂閱去抖與批次事件；驗收：大量檔案變更時 UI 無掉幀。
- [ ] P4-W29-D01-TEST-PerfBench-T03 建立性能基準腳本；驗收：pnpm run bench 產生報告。

#### D03

- [ ] P4-W29-D03-UTIL-Metrics-T01 主/渲染執行緒阻塞時間監測；驗收：性能儀表板顯示結果。
- [ ] P4-W29-D03-CI-PerfRegression-T02 CI 性能回歸閾值警報；驗收：性能下降觸發警示。
- [ ] P4-W29-D03-TEST-Stability-T03 長時間壓力測試（檔案操作批次）；驗收：Playwright/腳本 1 小時內無 crash。

#### D05

- [ ] P4-W29-D05-UTIL-MemoryDiagnostics-T01 記憶體/handle/FD 泄漏檢測腳本；驗收：報告無超標。
- [ ] P4-W29-D05-DOC-PerfReport-T02 效能最佳化報告；驗收：文件審閱。
- [ ] P4-W29-D05-BUILD-ReleaseAudit-T03 發布前資安/授權掃描；驗收：掃描報告清空。

### W30 企業與收尾

#### D01

- [ ] P4-W30-D01-SVC-AuditLog-T01 稽核日誌與事件分類；驗收：產生日誌並透過測試驗證。
- [ ] P4-W30-D01-SVC-Permission-T02 基礎權限控制（讀/寫/同步/雲端）；驗收：單元測試覆蓋阻擋未授權操作。
- [ ] P4-W30-D01-TEST-Security-T03 安全性測試腳本（路徑遍歷/權限繞過）；驗收：測試通過。

#### D03

- [ ] P4-W30-D03-SVC-DirectoryServices-T01 AD/LDAP 整合策略草稿與 POC；驗收：POC 能查詢用戶資訊。
- [ ] P4-W30-D03-DOC-EnterpriseGuide-T02 企業部署指南與組態派送流程；驗收：文件審閱。
- [ ] P4-W30-D03-BUILD-UpdatePipeline-T03 自動更新/版本號策略確認；驗收：release pipeline 演練。

#### D05

- [ ] P4-W30-D05-TEST-ReleaseCandidate-T01 RC 測試（核心回歸 + 雲端/同步/外掛/自動化）；驗收：測試報告無阻塞缺陷。
- [ ] P4-W30-D05-DOC-ReleaseNotes-T02 1.0/2.0 變更日誌草稿；驗收：文件審閱。
- [ ] P4-W30-D05-CI-LaunchChecklist-T03 上線檢查表（監控/回報/支援流程）；驗收：檢查表簽核。
