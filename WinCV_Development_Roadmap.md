# WinCV 復刻版 - 完整開發路線圖

> **專案代號**: WinCV Modern  
> **文件版本**: 1.0  
> **建立日期**: 2025-12-31  
> **目標**: 復刻 WinCV 檔案管理系統，保留核心價值，現代化技術實作

---

# 目錄

1. [專案總覽](#一專案總覽)
2. [技術架構決策](#二技術架構決策)
3. [Phase 1: MVP 前期](#三phase-1-mvp-前期4-6-週)
4. [Phase 2: 核心完善 中期](#四phase-2-核心完善-中期6-8-週)
5. [Phase 3: 進階功能 後期](#五phase-3-進階功能-後期8-10-週)
6. [Phase 4: 優化擴展 長期](#六phase-4-優化擴展-長期持續)
7. [資料結構設計](#七資料結構設計)
8. [API 規格](#八api-規格)
9. [UI/UX 規範](#九uiux-規範)
10. [測試計畫](#十測試計畫)
11. [部署與發布](#十一部署與發布)

---

# 一、專案總覽

## 1.1 專案目標

```
主要目標：
├── 復刻 WinCV 的核心體驗（雙面板 + 快捷鍵）
├── 移除過時功能，精簡 40%
├── 新增現代化功能（分頁、書籤、深色模式）
├── 跨平台支援（Windows / macOS / Linux）
└── 高效能（處理 10,000+ 檔案不卡頓）
```

## 1.2 開發階段總覽

| 階段    | 名稱          | 時程    | 目標                 |
| ------- | ------------- | ------- | -------------------- |
| Phase 1 | MVP 前期      | 4-6 週  | 可用的基本檔案管理器 |
| Phase 2 | 核心完善 中期 | 6-8 週  | 功能完整的檔案管理器 |
| Phase 3 | 進階功能 後期 | 8-10 週 | 專業級檔案管理器     |
| Phase 4 | 優化擴展 長期 | 持續    | 生態系統建立         |

## 1.3 功能演進圖

```
Phase 1 (MVP)          Phase 2 (中期)         Phase 3 (後期)         Phase 4 (長期)
─────────────────────────────────────────────────────────────────────────────────
[雙面板]               [分頁功能]             [雲端整合]             [外掛系統]
[基本操作]             [書籤系統]             [檔案同步]             [主題市集]
[標記系統]             [批次改名]             [進階搜尋]             [社群功能]
[快捷鍵]               [壓縮功能]             [終端整合]             [企業版]
[排序過濾]             [檔案預覽]             [Git整合]              [API開放]
[深色模式]             [校驗碼]               [自訂主題]             [自動化]
```

---

# 二、技術架構決策

## 2.1 技術棧選擇

### 推薦方案 A：Electron + React（快速開發）

```
前端框架：React 18 + TypeScript
桌面框架：Electron 28+
狀態管理：Zustand
樣式方案：Tailwind CSS + shadcn/ui
檔案操作：Node.js fs/promises + chokidar
打包工具：Vite + electron-builder
測試框架：Vitest + Playwright
```

**優點**：開發速度快、社群資源豐富、跨平台  
**缺點**：記憶體佔用較高（約 150-300MB）

### 備選方案 B：Tauri + React（輕量高效）

```
前端框架：React 18 + TypeScript
桌面框架：Tauri 2.0
後端語言：Rust
樣式方案：Tailwind CSS
檔案操作：Rust std::fs + notify
打包工具：Vite + Tauri bundler
```

**優點**：記憶體佔用低（約 30-50MB）、效能好  
**缺點**：Rust 學習曲線、社群較小

### 本文件採用：方案 A (Electron + React)

## 2.2 專案結構

```
wincv-modern/
├── .github/                    # GitHub Actions CI/CD
│   └── workflows/
│       ├── build.yml
│       ├── test.yml
│       └── release.yml
├── src/
│   ├── main/                   # Electron 主進程
│   │   ├── index.ts            # 主進程入口
│   │   ├── ipc/                # IPC 通訊處理
│   │   │   ├── index.ts
│   │   │   ├── file-operations.ts
│   │   │   ├── system-info.ts
│   │   │   └── settings.ts
│   │   ├── services/           # 後端服務
│   │   │   ├── file-service.ts
│   │   │   ├── archive-service.ts
│   │   │   ├── hash-service.ts
│   │   │   ├── search-service.ts
│   │   │   └── watch-service.ts
│   │   ├── utils/              # 工具函數
│   │   │   ├── path-utils.ts
│   │   │   ├── file-utils.ts
│   │   │   └── platform-utils.ts
│   │   └── preload.ts          # 預載腳本
│   │
│   ├── renderer/               # React 渲染進程
│   │   ├── index.html
│   │   ├── main.tsx            # React 入口
│   │   ├── App.tsx             # 根組件
│   │   ├── components/         # UI 組件
│   │   │   ├── layout/         # 佈局組件
│   │   │   │   ├── MainLayout.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Toolbar.tsx
│   │   │   │   ├── StatusBar.tsx
│   │   │   │   └── SplitPane.tsx
│   │   │   ├── panels/         # 面板組件
│   │   │   │   ├── FilePanel.tsx
│   │   │   │   ├── FileList.tsx
│   │   │   │   ├── FileItem.tsx
│   │   │   │   ├── PathBar.tsx
│   │   │   │   └── PreviewPanel.tsx
│   │   │   ├── dialogs/        # 對話框組件
│   │   │   │   ├── ConfirmDialog.tsx
│   │   │   │   ├── RenameDialog.tsx
│   │   │   │   ├── CreateFolderDialog.tsx
│   │   │   │   ├── ProgressDialog.tsx
│   │   │   │   └── SettingsDialog.tsx
│   │   │   ├── common/         # 通用組件
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Checkbox.tsx
│   │   │   │   ├── Select.tsx
│   │   │   │   ├── ContextMenu.tsx
│   │   │   │   └── Tooltip.tsx
│   │   │   └── icons/          # 圖示組件
│   │   │       └── FileIcons.tsx
│   │   ├── hooks/              # 自訂 Hooks
│   │   │   ├── useFileOperations.ts
│   │   │   ├── useKeyboardShortcuts.ts
│   │   │   ├── useSelection.ts
│   │   │   ├── useFileWatch.ts
│   │   │   └── useSettings.ts
│   │   ├── stores/             # Zustand 狀態管理
│   │   │   ├── index.ts
│   │   │   ├── file-store.ts
│   │   │   ├── panel-store.ts
│   │   │   ├── selection-store.ts
│   │   │   ├── settings-store.ts
│   │   │   └── ui-store.ts
│   │   ├── services/           # 前端服務
│   │   │   ├── ipc-client.ts
│   │   │   └── file-type-service.ts
│   │   ├── utils/              # 工具函數
│   │   │   ├── format-utils.ts
│   │   │   ├── sort-utils.ts
│   │   │   └── filter-utils.ts
│   │   ├── types/              # TypeScript 類型
│   │   │   ├── file.ts
│   │   │   ├── settings.ts
│   │   │   └── ipc.ts
│   │   └── styles/             # 樣式檔案
│   │       ├── globals.css
│   │       └── themes/
│   │           ├── dark.css
│   │           └── light.css
│   │
│   └── shared/                 # 共用代碼
│       ├── constants.ts
│       ├── types.ts
│       └── utils.ts
│
├── resources/                  # 靜態資源
│   ├── icons/
│   └── locales/
│
├── tests/                      # 測試檔案
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── scripts/                    # 建置腳本
│   ├── build.ts
│   └── notarize.ts
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── electron-builder.yml
├── tailwind.config.js
└── README.md
```

## 2.3 核心依賴清單

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.4.0",
    "react-virtuoso": "^4.6.0",
    "chokidar": "^3.5.3",
    "archiver": "^6.0.0",
    "extract-zip": "^2.0.1",
    "crypto-js": "^4.2.0",
    "date-fns": "^2.30.0",
    "lodash-es": "^4.17.21",
    "lucide-react": "^0.294.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.1.0"
  },
  "devDependencies": {
    "electron": "^28.0.0",
    "electron-builder": "^24.9.0",
    "vite": "^5.0.0",
    "typescript": "^5.3.0",
    "@types/react": "^18.2.0",
    "tailwindcss": "^3.3.0",
    "vitest": "^1.0.0",
    "playwright": "^1.40.0"
  }
}
```

---

# 三、Phase 1: MVP 前期（4-6 週）

## 3.1 目標定義

```
MVP 完成標準：
├── ✅ 雙面板可正常顯示檔案列表
├── ✅ 可執行複製、移動、刪除、改名
├── ✅ 標記系統可運作
├── ✅ 核心快捷鍵可使用
├── ✅ 深色/淺色主題可切換
└── ✅ 可打包為可執行檔
```

## 3.2 週次計畫

### Week 1：專案初始化與基礎架構

#### Day 1-2：環境建置

```
任務清單：
□ 1.1.1 初始化 Git 倉庫
    □ 建立 .gitignore
    □ 設定 branch 策略 (main, develop, feature/*)
    □ 建立 PR template
    □ 建立 issue template

□ 1.1.2 初始化專案
    □ pnpm init
    □ 安裝 Electron
    □ 安裝 React + TypeScript
    □ 安裝 Vite
    □ 設定 tsconfig.json
    □ 設定 vite.config.ts

□ 1.1.3 設定開發環境
    □ ESLint 設定
    □ Prettier 設定
    □ Husky pre-commit hooks
    □ lint-staged 設定

□ 1.1.4 建立專案結構
    □ 建立 src/main 目錄結構
    □ 建立 src/renderer 目錄結構
    □ 建立 src/shared 目錄結構
```

**產出物**：

- 可運行的空白 Electron + React 專案
- 完整的開發環境設定

#### Day 3-4：Electron 主進程架構

```
任務清單：
□ 1.2.1 主進程入口
    □ 建立 src/main/index.ts
    □ 設定 BrowserWindow 參數
    □ 設定視窗最小尺寸 (1024x768)
    □ 設定視窗標題
    □ 載入 renderer

□ 1.2.2 IPC 通訊架構
    □ 建立 src/main/ipc/index.ts
    □ 定義 IPC channel 常數
    □ 建立 IPC handler 註冊機制
    □ 建立錯誤處理機制

□ 1.2.3 Preload 腳本
    □ 建立 src/main/preload.ts
    □ 暴露安全的 API 給 renderer
    □ 設定 contextBridge

□ 1.2.4 基礎服務框架
    □ 建立 FileService 類別骨架
    □ 建立 WatchService 類別骨架
```

**產出物**：

- 完整的主進程架構
- IPC 通訊機制
- Preload 安全橋接

#### Day 5：渲染進程基礎

```
任務清單：
□ 1.3.1 React 入口設定
    □ 建立 src/renderer/main.tsx
    □ 建立 src/renderer/App.tsx
    □ 設定 React Router (如需要)

□ 1.3.2 Tailwind CSS 設定
    □ 安裝 Tailwind CSS
    □ 設定 tailwind.config.js
    □ 建立 globals.css
    □ 設定深色模式支援

□ 1.3.3 Zustand 狀態管理
    □ 建立 stores/index.ts
    □ 建立基礎 store 結構
    □ 設定 devtools

□ 1.3.4 IPC 客戶端
    □ 建立 services/ipc-client.ts
    □ 封裝 IPC 呼叫方法
    □ 加入 TypeScript 類型
```

**產出物**：

- 完整的渲染進程架構
- 狀態管理系統
- 前後端通訊機制

---

### Week 2：核心 UI 組件

#### Day 1-2：佈局組件

```
任務清單：
□ 2.1.1 MainLayout 組件
    □ 建立 components/layout/MainLayout.tsx
    □ 實作整體佈局結構
    □ 設定 flex 佈局
    □ 支援響應式

□ 2.1.2 Header 組件
    □ 建立 components/layout/Header.tsx
    □ 顯示應用程式標題
    □ 顯示目前路徑
    □ 視窗控制按鈕 (最小化/最大化/關閉)

□ 2.1.3 Toolbar 組件
    □ 建立 components/layout/Toolbar.tsx
    □ 實作工具列按鈕
        □ 複製按鈕
        □ 移動按鈕
        □ 刪除按鈕
        □ 改名按鈕
        □ 新增資料夾按鈕
        □ 重新整理按鈕
    □ 按鈕 hover 效果
    □ 按鈕 disabled 狀態

□ 2.1.4 StatusBar 組件
    □ 建立 components/layout/StatusBar.tsx
    □ 顯示檔案數量統計
    □ 顯示已選取數量
    □ 顯示已選取大小
    □ 顯示磁碟剩餘空間

□ 2.1.5 SplitPane 組件
    □ 建立 components/layout/SplitPane.tsx
    □ 實作可拖曳分隔線
    □ 左右面板比例調整
    □ 記住面板比例
    □ 最小寬度限制
```

**組件規格 - MainLayout**：

```typescript
// components/layout/MainLayout.tsx
interface MainLayoutProps {
  children?: React.ReactNode;
}

// 佈局結構
┌─────────────────────────────────────────┐
│ Header (40px)                           │
├─────────────────────────────────────────┤
│ Toolbar (36px)                          │
├───────────────────┬─────────────────────┤
│                   │                     │
│   Left Panel      │    Right Panel      │
│   (50%)          │    (50%)            │
│                   │                     │
├───────────────────┴─────────────────────┤
│ StatusBar (24px)                        │
└─────────────────────────────────────────┘
```

**組件規格 - Toolbar**：

```typescript
// components/layout/Toolbar.tsx
interface ToolbarProps {
  onCopy: () => void;
  onMove: () => void;
  onDelete: () => void;
  onRename: () => void;
  onNewFolder: () => void;
  onRefresh: () => void;
  hasSelection: boolean;
}

// 按鈕配置
const toolbarButtons = [
  { id: 'copy', icon: Copy, label: '複製', shortcut: 'C' },
  { id: 'move', icon: Move, label: '移動', shortcut: 'M' },
  { id: 'delete', icon: Trash, label: '刪除', shortcut: 'D' },
  { id: 'rename', icon: Edit, label: '改名', shortcut: 'R' },
  { id: 'newFolder', icon: FolderPlus, label: '新增資料夾', shortcut: 'F3' },
  { id: 'refresh', icon: RefreshCw, label: '重新整理', shortcut: 'F5' },
];
```

#### Day 3-4：檔案面板組件

```
任務清單：
□ 2.2.1 FilePanel 組件
    □ 建立 components/panels/FilePanel.tsx
    □ 整合 PathBar + FileList
    □ 管理面板狀態
    □ 處理焦點狀態

□ 2.2.2 PathBar 組件
    □ 建立 components/panels/PathBar.tsx
    □ 顯示目前路徑
    □ 麵包屑導航
    □ 點擊跳轉功能
    □ 路徑輸入模式 (雙擊切換)
    □ 磁碟機選擇下拉

□ 2.2.3 FileList 組件
    □ 建立 components/panels/FileList.tsx
    □ 虛擬捲動 (react-virtuoso)
    □ 欄位標題列
        □ 名稱 (可排序)
        □ 大小 (可排序)
        □ 修改日期 (可排序)
        □ 類型
    □ 點擊排序功能
    □ 空目錄提示

□ 2.2.4 FileItem 組件
    □ 建立 components/panels/FileItem.tsx
    □ 檔案圖示 (依類型)
    □ 檔案名稱
    □ 檔案大小 (格式化)
    □ 修改日期
    □ 選取狀態樣式
    □ 標記狀態樣式
    □ hover 效果
    □ 雙擊開啟
    □ 右鍵選單
```

**組件規格 - FileItem**：

```typescript
// components/panels/FileItem.tsx
interface FileItemProps {
  file: FileInfo;
  isSelected: boolean;
  isMarked: boolean;
  isFocused: boolean;
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

interface FileInfo {
  name: string;
  path: string;
  size: number;
  isDirectory: boolean;
  isHidden: boolean;
  isSystem: boolean;
  modifiedTime: Date;
  createdTime: Date;
  extension: string;
}

// 顏色規則
const fileColors = {
  directory: 'text-yellow-400',
  executable: 'text-green-400', // .exe, .bat, .cmd, .sh
  archive: 'text-red-400', // .zip, .rar, .7z, .tar
  image: 'text-purple-400', // .jpg, .png, .gif
  document: 'text-blue-400', // .pdf, .doc, .txt
  default: 'text-gray-200',
};
```

#### Day 5：通用組件

```
任務清單：
□ 2.3.1 Button 組件
    □ 建立 components/common/Button.tsx
    □ 變體：primary, secondary, ghost, danger
    □ 尺寸：sm, md, lg
    □ 狀態：loading, disabled
    □ 圖示支援

□ 2.3.2 Input 組件
    □ 建立 components/common/Input.tsx
    □ 文字輸入
    □ 搜尋輸入 (帶圖示)
    □ 驗證錯誤顯示

□ 2.3.3 ContextMenu 組件
    □ 建立 components/common/ContextMenu.tsx
    □ 右鍵觸發
    □ 選單項目
    □ 分隔線
    □ 子選單
    □ 快捷鍵提示
    □ 點擊外部關閉

□ 2.3.4 Tooltip 組件
    □ 建立 components/common/Tooltip.tsx
    □ 延遲顯示
    □ 位置：top, bottom, left, right
```

**組件規格 - ContextMenu**：

```typescript
// components/common/ContextMenu.tsx
interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ComponentType;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  separator?: boolean;
  children?: ContextMenuItem[];
  onClick?: () => void;
}

// 檔案右鍵選單配置
const fileContextMenu: ContextMenuItem[] = [
  { id: 'open', label: '開啟', shortcut: 'Enter' },
  { id: 'separator1', separator: true },
  { id: 'copy', label: '複製', icon: Copy, shortcut: 'C' },
  { id: 'move', label: '移動', icon: Move, shortcut: 'M' },
  { id: 'delete', label: '刪除', icon: Trash, shortcut: 'D', danger: true },
  { id: 'separator2', separator: true },
  { id: 'rename', label: '重新命名', icon: Edit, shortcut: 'R' },
  { id: 'separator3', separator: true },
  { id: 'properties', label: '屬性', shortcut: 'Alt+Enter' },
];
```

---

### Week 3：檔案操作核心

#### Day 1-2：檔案服務實作

```
任務清單：
□ 3.1.1 FileService 類別
    □ 建立 src/main/services/file-service.ts

    □ readDirectory(path: string)
        □ 讀取目錄內容
        □ 取得檔案資訊 (大小、日期、屬性)
        □ 過濾隱藏檔案 (可選)
        □ 排序處理
        □ 錯誤處理 (權限不足等)

    □ getFileInfo(path: string)
        □ 取得單一檔案詳細資訊
        □ 檔案類型判斷
        □ MIME type 偵測

    □ getDrives()
        □ 取得系統磁碟機列表
        □ 磁碟機標籤
        □ 可用空間
        □ 總空間

    □ exists(path: string)
        □ 檢查路徑是否存在

    □ isDirectory(path: string)
        □ 檢查是否為目錄

□ 3.1.2 IPC 處理器
    □ 建立 src/main/ipc/file-operations.ts
    □ 註冊 'file:read-directory' handler
    □ 註冊 'file:get-info' handler
    □ 註冊 'file:get-drives' handler
    □ 統一錯誤格式
```

**FileService 規格**：

```typescript
// src/main/services/file-service.ts
interface FileService {
  readDirectory(path: string, options?: ReadDirectoryOptions): Promise<FileInfo[]>;
  getFileInfo(path: string): Promise<FileInfo>;
  getDrives(): Promise<DriveInfo[]>;
  exists(path: string): Promise<boolean>;
  isDirectory(path: string): Promise<boolean>;
}

interface ReadDirectoryOptions {
  showHidden?: boolean;
  sortBy?: 'name' | 'size' | 'date' | 'extension';
  sortOrder?: 'asc' | 'desc';
}

interface DriveInfo {
  name: string; // 'C:', 'D:'
  label: string; // '本機磁碟', 'DATA'
  type: 'fixed' | 'removable' | 'network' | 'cdrom';
  totalSpace: number;
  freeSpace: number;
}
```

#### Day 3-4：檔案操作實作

```
任務清單：
□ 3.2.1 複製功能
    □ copy(sources: string[], destination: string)
        □ 單檔複製
        □ 多檔複製
        □ 目錄遞迴複製
        □ 進度回報
        □ 衝突處理 (覆蓋/跳過/重新命名)
        □ 取消機制
        □ 錯誤處理

□ 3.2.2 移動功能
    □ move(sources: string[], destination: string)
        □ 同磁碟移動 (rename)
        □ 跨磁碟移動 (copy + delete)
        □ 進度回報
        □ 衝突處理
        □ 取消機制

□ 3.2.3 刪除功能
    □ delete(paths: string[], options?: DeleteOptions)
        □ 單檔刪除
        □ 多檔刪除
        □ 目錄遞迴刪除
        □ 移至資源回收桶 (electron.shell.trashItem)
        □ 永久刪除
        □ 進度回報

□ 3.2.4 重新命名功能
    □ rename(oldPath: string, newName: string)
        □ 檔案改名
        □ 目錄改名
        □ 名稱驗證
        □ 重複檢查

□ 3.2.5 建立資料夾
    □ createDirectory(path: string, name: string)
        □ 建立目錄
        □ 名稱驗證
        □ 重複檢查
```

**複製功能規格**：

```typescript
// src/main/services/file-service.ts
interface CopyOptions {
  overwrite?: boolean;
  skipExisting?: boolean;
  rename?: boolean; // 自動重新命名 (file_1.txt)
}

interface CopyProgress {
  totalFiles: number;
  completedFiles: number;
  currentFile: string;
  totalBytes: number;
  copiedBytes: number;
  speed: number; // bytes per second
  eta: number; // seconds remaining
}

// 進度回報透過 IPC
ipcMain.on('file:copy-progress', (event, progress: CopyProgress) => {
  mainWindow.webContents.send('file:copy-progress', progress);
});
```

#### Day 5：前端整合

```
任務清單：
□ 3.3.1 useFileOperations Hook
    □ 建立 hooks/useFileOperations.ts
    □ copy() 方法
    □ move() 方法
    □ delete() 方法
    □ rename() 方法
    □ createDirectory() 方法
    □ 進度狀態管理
    □ 錯誤處理

□ 3.3.2 ProgressDialog 組件
    □ 建立 components/dialogs/ProgressDialog.tsx
    □ 顯示操作類型
    □ 當前檔案名稱
    □ 進度條
    □ 速度顯示
    □ 剩餘時間
    □ 取消按鈕

□ 3.3.3 ConfirmDialog 組件
    □ 建立 components/dialogs/ConfirmDialog.tsx
    □ 確認訊息
    □ 確認/取消按鈕
    □ 危險操作警告樣式

□ 3.3.4 ConflictDialog 組件
    □ 建立 components/dialogs/ConflictDialog.tsx
    □ 顯示衝突檔案資訊
    □ 覆蓋選項
    □ 跳過選項
    □ 重新命名選項
    □ 套用到全部選項
```

---

### Week 4：標記與選取系統

#### Day 1-2：選取系統

```
任務清單：
□ 4.1.1 Selection Store
    □ 建立 stores/selection-store.ts
    □ 狀態定義
        □ selectedItems: Set<string>
        □ markedItems: Set<string>
        □ focusedItem: string | null
        □ lastSelectedItem: string | null

    □ Actions
        □ select(path: string)
        □ deselect(path: string)
        □ toggleSelect(path: string)
        □ selectRange(from: string, to: string)
        □ selectAll()
        □ deselectAll()
        □ mark(path: string)
        □ unmark(path: string)
        □ toggleMark(path: string)
        □ markAll()
        □ unmarkAll()
        □ invertMarks()
        □ setFocus(path: string)

□ 4.1.2 useSelection Hook
    □ 建立 hooks/useSelection.ts
    □ 整合 selection store
    □ 點擊選取邏輯
        □ 單擊：選取單一
        □ Ctrl+點擊：切換選取
        □ Shift+點擊：範圍選取
    □ 鍵盤導航邏輯
        □ ↑↓：移動焦點
        □ Ctrl+↑↓：移動焦點不選取
        □ Shift+↑↓：擴展選取

□ 4.1.3 選取視覺呈現
    □ 更新 FileItem 組件
    □ 選取狀態樣式 (背景色)
    □ 焦點狀態樣式 (邊框)
    □ 標記狀態樣式 (反白)
```

**Selection Store 規格**：

```typescript
// stores/selection-store.ts
interface SelectionState {
  // 選取狀態 (滑鼠點選，藍色高亮)
  selectedItems: Set<string>;

  // 標記狀態 (空白鍵標記，用於批次操作)
  markedItems: Set<string>;

  // 焦點項目 (鍵盤導航)
  focusedItem: string | null;

  // 上次選取項目 (用於 Shift 範圍選取)
  lastSelectedItem: string | null;

  // 統計
  markedCount: number;
  markedSize: number;
}

interface SelectionActions {
  // 選取操作
  select: (path: string) => void;
  deselect: (path: string) => void;
  toggleSelect: (path: string) => void;
  selectRange: (from: string, to: string, items: string[]) => void;
  selectAll: (items: string[]) => void;
  deselectAll: () => void;

  // 標記操作 (WinCV 特色)
  mark: (path: string) => void;
  unmark: (path: string) => void;
  toggleMark: (path: string) => void;
  markAll: (items: string[]) => void;
  unmarkAll: () => void;
  invertMarks: (items: string[]) => void;

  // 焦點操作
  setFocus: (path: string) => void;
  moveFocus: (direction: 'up' | 'down', items: string[]) => void;
}
```

#### Day 3-4：快捷鍵系統

```
任務清單：
□ 4.2.1 KeyboardShortcuts Hook
    □ 建立 hooks/useKeyboardShortcuts.ts
    □ 全域快捷鍵註冊
    □ 條件式快捷鍵 (需要選取)
    □ 防止瀏覽器預設行為
    □ 快捷鍵衝突處理

□ 4.2.2 MVP 快捷鍵清單

    檔案操作：
    □ C - 複製
    □ M - 移動
    □ D - 刪除
    □ R - 重新命名
    □ Enter - 開啟/進入
    □ Backspace - 返回上層
    □ F3 - 新增資料夾
    □ F5 - 重新整理

    標記操作：
    □ Space - 標記/取消標記
    □ T - 標記全部
    □ U - 取消全部標記
    □ * - 反轉標記

    導航：
    □ ↑↓ - 上下移動
    □ Home - 移至頂部
    □ End - 移至底部
    □ PageUp/PageDown - 翻頁
    □ Tab - 切換面板

    選取：
    □ Ctrl+A - 全選
    □ Ctrl+↑↓ - 移動焦點不選取
    □ Shift+↑↓ - 擴展選取

□ 4.2.3 快捷鍵提示
    □ Toolbar 按鈕顯示快捷鍵
    □ ContextMenu 顯示快捷鍵
    □ Tooltip 顯示快捷鍵
```

**快捷鍵系統規格**：

```typescript
// hooks/useKeyboardShortcuts.ts
interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  when?: () => boolean; // 條件式觸發
  preventDefault?: boolean;
}

const shortcuts: ShortcutConfig[] = [
  // 檔案操作
  { key: 'c', action: handleCopy, when: hasSelection },
  { key: 'm', action: handleMove, when: hasSelection },
  { key: 'd', action: handleDelete, when: hasSelection },
  { key: 'r', action: handleRename, when: hasSingleSelection },
  { key: 'Enter', action: handleOpen, when: hasFocus },
  { key: 'Backspace', action: handleGoUp },
  { key: 'F3', action: handleNewFolder },
  { key: 'F5', action: handleRefresh },

  // 標記操作
  { key: ' ', action: handleToggleMark, when: hasFocus },
  { key: 't', action: handleMarkAll },
  { key: 'u', action: handleUnmarkAll },
  { key: '*', action: handleInvertMarks },

  // 導航
  { key: 'ArrowUp', action: () => moveFocus('up') },
  { key: 'ArrowDown', action: () => moveFocus('down') },
  { key: 'Home', action: handleGoToTop },
  { key: 'End', action: handleGoToBottom },
  { key: 'Tab', action: handleSwitchPanel },

  // 選取
  { key: 'a', ctrl: true, action: handleSelectAll },
];
```

#### Day 5：StatusBar 完善

```
任務清單：
□ 4.3.1 StatusBar 資訊顯示
    □ 檔案總數
    □ 目錄總數
    □ 已選取數量
    □ 已標記數量
    □ 已標記大小 (格式化)
    □ 磁碟剩餘空間

□ 4.3.2 格式化工具
    □ 建立 utils/format-utils.ts
    □ formatFileSize(bytes: number)
        □ 自動單位 (B, KB, MB, GB, TB)
        □ 保留小數位數
    □ formatDate(date: Date)
        □ 日期格式
        □ 相對時間 (今天、昨天)
    □ formatNumber(num: number)
        □ 千分位分隔

□ 4.3.3 StatusBar 即時更新
    □ 監聽 selection store 變化
    □ 監聽 file store 變化
    □ 效能優化 (debounce)
```

---

### Week 5：主題與設定

#### Day 1-2：主題系統

```
任務清單：
□ 5.1.1 主題定義
    □ 建立 styles/themes/dark.css
    □ 建立 styles/themes/light.css
    □ CSS 變數定義
        □ --color-bg-primary
        □ --color-bg-secondary
        □ --color-bg-tertiary
        □ --color-text-primary
        □ --color-text-secondary
        □ --color-text-muted
        □ --color-border
        □ --color-accent
        □ --color-danger
        □ --color-success
        □ --color-warning
        □ 檔案類型顏色
            □ --color-file-directory
            □ --color-file-executable
            □ --color-file-archive
            □ --color-file-image
            □ --color-file-document

□ 5.1.2 主題切換機制
    □ 建立 stores/settings-store.ts
    □ theme: 'dark' | 'light' | 'system'
    □ 監聽系統主題變化
    □ 套用主題 class 到 body

□ 5.1.3 主題切換 UI
    □ Header 加入主題切換按鈕
    □ 圖示切換動畫
```

**主題 CSS 變數規格**：

```css
/* styles/themes/dark.css */
:root[data-theme='dark'] {
  /* 背景色 */
  --color-bg-primary: #0a0a0a;
  --color-bg-secondary: #141414;
  --color-bg-tertiary: #1f1f1f;
  --color-bg-hover: #2a2a2a;
  --color-bg-selected: #1e3a5f;

  /* 文字色 */
  --color-text-primary: #e5e5e5;
  --color-text-secondary: #a3a3a3;
  --color-text-muted: #737373;

  /* 邊框 */
  --color-border: #333333;
  --color-border-focus: #3b82f6;

  /* 強調色 */
  --color-accent: #3b82f6;
  --color-accent-hover: #2563eb;

  /* 狀態色 */
  --color-danger: #ef4444;
  --color-success: #22c55e;
  --color-warning: #f59e0b;

  /* 檔案類型色 */
  --color-file-directory: #facc15;
  --color-file-executable: #22c55e;
  --color-file-archive: #ef4444;
  --color-file-image: #a855f7;
  --color-file-document: #3b82f6;
  --color-file-default: #e5e5e5;
}
```

#### Day 3-4：設定系統

```
任務清單：
□ 5.2.1 Settings Store
    □ 建立完整 settings store
    □ 預設值
    □ 持久化 (electron-store)
    □ 設定項目：
        □ theme: 'dark' | 'light' | 'system'
        □ showHiddenFiles: boolean
        □ confirmDelete: boolean
        □ useTrashBin: boolean
        □ sortBy: 'name' | 'size' | 'date' | 'extension'
        □ sortOrder: 'asc' | 'desc'
        □ showFileSize: boolean
        □ showFileDate: boolean
        □ fileSizeUnit: 'auto' | 'KB' | 'MB'

□ 5.2.2 SettingsDialog 組件
    □ 建立 components/dialogs/SettingsDialog.tsx
    □ 分頁式設定
        □ 外觀
            □ 主題選擇
        □ 檔案列表
            □ 顯示隱藏檔案
            □ 顯示欄位選項
            □ 預設排序
        □ 行為
            □ 刪除確認
            □ 使用資源回收桶
    □ 即時預覽變更
    □ 儲存/取消按鈕

□ 5.2.3 設定持久化
    □ 安裝 electron-store
    □ 主進程設定存取
    □ IPC 同步設定
```

#### Day 5：排序與過濾

```
任務清單：
□ 5.3.1 排序功能
    □ 建立 utils/sort-utils.ts
    □ 排序選項
        □ 依名稱
        □ 依大小
        □ 依修改日期
        □ 依副檔名
    □ 排序順序 (昇冪/降冪)
    □ 目錄優先選項
    □ 欄位標題點擊排序
    □ 排序指示器 (箭頭圖示)

□ 5.3.2 過濾功能
    □ 建立 utils/filter-utils.ts
    □ 即時搜尋過濾
    □ 模糊匹配
    □ 高亮匹配文字
    □ 搜尋框 UI
```

---

### Week 6：打包與測試

#### Day 1-2：應用程式打包

```
任務清單：
□ 6.1.1 Electron Builder 設定
    □ 建立 electron-builder.yml
    □ Windows 打包設定
        □ NSIS 安裝程式
        □ 應用程式圖示
        □ 檔案關聯 (可選)
    □ macOS 打包設定
        □ DMG 映像檔
        □ 應用程式圖示
        □ 程式碼簽章 (可選)
    □ Linux 打包設定
        □ AppImage
        □ deb 套件

□ 6.1.2 應用程式圖示
    □ 設計應用程式圖示
    □ 各平台尺寸
        □ Windows: ico (256x256)
        □ macOS: icns (1024x1024)
        □ Linux: png (512x512)

□ 6.1.3 建置腳本
    □ pnpm run build:win
    □ pnpm run build:mac
    □ pnpm run build:linux
    □ pnpm run build:all
```

**electron-builder.yml 設定**：

```yaml
# electron-builder.yml
appId: com.wincv.modern
productName: WinCV Modern
copyright: Copyright © 2025

directories:
  output: dist
  buildResources: resources

files:
  - '!**/.git'
  - '!**/node_modules/*/{CHANGELOG.md,README.md}'

win:
  target:
    - target: nsis
      arch: [x64, ia32]
  icon: resources/icons/icon.ico

nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
  installerIcon: resources/icons/icon.ico
  uninstallerIcon: resources/icons/icon.ico

mac:
  target:
    - target: dmg
      arch: [x64, arm64]
  icon: resources/icons/icon.icns
  category: public.app-category.utilities

linux:
  target:
    - target: AppImage
      arch: [x64]
    - target: deb
      arch: [x64]
  icon: resources/icons
  category: Utility
```

#### Day 3-4：基礎測試

```
任務清單：
□ 6.2.1 單元測試設定
    □ 設定 Vitest
    □ 設定測試覆蓋率
    □ Mock IPC 模組

□ 6.2.2 工具函數測試
    □ format-utils.test.ts
        □ formatFileSize 測試案例
        □ formatDate 測試案例
    □ sort-utils.test.ts
        □ 各排序方式測試
    □ filter-utils.test.ts
        □ 過濾邏輯測試

□ 6.2.3 Store 測試
    □ selection-store.test.ts
        □ 選取邏輯測試
        □ 標記邏輯測試
    □ settings-store.test.ts
        □ 設定存取測試

□ 6.2.4 E2E 測試設定
    □ 設定 Playwright
    □ 基本啟動測試
    □ 檔案列表載入測試
```

#### Day 5：MVP 完成與檢查

```
任務清單：
□ 6.3.1 功能檢查清單
    □ 雙面板正常顯示
    □ 檔案列表正確載入
    □ 導航功能正常
    □ 複製功能正常
    □ 移動功能正常
    □ 刪除功能正常 (資源回收桶)
    □ 重新命名功能正常
    □ 建立資料夾功能正常
    □ 標記系統正常
    □ 快捷鍵正常
    □ 主題切換正常
    □ 設定儲存正常

□ 6.3.2 效能檢查
    □ 大量檔案 (1000+) 載入速度
    □ 虛擬捲動順暢度
    □ 記憶體佔用

□ 6.3.3 Bug 修復
    □ 建立 bug 追蹤清單
    □ 優先處理關鍵 bug

□ 6.3.4 文件整理
    □ README.md 更新
    □ 使用說明
    □ 快捷鍵參考表
```

## 3.3 MVP 完成標準檢查表

```
□ 核心功能
  □ 雙面板檔案瀏覽
  □ 目錄導航 (進入/返回/跳轉)
  □ 檔案複製
  □ 檔案移動
  □ 檔案刪除 (資源回收桶)
  □ 檔案重新命名
  □ 建立新資料夾
  □ 檔案排序
  □ 即時搜尋過濾

□ 標記系統
  □ 空白鍵標記/取消
  □ 全部標記 (T)
  □ 取消全部 (U)
  □ 反轉標記 (*)

□ 快捷鍵
  □ 檔案操作快捷鍵 (C/M/D/R)
  □ 導航快捷鍵 (方向鍵/Enter/Backspace)
  □ 標記快捷鍵 (Space/T/U/*)

□ UI/UX
  □ 深色主題
  □ 淺色主題
  □ 右鍵選單
  □ 進度對話框
  □ 確認對話框
  □ 狀態列資訊

□ 效能
  □ 1000+ 檔案順暢瀏覽
  □ 啟動時間 < 3 秒
  □ 記憶體 < 300MB

□ 品質
  □ 主要功能無 crash
  □ 基本測試通過
  □ 可打包執行
```

---

# 四、Phase 2: 核心完善 中期（6-8 週）

## 4.1 目標定義

```
Phase 2 完成標準：
├── ✅ 分頁功能
├── ✅ 書籤/我的最愛
├── ✅ 批次改名 (正則支援)
├── ✅ 壓縮/解壓縮
├── ✅ 檔案預覽面板
├── ✅ MD5/SHA 校驗
├── ✅ 拖放支援
└── ✅ 檔案比較功能
```

## 4.2 週次計畫

### Week 7-8：分頁功能

```
任務清單：
□ 分頁系統架構
    □ Tab Store 設計
        □ tabs: Tab[]
        □ activeTabId: string
        □ addTab()
        □ removeTab()
        □ switchTab()
        □ moveTab()
        □ duplicateTab()

    □ Tab 資料結構
        □ id: string
        □ path: string
        □ title: string
        □ icon: string
        □ isLoading: boolean
        □ scrollPosition: number

□ Tab UI 組件
    □ TabBar 組件
        □ Tab 標籤列表
        □ 新增分頁按鈕
        □ Tab overflow 處理 (箭頭/下拉)

    □ Tab 組件
        □ 圖示
        □ 標題 (可編輯)
        □ 關閉按鈕
        □ 右鍵選單
            □ 關閉分頁
            □ 關閉其他分頁
            □ 關閉右側分頁
            □ 複製分頁
        □ 拖曳排序

□ Tab 快捷鍵
    □ Ctrl+T - 新增分頁
    □ Ctrl+W - 關閉分頁
    □ Ctrl+Tab - 下一個分頁
    □ Ctrl+Shift+Tab - 上一個分頁
    □ Ctrl+1~9 - 跳至第 N 個分頁

□ Tab 持久化
    □ 記住分頁狀態
    □ 啟動時恢復分頁
```

### Week 9-10：書籤與批次改名

```
任務清單：
□ 書籤系統
    □ Bookmark Store
        □ bookmarks: Bookmark[]
        □ addBookmark()
        □ removeBookmark()
        □ updateBookmark()
        □ reorderBookmark()

    □ Bookmark 資料結構
        □ id: string
        □ name: string
        □ path: string
        □ icon: string
        □ color: string
        □ createdAt: Date

    □ BookmarkBar 組件
        □ 書籤列表
        □ 點擊跳轉
        □ 右鍵選單
            □ 編輯
            □ 刪除
            □ 在新分頁開啟
        □ 拖曳排序
        □ 拖曳新增 (從檔案列表)

    □ AddBookmarkDialog 組件
        □ 名稱輸入
        □ 路徑顯示
        □ 顏色選擇
        □ 圖示選擇

□ 批次改名功能
    □ BatchRenameDialog 組件
        □ 改名規則設定
            □ 尋找/取代
            □ 加入前綴
            □ 加入後綴
            □ 序號 (起始/位數/間隔)
            □ 大小寫轉換
            □ 正則表達式
        □ 即時預覽
        □ 套用/取消

    □ 改名引擎
        □ 解析改名規則
        □ 產生新檔名
        □ 衝突檢測
        □ 批次執行
```

**批次改名規格**：

```typescript
interface RenameRule {
  type: 'findReplace' | 'prefix' | 'suffix' | 'sequence' | 'case' | 'regex';
  params: RenameParams;
}

interface FindReplaceParams {
  find: string;
  replace: string;
  caseSensitive: boolean;
  useRegex: boolean;
}

interface SequenceParams {
  start: number;
  step: number;
  digits: number;
  position: 'prefix' | 'suffix' | 'replace';
}

interface CaseParams {
  mode: 'upper' | 'lower' | 'title' | 'sentence';
}

// 預覽結果
interface RenamePreview {
  originalName: string;
  newName: string;
  hasConflict: boolean;
  error?: string;
}
```

### Week 11-12：壓縮功能

```
任務清單：
□ 壓縮服務
    □ ArchiveService 類別
        □ compress(files: string[], output: string, options)
            □ 支援格式：zip, 7z, tar.gz
            □ 壓縮等級
            □ 密碼保護 (zip)
            □ 進度回報

        □ extract(archive: string, destination: string, options)
            □ 自動偵測格式
            □ 密碼輸入
            □ 進度回報

        □ list(archive: string)
            □ 列出壓縮檔內容
            □ 不解壓縮

□ 壓縮 UI
    □ CompressDialog 組件
        □ 格式選擇
        □ 壓縮等級
        □ 輸出路徑
        □ 密碼設定

    □ ExtractDialog 組件
        □ 目標路徑
        □ 密碼輸入
        □ 進度顯示

    □ ArchivePreview 組件
        □ 壓縮檔內容預覽
        □ 選擇性解壓縮

□ 快捷鍵
    □ Alt+Z - 壓縮
    □ Alt+U - 解壓縮
```

### Week 13-14：檔案預覽與校驗

```
任務清單：
□ 預覽面板
    □ PreviewPanel 組件
        □ 可開關
        □ 可調整大小
        □ 支援格式
            □ 圖片：jpg, png, gif, webp, svg
            □ 文字：txt, md, json, xml, csv
            □ 程式碼：js, ts, py, html, css
        □ 程式碼語法高亮

    □ ImagePreview 組件
        □ 縮放功能
        □ 圖片資訊 (尺寸、大小)

    □ TextPreview 組件
        □ 語法高亮 (Prism/Shiki)
        □ 行號顯示
        □ 搜尋功能

    □ 快捷鍵
        □ Alt+P - 切換預覽面板

□ 檔案校驗功能
    □ HashService 類別
        □ calculateMD5(file: string)
        □ calculateSHA1(file: string)
        □ calculateSHA256(file: string)
        □ 進度回報 (大檔案)

    □ HashDialog 組件
        □ 選擇雜湊類型
        □ 計算進度
        □ 結果顯示
        □ 複製到剪貼簿
        □ 驗證輸入

□ 檔案比較功能
    □ CompareDialog 組件
        □ 選擇兩個檔案
        □ 比較結果
            □ 相同
            □ 不同 (大小/內容)
        □ 差異詳情 (文字檔)
```

---

# 五、Phase 3: 進階功能 後期（8-10 週）

## 5.1 目標定義

```
Phase 3 完成標準：
├── ✅ 雲端儲存整合 (Google Drive/OneDrive/Dropbox)
├── ✅ 資料夾同步功能
├── ✅ 進階搜尋 (內容搜尋)
├── ✅ 終端機整合
├── ✅ Git 狀態整合
├── ✅ 自訂主題系統
└── ✅ 多語系支援
```

## 5.2 週次計畫

### Week 15-17：雲端整合

```
任務清單：
□ 雲端服務抽象層
    □ CloudProvider 介面
        □ authenticate()
        □ listFiles(path: string)
        □ downloadFile(remotePath: string, localPath: string)
        □ uploadFile(localPath: string, remotePath: string)
        □ deleteFile(remotePath: string)
        □ createFolder(path: string)

    □ 支援的雲端服務
        □ Google Drive
            □ OAuth2 認證
            □ Google Drive API v3
        □ OneDrive
            □ Microsoft Graph API
        □ Dropbox
            □ Dropbox API v2

□ 雲端 UI
    □ CloudAccountsDialog 組件
        □ 新增帳號
        □ 管理已連結帳號
        □ 移除帳號

    □ 雲端面板整合
        □ 雲端磁碟顯示在磁碟列表
        □ 統一的檔案操作體驗
        □ 上傳/下載進度

□ 離線支援
    □ 檔案快取
    □ 同步佇列
```

### Week 18-20：同步與搜尋

```
任務清單：
□ 資料夾同步
    □ SyncService 類別
        □ 比較兩個目錄
        □ 差異分析
            □ 新增檔案
            □ 修改檔案
            □ 刪除檔案
        □ 同步策略
            □ 雙向同步
            □ 單向同步 (A→B / B→A)
            □ 鏡像

    □ SyncDialog 組件
        □ 來源/目標選擇
        □ 同步策略選擇
        □ 差異預覽
        □ 排除規則
        □ 同步進度

□ 進階搜尋
    □ SearchService 類別
        □ 檔名搜尋 (即時)
        □ 內容搜尋
            □ 文字檔內容
            □ 正則表達式
        □ 屬性搜尋
            □ 大小範圍
            □ 日期範圍
            □ 副檔名

    □ AdvancedSearchDialog 組件
        □ 搜尋條件設定
        □ 搜尋結果列表
        □ 結果操作
```

### Week 21-23：終端機與 Git

```
任務清單：
□ 終端機整合
    □ 使用 xterm.js
    □ TerminalPanel 組件
        □ 開啟終端機
        □ 在當前目錄開啟
        □ 多終端機分頁
        □ 終端機主題
    □ 快捷鍵
        □ Ctrl+` - 開啟終端機

□ Git 整合
    □ GitService 類別
        □ getStatus(path: string)
        □ 取得檔案狀態
            □ modified
            □ added
            □ deleted
            □ untracked

    □ Git 狀態顯示
        □ 檔案列表 Git 圖示
        □ 顏色標示
        □ 狀態列 branch 顯示
```

### Week 24-26：自訂與多語系

```
任務清單：
□ 自訂主題系統
    □ Theme Editor
        □ 顏色自訂
        □ 即時預覽
        □ 匯出/匯入

    □ 預設主題擴充
        □ Monokai
        □ Solarized Dark/Light
        □ Nord
        □ Dracula

□ 多語系支援
    □ i18n 架構
        □ 使用 react-i18next
        □ 語系檔案結構

    □ 支援語系
        □ 繁體中文 (zh-TW)
        □ 簡體中文 (zh-CN)
        □ 英文 (en)
        □ 日文 (ja)

    □ 語系切換 UI
```

---

# 六、Phase 4: 優化擴展 長期（持續）

## 6.1 目標定義

```
Phase 4 持續目標：
├── 🔄 效能優化
├── 🔄 外掛系統
├── 🔄 自動化腳本
├── 🔄 企業版功能
└── 🔄 社群生態
```

## 6.2 功能規劃

### 外掛系統

```
任務清單：
□ 外掛架構
    □ Plugin API 設計
        □ 生命週期鉤子
        □ UI 擴展點
        □ 檔案操作擴展
        □ 右鍵選單擴展

    □ Plugin Manifest
        □ 名稱、版本、作者
        □ 權限需求
        □ 入口點

    □ 外掛管理器
        □ 安裝外掛
        □ 啟用/停用
        □ 更新外掛
        □ 外掛設定

□ 官方外掛
    □ 圖片批次處理
    □ PDF 工具
    □ FTP/SFTP 支援
    □ AWS S3 支援
```

### 自動化腳本

```
任務清單：
□ 巨集錄製
    □ 錄製操作序列
    □ 播放巨集
    □ 編輯巨集

□ 腳本支援
    □ JavaScript 腳本引擎
    □ 腳本 API
    □ 腳本範例
```

### 企業版功能

```
任務清單：
□ 集中管理
    □ 組態派送
    □ 授權管理

□ 安全功能
    □ 稽核日誌
    □ 權限控制

□ 整合功能
    □ Active Directory
    □ LDAP
```

---

# 七、資料結構設計

## 7.1 核心資料結構

```typescript
// 檔案資訊
interface FileInfo {
  name: string;
  path: string;
  absolutePath: string;
  size: number;
  isDirectory: boolean;
  isHidden: boolean;
  isSystem: boolean;
  isReadOnly: boolean;
  createdTime: Date;
  modifiedTime: Date;
  accessedTime: Date;
  extension: string;
  mimeType?: string;
}

// 磁碟資訊
interface DriveInfo {
  name: string; // 'C:', '/home'
  label: string; // 'Windows', 'Data'
  type: DriveType;
  fileSystem: string; // 'NTFS', 'ext4'
  totalSpace: number;
  freeSpace: number;
  usedSpace: number;
  isReady: boolean;
}

type DriveType = 'fixed' | 'removable' | 'network' | 'cdrom' | 'ram';

// 分頁
interface Tab {
  id: string;
  path: string;
  title: string;
  icon: string;
  isActive: boolean;
  isPinned: boolean;
  scrollPosition: number;
  selection: string[];
  marks: string[];
  history: string[];
  historyIndex: number;
}

// 書籤
interface Bookmark {
  id: string;
  name: string;
  path: string;
  icon: string;
  color: string;
  order: number;
  createdAt: Date;
}

// 操作進度
interface OperationProgress {
  id: string;
  type: 'copy' | 'move' | 'delete' | 'compress' | 'extract';
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  totalItems: number;
  completedItems: number;
  totalBytes: number;
  processedBytes: number;
  currentItem: string;
  speed: number;
  eta: number;
  startTime: Date;
  error?: string;
}

// 設定
interface Settings {
  // 外觀
  theme: 'dark' | 'light' | 'system';
  language: string;
  fontSize: 'small' | 'medium' | 'large';

  // 檔案列表
  showHiddenFiles: boolean;
  showFileExtensions: boolean;
  showFileSize: boolean;
  showFileDate: boolean;
  fileSizeUnit: 'auto' | 'bytes' | 'KB' | 'MB';
  dateFormat: string;
  sortBy: 'name' | 'size' | 'date' | 'extension';
  sortOrder: 'asc' | 'desc';
  foldersFirst: boolean;

  // 行為
  confirmDelete: boolean;
  useTrashBin: boolean;
  confirmOverwrite: boolean;
  autoRefresh: boolean;
  rememberTabs: boolean;
  rememberPanelSize: boolean;

  // 預覽
  enablePreview: boolean;
  previewPanelSize: number;
  maxPreviewSize: number; // bytes

  // 快捷鍵
  shortcuts: Record<string, string>;
}
```

## 7.2 Store 結構

```typescript
// File Store
interface FileStore {
  // 左面板
  leftPanel: {
    path: string;
    files: FileInfo[];
    isLoading: boolean;
    error: string | null;
  };

  // 右面板
  rightPanel: {
    path: string;
    files: FileInfo[];
    isLoading: boolean;
    error: string | null;
  };

  // 當前活動面板
  activePanel: 'left' | 'right';

  // Actions
  setPath: (panel: 'left' | 'right', path: string) => Promise<void>;
  refresh: (panel?: 'left' | 'right') => Promise<void>;
  setActivePanel: (panel: 'left' | 'right') => void;
}

// Selection Store
interface SelectionStore {
  // 選取狀態
  selectedItems: {
    left: Set<string>;
    right: Set<string>;
  };

  // 標記狀態
  markedItems: {
    left: Set<string>;
    right: Set<string>;
  };

  // 焦點
  focusedItem: {
    left: string | null;
    right: string | null;
  };

  // Actions
  select: (panel: 'left' | 'right', path: string) => void;
  toggleSelect: (panel: 'left' | 'right', path: string) => void;
  selectRange: (panel: 'left' | 'right', from: string, to: string) => void;
  selectAll: (panel: 'left' | 'right') => void;
  clearSelection: (panel: 'left' | 'right') => void;

  toggleMark: (panel: 'left' | 'right', path: string) => void;
  markAll: (panel: 'left' | 'right') => void;
  unmarkAll: (panel: 'left' | 'right') => void;
  invertMarks: (panel: 'left' | 'right') => void;

  setFocus: (panel: 'left' | 'right', path: string) => void;
}

// Tab Store
interface TabStore {
  tabs: {
    left: Tab[];
    right: Tab[];
  };

  activeTabIndex: {
    left: number;
    right: number;
  };

  // Actions
  addTab: (panel: 'left' | 'right', path?: string) => void;
  removeTab: (panel: 'left' | 'right', index: number) => void;
  switchTab: (panel: 'left' | 'right', index: number) => void;
  moveTab: (panel: 'left' | 'right', from: number, to: number) => void;
  updateTab: (panel: 'left' | 'right', index: number, data: Partial<Tab>) => void;
}

// UI Store
interface UIStore {
  // 對話框狀態
  dialogs: {
    settings: boolean;
    rename: boolean;
    newFolder: boolean;
    progress: boolean;
    confirm: boolean;
    batchRename: boolean;
    compress: boolean;
    extract: boolean;
  };

  // 面板狀態
  panelRatio: number; // 0-1, 左面板比例
  showPreview: boolean;
  previewSize: number;
  showBookmarks: boolean;
  showTerminal: boolean;

  // 當前操作
  currentOperation: OperationProgress | null;

  // Actions
  openDialog: (dialog: keyof UIStore['dialogs']) => void;
  closeDialog: (dialog: keyof UIStore['dialogs']) => void;
  setPanelRatio: (ratio: number) => void;
  togglePreview: () => void;
}

// Settings Store
interface SettingsStore {
  settings: Settings;

  // Actions
  updateSettings: (partial: Partial<Settings>) => void;
  resetSettings: () => void;
  importSettings: (settings: Settings) => void;
  exportSettings: () => Settings;
}
```

---

# 八、API 規格

## 8.1 IPC Channel 定義

```typescript
// IPC Channel 常數
const IPC_CHANNELS = {
  // 檔案操作
  FILE_READ_DIRECTORY: 'file:read-directory',
  FILE_GET_INFO: 'file:get-info',
  FILE_GET_DRIVES: 'file:get-drives',
  FILE_COPY: 'file:copy',
  FILE_MOVE: 'file:move',
  FILE_DELETE: 'file:delete',
  FILE_RENAME: 'file:rename',
  FILE_CREATE_DIRECTORY: 'file:create-directory',
  FILE_EXISTS: 'file:exists',
  FILE_OPEN: 'file:open',
  FILE_OPEN_WITH: 'file:open-with',
  FILE_SHOW_IN_EXPLORER: 'file:show-in-explorer',

  // 進度事件
  PROGRESS_UPDATE: 'progress:update',
  PROGRESS_COMPLETE: 'progress:complete',
  PROGRESS_ERROR: 'progress:error',
  PROGRESS_CANCEL: 'progress:cancel',

  // 檔案監視
  WATCH_START: 'watch:start',
  WATCH_STOP: 'watch:stop',
  WATCH_EVENT: 'watch:event',

  // 壓縮
  ARCHIVE_COMPRESS: 'archive:compress',
  ARCHIVE_EXTRACT: 'archive:extract',
  ARCHIVE_LIST: 'archive:list',

  // 雜湊
  HASH_CALCULATE: 'hash:calculate',

  // 設定
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',

  // 系統
  SYSTEM_GET_INFO: 'system:get-info',
  SYSTEM_GET_PLATFORM: 'system:get-platform',

  // 視窗
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',
} as const;
```

## 8.2 IPC 請求/回應格式

```typescript
// 通用回應格式
interface IPCResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// 讀取目錄
interface ReadDirectoryRequest {
  path: string;
  options?: {
    showHidden?: boolean;
    sortBy?: 'name' | 'size' | 'date' | 'extension';
    sortOrder?: 'asc' | 'desc';
  };
}

type ReadDirectoryResponse = IPCResponse<FileInfo[]>;

// 複製檔案
interface CopyFilesRequest {
  sources: string[];
  destination: string;
  options?: {
    overwrite?: boolean;
    skipExisting?: boolean;
    autoRename?: boolean;
  };
}

interface CopyFilesResponse {
  success: boolean;
  copied: number;
  skipped: number;
  failed: number;
  errors?: Array<{ file: string; error: string }>;
}

// 刪除檔案
interface DeleteFilesRequest {
  paths: string[];
  options?: {
    useTrashBin?: boolean;
    permanent?: boolean;
  };
}

// 重新命名
interface RenameFileRequest {
  oldPath: string;
  newName: string;
}

// 壓縮
interface CompressRequest {
  files: string[];
  outputPath: string;
  format: 'zip' | '7z' | 'tar.gz';
  options?: {
    level?: number; // 1-9
    password?: string;
  };
}

// 解壓縮
interface ExtractRequest {
  archivePath: string;
  destination: string;
  options?: {
    password?: string;
    overwrite?: boolean;
  };
}

// 計算雜湊
interface CalculateHashRequest {
  filePath: string;
  algorithm: 'md5' | 'sha1' | 'sha256';
}

interface CalculateHashResponse {
  hash: string;
  algorithm: string;
  filePath: string;
}
```

## 8.3 Preload API

```typescript
// src/main/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

const api = {
  // 檔案操作
  file: {
    readDirectory: (path: string, options?: ReadDirectoryOptions) =>
      ipcRenderer.invoke('file:read-directory', { path, options }),

    getInfo: (path: string) => ipcRenderer.invoke('file:get-info', { path }),

    getDrives: () => ipcRenderer.invoke('file:get-drives'),

    copy: (sources: string[], destination: string, options?: CopyOptions) =>
      ipcRenderer.invoke('file:copy', { sources, destination, options }),

    move: (sources: string[], destination: string, options?: MoveOptions) =>
      ipcRenderer.invoke('file:move', { sources, destination, options }),

    delete: (paths: string[], options?: DeleteOptions) =>
      ipcRenderer.invoke('file:delete', { paths, options }),

    rename: (oldPath: string, newName: string) =>
      ipcRenderer.invoke('file:rename', { oldPath, newName }),

    createDirectory: (parentPath: string, name: string) =>
      ipcRenderer.invoke('file:create-directory', { parentPath, name }),

    exists: (path: string) => ipcRenderer.invoke('file:exists', { path }),

    open: (path: string) => ipcRenderer.invoke('file:open', { path }),

    showInExplorer: (path: string) => ipcRenderer.invoke('file:show-in-explorer', { path }),
  },

  // 進度事件
  progress: {
    onUpdate: (callback: (progress: OperationProgress) => void) =>
      ipcRenderer.on('progress:update', (_, progress) => callback(progress)),

    onComplete: (callback: (result: any) => void) =>
      ipcRenderer.on('progress:complete', (_, result) => callback(result)),

    onError: (callback: (error: any) => void) =>
      ipcRenderer.on('progress:error', (_, error) => callback(error)),

    cancel: (operationId: string) => ipcRenderer.invoke('progress:cancel', { operationId }),

    removeListeners: () => {
      ipcRenderer.removeAllListeners('progress:update');
      ipcRenderer.removeAllListeners('progress:complete');
      ipcRenderer.removeAllListeners('progress:error');
    },
  },

  // 檔案監視
  watch: {
    start: (path: string) => ipcRenderer.invoke('watch:start', { path }),

    stop: (path: string) => ipcRenderer.invoke('watch:stop', { path }),

    onEvent: (callback: (event: WatchEvent) => void) =>
      ipcRenderer.on('watch:event', (_, event) => callback(event)),
  },

  // 壓縮
  archive: {
    compress: (files: string[], outputPath: string, options?: CompressOptions) =>
      ipcRenderer.invoke('archive:compress', { files, outputPath, options }),

    extract: (archivePath: string, destination: string, options?: ExtractOptions) =>
      ipcRenderer.invoke('archive:extract', { archivePath, destination, options }),

    list: (archivePath: string) => ipcRenderer.invoke('archive:list', { archivePath }),
  },

  // 雜湊
  hash: {
    calculate: (filePath: string, algorithm: HashAlgorithm) =>
      ipcRenderer.invoke('hash:calculate', { filePath, algorithm }),
  },

  // 設定
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    set: (settings: Partial<Settings>) => ipcRenderer.invoke('settings:set', { settings }),
  },

  // 視窗控制
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
  },
};

contextBridge.exposeInMainWorld('api', api);

// 類型宣告
declare global {
  interface Window {
    api: typeof api;
  }
}
```

---

# 九、UI/UX 規範

## 9.1 設計原則

```
1. 效率優先
   - 最少點擊完成任務
   - 快捷鍵覆蓋所有常用操作
   - 雙面板減少目錄切換

2. 資訊清晰
   - 檔案類型一目了然 (顏色/圖示)
   - 狀態即時回饋
   - 錯誤訊息明確

3. 一致性
   - 統一的操作邏輯
   - 統一的視覺語言
   - 跨平台體驗一致

4. 可自訂
   - 主題自訂
   - 快捷鍵自訂
   - 佈局自訂
```

## 9.2 顏色規範

```css
/* 深色主題 */
:root[data-theme='dark'] {
  /* 基礎色 */
  --color-bg-base: #0a0a0a;
  --color-bg-elevated: #141414;
  --color-bg-overlay: #1f1f1f;

  /* 互動色 */
  --color-bg-hover: rgba(255, 255, 255, 0.05);
  --color-bg-active: rgba(255, 255, 255, 0.1);
  --color-bg-selected: rgba(59, 130, 246, 0.3);
  --color-bg-marked: rgba(250, 204, 21, 0.2);

  /* 文字色 */
  --color-text-primary: #f5f5f5;
  --color-text-secondary: #a3a3a3;
  --color-text-muted: #737373;
  --color-text-disabled: #525252;

  /* 邊框色 */
  --color-border-default: #2e2e2e;
  --color-border-focus: #3b82f6;

  /* 強調色 */
  --color-accent-primary: #3b82f6;
  --color-accent-secondary: #8b5cf6;

  /* 語意色 */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-info: #06b6d4;

  /* 檔案類型色 */
  --color-file-folder: #facc15;
  --color-file-executable: #22c55e;
  --color-file-archive: #ef4444;
  --color-file-image: #a855f7;
  --color-file-video: #f97316;
  --color-file-audio: #ec4899;
  --color-file-document: #3b82f6;
  --color-file-code: #14b8a6;
  --color-file-default: #e5e5e5;
}

/* 淺色主題 */
:root[data-theme='light'] {
  --color-bg-base: #ffffff;
  --color-bg-elevated: #f5f5f5;
  --color-bg-overlay: #e5e5e5;

  --color-bg-hover: rgba(0, 0, 0, 0.05);
  --color-bg-active: rgba(0, 0, 0, 0.1);
  --color-bg-selected: rgba(59, 130, 246, 0.2);
  --color-bg-marked: rgba(250, 204, 21, 0.3);

  --color-text-primary: #171717;
  --color-text-secondary: #525252;
  --color-text-muted: #737373;
  --color-text-disabled: #a3a3a3;

  --color-border-default: #e5e5e5;
  --color-border-focus: #3b82f6;

  /* 檔案類型色 (淺色主題調整) */
  --color-file-folder: #ca8a04;
  --color-file-executable: #16a34a;
  --color-file-archive: #dc2626;
  --color-file-image: #9333ea;
  --color-file-video: #ea580c;
  --color-file-audio: #db2777;
  --color-file-document: #2563eb;
  --color-file-code: #0d9488;
  --color-file-default: #404040;
}
```

## 9.3 間距與尺寸

```css
:root {
  /* 間距 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 24px;
  --spacing-2xl: 32px;

  /* 圓角 */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-full: 9999px;

  /* 字體大小 */
  --font-xs: 11px;
  --font-sm: 12px;
  --font-md: 13px;
  --font-lg: 14px;
  --font-xl: 16px;

  /* 行高 */
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;

  /* 固定尺寸 */
  --header-height: 40px;
  --toolbar-height: 36px;
  --statusbar-height: 24px;
  --tabbar-height: 32px;
  --file-item-height: 24px;
  --scrollbar-width: 10px;
}
```

## 9.4 組件規範

### 按鈕

```
尺寸：
- sm: height 28px, padding 0 12px, font 12px
- md: height 32px, padding 0 16px, font 13px
- lg: height 36px, padding 0 20px, font 14px

變體：
- primary: 主要操作，藍色填滿
- secondary: 次要操作，灰色填滿
- ghost: 幽靈按鈕，透明背景
- danger: 危險操作，紅色填滿

狀態：
- default: 預設狀態
- hover: 滑鼠懸停
- active: 按下狀態
- disabled: 禁用狀態
- loading: 載入中
```

### 輸入框

```
尺寸：
- sm: height 28px
- md: height 32px
- lg: height 36px

狀態：
- default: 預設邊框
- focus: 藍色邊框
- error: 紅色邊框
- disabled: 灰色背景
```

### 檔案項目

```
高度: 24px
左側 padding: 8px
圖示大小: 16px
圖示與文字間距: 8px

狀態樣式：
- hover: 背景 var(--color-bg-hover)
- selected: 背景 var(--color-bg-selected)
- marked: 背景 var(--color-bg-marked)
- focused: 邊框 1px solid var(--color-border-focus)
```

## 9.5 動畫規範

```css
:root {
  /* 時間 */
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;

  /* 緩動函數 */
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* 常用動畫 */
.transition-colors {
  transition:
    background-color var(--duration-fast) var(--ease-default),
    border-color var(--duration-fast) var(--ease-default),
    color var(--duration-fast) var(--ease-default);
}

.transition-transform {
  transition: transform var(--duration-normal) var(--ease-default);
}

.transition-opacity {
  transition: opacity var(--duration-normal) var(--ease-default);
}
```

---

# 十、測試計畫

## 10.1 測試策略

```
測試金字塔：
├── E2E 測試 (10%)
│   └── 關鍵使用者流程
├── 整合測試 (30%)
│   └── 組件互動、IPC 通訊
└── 單元測試 (60%)
    └── 工具函數、Store、Service
```

## 10.2 單元測試案例

```typescript
// format-utils.test.ts
describe('formatFileSize', () => {
  test('should format bytes', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(500)).toBe('500 B');
  });

  test('should format kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1.00 KB');
    expect(formatFileSize(1536)).toBe('1.50 KB');
  });

  test('should format megabytes', () => {
    expect(formatFileSize(1048576)).toBe('1.00 MB');
    expect(formatFileSize(1572864)).toBe('1.50 MB');
  });

  test('should format gigabytes', () => {
    expect(formatFileSize(1073741824)).toBe('1.00 GB');
  });

  test('should format terabytes', () => {
    expect(formatFileSize(1099511627776)).toBe('1.00 TB');
  });
});

// selection-store.test.ts
describe('SelectionStore', () => {
  beforeEach(() => {
    useSelectionStore.getState().clearSelection('left');
  });

  test('should select single item', () => {
    const { select, selectedItems } = useSelectionStore.getState();
    select('left', '/path/to/file.txt');
    expect(selectedItems.left.has('/path/to/file.txt')).toBe(true);
  });

  test('should toggle selection', () => {
    const { toggleSelect, selectedItems } = useSelectionStore.getState();
    toggleSelect('left', '/path/to/file.txt');
    expect(selectedItems.left.has('/path/to/file.txt')).toBe(true);
    toggleSelect('left', '/path/to/file.txt');
    expect(selectedItems.left.has('/path/to/file.txt')).toBe(false);
  });

  test('should mark and unmark', () => {
    const { toggleMark, markedItems } = useSelectionStore.getState();
    toggleMark('left', '/path/to/file.txt');
    expect(markedItems.left.has('/path/to/file.txt')).toBe(true);
  });

  test('should invert marks', () => {
    const items = ['/a.txt', '/b.txt', '/c.txt'];
    const { toggleMark, invertMarks, markedItems } = useSelectionStore.getState();
    toggleMark('left', '/a.txt');
    invertMarks('left', items);
    expect(markedItems.left.has('/a.txt')).toBe(false);
    expect(markedItems.left.has('/b.txt')).toBe(true);
    expect(markedItems.left.has('/c.txt')).toBe(true);
  });
});

// file-service.test.ts
describe('FileService', () => {
  test('should read directory', async () => {
    const files = await fileService.readDirectory('/test-dir');
    expect(Array.isArray(files)).toBe(true);
    expect(files[0]).toHaveProperty('name');
    expect(files[0]).toHaveProperty('path');
    expect(files[0]).toHaveProperty('size');
  });

  test('should handle non-existent directory', async () => {
    await expect(fileService.readDirectory('/non-existent')).rejects.toThrow();
  });

  test('should copy file', async () => {
    const result = await fileService.copy(['/source/file.txt'], '/destination');
    expect(result.success).toBe(true);
    expect(result.copied).toBe(1);
  });
});
```

## 10.3 E2E 測試案例

```typescript
// e2e/basic-operations.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Basic Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="file-list"]');
  });

  test('should display file list', async ({ page }) => {
    const fileList = page.locator('[data-testid="file-list"]');
    await expect(fileList).toBeVisible();

    const items = page.locator('[data-testid="file-item"]');
    expect(await items.count()).toBeGreaterThan(0);
  });

  test('should navigate into directory', async ({ page }) => {
    const directory = page.locator('[data-testid="file-item"][data-is-directory="true"]').first();
    await directory.dblclick();

    await page.waitForTimeout(500);
    const pathBar = page.locator('[data-testid="path-bar"]');
    const newPath = await pathBar.textContent();
    expect(newPath).not.toBe('/');
  });

  test('should select file with click', async ({ page }) => {
    const fileItem = page.locator('[data-testid="file-item"]').first();
    await fileItem.click();

    await expect(fileItem).toHaveAttribute('data-selected', 'true');
  });

  test('should mark file with space key', async ({ page }) => {
    const fileItem = page.locator('[data-testid="file-item"]').first();
    await fileItem.click();
    await page.keyboard.press('Space');

    await expect(fileItem).toHaveAttribute('data-marked', 'true');
  });

  test('should copy file with C key', async ({ page }) => {
    // 選取檔案
    const fileItem = page.locator('[data-testid="file-item"]').first();
    await fileItem.click();

    // 按 C 鍵
    await page.keyboard.press('c');

    // 確認進度對話框出現
    const progressDialog = page.locator('[data-testid="progress-dialog"]');
    await expect(progressDialog).toBeVisible();
  });

  test('should switch panels with Tab', async ({ page }) => {
    const leftPanel = page.locator('[data-testid="left-panel"]');
    const rightPanel = page.locator('[data-testid="right-panel"]');

    await leftPanel.click();
    await expect(leftPanel).toHaveAttribute('data-active', 'true');

    await page.keyboard.press('Tab');
    await expect(rightPanel).toHaveAttribute('data-active', 'true');
  });

  test('should toggle theme', async ({ page }) => {
    const themeButton = page.locator('[data-testid="theme-toggle"]');
    const html = page.locator('html');

    await expect(html).toHaveAttribute('data-theme', 'dark');

    await themeButton.click();
    await expect(html).toHaveAttribute('data-theme', 'light');
  });
});
```

## 10.4 測試覆蓋率目標

```
覆蓋率目標：
├── 整體: >= 70%
├── 核心模組:
│   ├── stores/: >= 80%
│   ├── services/: >= 80%
│   └── utils/: >= 90%
└── UI 組件: >= 60%
```

---

# 十一、部署與發布

## 11.1 版本號規範

```
語意化版本: MAJOR.MINOR.PATCH

MAJOR: 不相容的 API 變更
MINOR: 向下相容的功能新增
PATCH: 向下相容的問題修復

範例:
- 1.0.0: MVP 發布
- 1.1.0: 新增分頁功能
- 1.1.1: 修復複製檔案 bug
- 2.0.0: 重大架構變更
```

## 11.2 發布流程

```
1. 開發完成
   □ 功能開發完成
   □ 代碼審查通過
   □ 測試通過

2. 版本準備
   □ 更新版本號 (package.json)
   □ 更新 CHANGELOG.md
   □ 建立 release branch

3. 建置
   □ pnpm run build:all
   □ 測試安裝檔
   □ 掃描惡意軟體

4. 發布
   □ 建立 GitHub Release
   □ 上傳安裝檔
   □ 更新下載頁面

5. 後續
   □ 監控錯誤回報
   □ 收集使用者回饋
   □ 規劃下一版本
```

## 11.3 CI/CD Pipeline

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]

    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run tests
        run: pnpm test

      - name: Build
        run: pnpm run build
        env:
          GH_TOKEN: ${{ secrets.GH_TOKEN }}

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: release-${{ matrix.os }}
          path: dist/*

  release:
    needs: build
    runs-on: ubuntu-latest

    steps:
      - name: Download artifacts
        uses: actions/download-artifact@v4

      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            release-windows-latest/*
            release-macos-latest/*
            release-ubuntu-latest/*
```

## 11.4 自動更新

```typescript
// 主進程 - 自動更新設定
import { autoUpdater } from 'electron-updater';

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

autoUpdater.on('update-available', (info) => {
  mainWindow.webContents.send('update:available', info);
});

autoUpdater.on('update-downloaded', (info) => {
  mainWindow.webContents.send('update:downloaded', info);
});

// 檢查更新
ipcMain.handle('update:check', async () => {
  return autoUpdater.checkForUpdates();
});

// 下載更新
ipcMain.handle('update:download', async () => {
  return autoUpdater.downloadUpdate();
});

// 安裝更新
ipcMain.handle('update:install', () => {
  autoUpdater.quitAndInstall();
});
```

---

# 十二、附錄

## 12.1 快捷鍵完整對照表

| 快捷鍵         | 功能             | 階段    |
| -------------- | ---------------- | ------- |
| **檔案操作**   |                  |         |
| C              | 複製             | MVP     |
| M              | 移動             | MVP     |
| D              | 刪除             | MVP     |
| R              | 重新命名         | MVP     |
| Enter          | 開啟/進入        | MVP     |
| Backspace      | 返回上層         | MVP     |
| F3             | 新增資料夾       | MVP     |
| F5             | 重新整理         | MVP     |
| F2             | 重新命名 (alt)   | MVP     |
| Delete         | 刪除 (alt)       | MVP     |
| **標記操作**   |                  |         |
| Space          | 標記/取消        | MVP     |
| T              | 標記全部         | MVP     |
| U              | 取消全部標記     | MVP     |
| \*             | 反轉標記         | MVP     |
| +              | 批次標記         | Phase 2 |
| -              | 批次取消標記     | Phase 2 |
| **導航**       |                  |         |
| ↑↓             | 上下移動         | MVP     |
| ←→             | 展開/收合 (樹狀) | Phase 2 |
| Home           | 移至頂部         | MVP     |
| End            | 移至底部         | MVP     |
| PageUp/Down    | 翻頁             | MVP     |
| Tab            | 切換面板         | MVP     |
| \              | 到根目錄         | MVP     |
| **選取**       |                  |         |
| Ctrl+A         | 全選             | MVP     |
| Ctrl+Click     | 多選             | MVP     |
| Shift+Click    | 範圍選取         | MVP     |
| Ctrl+↑↓        | 移動焦點         | MVP     |
| Shift+↑↓       | 擴展選取         | MVP     |
| **分頁**       |                  |         |
| Ctrl+T         | 新增分頁         | Phase 2 |
| Ctrl+W         | 關閉分頁         | Phase 2 |
| Ctrl+Tab       | 下一個分頁       | Phase 2 |
| Ctrl+Shift+Tab | 上一個分頁       | Phase 2 |
| Ctrl+1~9       | 跳至第 N 分頁    | Phase 2 |
| **其他**       |                  |         |
| F              | 搜尋             | MVP     |
| Ctrl+F         | 搜尋 (alt)       | MVP     |
| Alt+P          | 切換預覽         | Phase 2 |
| Alt+Z          | 壓縮             | Phase 2 |
| Ctrl+H         | 顯示隱藏檔案     | MVP     |
| F11            | 全螢幕           | MVP     |
| Ctrl+,         | 設定             | MVP     |
| Ctrl+`         | 終端機           | Phase 3 |

## 12.2 支援的檔案類型圖示

| 類型   | 副檔名                               | 顏色 |
| ------ | ------------------------------------ | ---- |
| 資料夾 | (directory)                          | 黃色 |
| 執行檔 | .exe, .bat, .cmd, .sh, .app          | 綠色 |
| 壓縮檔 | .zip, .rar, .7z, .tar, .gz           | 紅色 |
| 圖片   | .jpg, .png, .gif, .svg, .webp, .ico  | 紫色 |
| 影片   | .mp4, .avi, .mkv, .mov, .wmv         | 橙色 |
| 音訊   | .mp3, .wav, .flac, .aac, .ogg        | 粉色 |
| 文件   | .pdf, .doc, .docx, .xls, .xlsx, .ppt | 藍色 |
| 程式碼 | .js, .ts, .py, .java, .cpp, .go, .rs | 青色 |
| 文字   | .txt, .md, .json, .xml, .yaml        | 灰色 |
| 其他   | \*                                   | 白色 |

## 12.3 錯誤代碼對照

| 代碼                  | 說明         | 處理建議           |
| --------------------- | ------------ | ------------------ |
| ERR_PATH_NOT_FOUND    | 路徑不存在   | 檢查路徑是否正確   |
| ERR_PERMISSION_DENIED | 權限不足     | 以管理員身份執行   |
| ERR_FILE_EXISTS       | 檔案已存在   | 選擇覆蓋或重新命名 |
| ERR_FILE_IN_USE       | 檔案被佔用   | 關閉佔用程式       |
| ERR_DISK_FULL         | 磁碟空間不足 | 清理磁碟空間       |
| ERR_INVALID_NAME      | 無效的檔名   | 移除非法字元       |
| ERR_PATH_TOO_LONG     | 路徑過長     | 縮短路徑長度       |
| ERR_NETWORK_ERROR     | 網路錯誤     | 檢查網路連線       |
| ERR_ARCHIVE_CORRUPTED | 壓縮檔損壞   | 重新下載或修復     |
| ERR_PASSWORD_REQUIRED | 需要密碼     | 輸入正確密碼       |

---

# 十三、里程碑總結

| 里程碑   | 目標日期 | 主要功能             | 狀態 |
| -------- | -------- | -------------------- | ---- |
| M1: MVP  | Week 6   | 基本檔案管理         | 🔲   |
| M2: Beta | Week 14  | 分頁、書籤、壓縮     | 🔲   |
| M3: RC   | Week 26  | 雲端、同步、進階搜尋 | 🔲   |
| M4: 1.0  | Week 30  | 穩定版發布           | 🔲   |
| M5: 2.0  | TBD      | 外掛系統、企業版     | 🔲   |

---

_文件版本: 1.0_  
_建立日期: 2025-12-31_  
_最後更新: 2025-12-31_
