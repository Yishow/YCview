---
name: wincv_bootstrap_index
description: "讀三份文件，建立 progress/architecture/decisions；progress 必須可追蹤、可排序、可擴充，支援 Day 內拆 3–8 個原子任務，且 SCOPE 使用 PascalCase"
agent: agent
---

請依序完整閱讀並引用（不可跳過）：
- ../../WinCV_Development_Roadmap.md
- ../../WinCV_Specification.md
- ../../WinCV_Feature_Analysis.md

硬性規則：
- 只做「規劃與初始化文件」，禁止開始建立程式專案或寫任何功能碼。
- 以 WinCV_Development_Roadmap.md 的 Phase/Week/Day 作為唯一施工順序主幹（progress 需依此排序）。 
- docs/progress.md 的 checkbox ID 必須遵守下列規格（不得自行更改格式）。

## Checkbox ID 規格（必須寫進 progress.md 最上方）
格式：P{p}-W{ww}-D{dd}-{AREA}-{SCOPE}-T{xx}

- p: 1..4（Phase）
- ww: 01..30（兩位數，確保字串排序）
- dd: 01..05（兩位數，確保字串排序）
- AREA: 僅允許以下固定值（全大寫）：
  REPO | BOOT | IPC | PRELOAD | SVC | UI | STORE | HOOK | UTIL | TEST | CI | BUILD | DOC
- SCOPE: 必須使用 PascalCase（例如 FileList、FileService、SelectionStore、SettingsDialog、ElectronBuilder）
- xx: 01..08（同一 Day、同一 AREA+SCOPE，最多 8 個原子任務）

### SCOPE PascalCase 規則（必須遵守）
- 一律 PascalCase，不可用 kebab-case、snake_case、全小寫。
- 若 Roadmap 檔名是 kebab-case（例如 file-service.ts、selection-store.ts）：
  - 轉成 FileService、SelectionStore
- 若是縮寫（IPC/URL/API/MD5/SHA/CI/E2E）：
  - 優先採 Roadmap/TypeScript 常見風格：IpcClient、PreloadApi、HashService、E2eBasicOperations（或 E2ETests 以一致為準）
  - 同一個縮寫在整份 progress 必須一致（例如一律用 PreloadApi，不可混用 PreloadAPI/PreloadApi）
- 若是複合詞：
  - 依語意切詞再 PascalCase（例如 BasicOperations -> BasicOperations）
  
### 縮寫/首字母縮略詞（Acronyms）規則（必須遵守）
- 縮寫一律「視為一般單字」處理：只大寫首字母，其餘小寫（提高可讀性）。
  - 例如：Api、Ipc、E2e、Url、Id、Html、Css、Json
- 因此在 PascalCase 的 SCOPE 內，固定使用以下偏好（不得混用）：
  - Ipc（不要 IPC）
  - Api（不要 API）
  - E2e（不要 E2E）
- 範例（✅）：
  - PreloadApi、IpcClient、FileOperationsIpc、E2eBasicOperations、ReleaseWorkflow
- 範例（❌）：
  - PreloadAPI、IPCClient、E2EBasicOperations

### 建議 SCOPE（參考 Roadmap，可用於命名一致性）
- UI: MainLayout, Header, Toolbar, StatusBar, SplitPane, FilePanel, PathBar, FileList, FileItem,
      PreviewPanel, SettingsDialog, ConfirmDialog, RenameDialog, CreateFolderDialog, ProgressDialog,
      ContextMenu, Tooltip, Button, Input, FileIcons
- SVC: FileService, WatchService, ArchiveService, HashService, SearchService
- IPC: IpcIndex, FileOperationsIpc, SettingsIpc, SystemInfoIpc
- PRELOAD: PreloadApi
- STORE: FileStore, PanelStore, SelectionStore, SettingsStore, UiStore, TabStore
- HOOK: UseFileOperations, UseSelection, UseKeyboardShortcuts, UseFileWatch, UseSettings
- TEST: VitestUnit, PlaywrightE2e, BasicOperationsE2e（或 E2eBasicOperations，擇一但要全程一致）
- CI: BuildWorkflow, TestWorkflow, ReleaseWorkflow
- BUILD: ElectronBuilder, Packaging, Notarize

## Day 對應 Roadmap 的建議映射
（除非 Roadmap 明確拆成 5 天，否則用這個映射）
- D01 = Day 1-2
- D03 = Day 3-4
- D05 = Day 5

## Day 內拆分規則（必須遵守）
- 每個 Day（例如 P1-W02-D03）必須拆成 3–8 個原子任務（T01..T08）。
- 每個 checkbox 必須是「單一可驗收成果」：能 build / 能操作 / 有測試通過 / 有明確手動驗收步驟。
- 每個 checkbox 行尾都必須包含：
  1) 預期產物（檔案/資料夾或功能點）
  2) 驗收方式（npm scripts / Vitest / Playwright / 手動步驟）
- 不允許建立「超大任務」或「不可驗收任務」。

---

請建立/更新以下檔案（若不存在就建立）：

# 1) docs/architecture.md
內容必須包含（以 Roadmap 為主）：
- 技術棧與版本/工具（Electron + React 18 + TypeScript + Vite + Zustand + Tailwind + shadcn/ui 等）
- 專案資料夾/檔案藍圖（Roadmap 建議結構要完整列出：src/main、src/renderer、src/shared、tests、workflows...）
- 分層邏輯：main / preload / renderer / shared 的責任與依賴方向
- IPC 與 preload API 的整體設計摘要（Roadmap 有 IPC channels 與 types/interfaces）

# 2) docs/decisions.md
- 建立「待確認清單」章節
- 任何文件之間衝突、或規格未定義（例如快捷鍵/功能範圍、MVP 是否納入某些能力），都列成問題
- 不可自行假設答案；只能提出選項與影響

# 3) docs/progress.md
必須包含以下結構與內容：
A) 文件開頭先貼上「Checkbox ID 規格」全文（就是上面那段）
B) 依 Roadmap 建立 Phase 1~4 的章節，並以 Week 分組（W01..）
C) 每個 Week 下依 Roadmap 的 Day 分組（至少 D01/D03/D05；若 Roadmap 明確拆成 5 天則用 D01..D05）
D) 每個 Day 內建立 3–8 個 checkbox（T01..T08），任務需對齊 Roadmap 的條目與檔案清單（UI、IPC、services、stores、tests、CI、packaging 等）
E) 在 Phase 2/3/4 任務內，需用 Feature Analysis 與 Specification 補上「驗收點」對照（但仍以 Roadmap 的 Phase 順序為主）

輸出最後請附上：
1) 你建立的第一個可執行任務 ID（必須是 progress 中的第一個未勾選項）
2) 你建議接下來使用的 prompt（例如 wincv_do_next_task）
3) 等待我回覆「OK，開始」才進入實作
