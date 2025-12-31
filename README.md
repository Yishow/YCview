# YCview

一個基於 Electron + React + TypeScript + Vite 的桌面應用範本（WinCV modern）。

## 專案指令手冊 (Command Guide)

本專案統一使用 `pnpm` 進行管理，所有指令皆以 `pnpm <指令名>` 執行。以下為詳細分類說明：

### 🛠️ 開發環境 (Development)

最常用的日常開發指令。

| 指令                    | 說明                            | 備註                                                                   |
| :---------------------- | :------------------------------ | :--------------------------------------------------------------------- |
| `pnpm dev`              | **[✨推薦]** 同時啟動前端與後端 | 一鍵啟動。會自動檢查並釋放 5173 埠，接著同時執行 Vite 與 Electron。    |
| `pnpm run predev`       | 強制釋放開發埠口                | 自動執行 `kill-port 5173`。通常不需要手動執行，`pnpm dev` 會自動呼叫。 |
| `pnpm run dev:renderer` | 僅啟動前端 (Vite)               | 於 `http://localhost:5173` 啟動。適合只想調試 UI/CSS 時使用。          |
| `pnpm run dev:electron` | 僅啟動後端 (Electron)           | 需先確保前端服務已在 5173 埠運行，否則會持續等待。                     |

### 📦 建置與發布 (Build & Release)

用於產生可執行檔或發布新版本。

| 指令                 | 說明                  | 備註                                                                      |
| :------------------- | :-------------------- | :------------------------------------------------------------------------ |
| `pnpm run build`     | 建置安裝檔            | 執行型別檢查 -> 建置前端 -> 打包成安裝檔 (如 .exe)。                      |
| `pnpm run build:dir` | 建置免安裝目錄        | **[⚡快速測試]** 打包成資料夾而非安裝檔，建置速度較快，適合測試打包結果。 |
| `pnpm run release`   | 發布新版本            | 自動升級版本號、產生 Changelog、建立 Git Tag。需配合 Git Push 觸發 CI。   |
| `pnpm run commit`    | **[✨推薦]** 提交代碼 | 啟動互動式介面，協助撰寫符合 Conventional Commits 規範的訊息。            |

### 🔍 品質保證 (Quality Assurance)

確保程式碼品質與風格一致。

| 指令                  | 說明                | 備註                                            |
| :-------------------- | :------------------ | :---------------------------------------------- |
| `pnpm run type-check` | TypeScript 型別檢查 | 檢查專案中是否有型別錯誤 (不會產出檔案)。       |
| `pnpm run lint`       | ESLint 靜態分析     | 掃描並報告程式碼潛在問題。                      |
| `pnpm run format`     | Prettier 格式化     | 自動排版所有支援的檔案 (ts, css, json, md...)。 |

### 🔧 工具與維護 (Utility)

專案維護與環境設定。

| 指令               | 說明                  | 備註                                                                      |
| :----------------- | :-------------------- | :------------------------------------------------------------------------ |
| `pnpm run clean`   | **[🧹清理]** 深度清潔 | 刪除 `node_modules`、`dist`、`release`。遇到依賴衝突或奇怪 bug 時的神器。 |
| `pnpm run prepare` | 初始化 Git Hooks      | 安裝依賴時會自動執行，設定 Husky 攔截器。                                 |

### 🚀 自動化發布 (Release)

本專案已設定 GitHub Actions 自動發布流程：

1. 本機執行 `pnpm run release`，這會自動：
   - 根據 Commit 訊息更新版本號 (major/minor/patch)
   - 產生或更新 `CHANGELOG.md`
   - 建立 git commit 和 git tag
2. 將變更推送至遠端：`git push --follow-tags origin main`
3. GitHub Actions 會偵測到新的 tag，自動觸發建置流程，打包 Windows/macOS 安裝檔並發布 Release。

```bash
# 完整發布流程範例
git checkout main
git pull
pnpm run release
git push --follow-tags origin main
```

---

## 貢獻指南 (Contributing)

感謝你想為本專案貢獻！以下是快速上手與 PR 建議：

- 建議流程：Fork -> 新增 branch（命名建議 `feature/<短描述>` 或 `fix/<短描述>`）-> 開發 -> 先在本機跑 `pnpm run lint`、`pnpm test` -> 發 PR 並在描述中加入變更重點與驗收步驟。
- 在 PR checklist 中請確認：已執行 `pnpm run lint`、`pnpm run test`、並更新相關文件（若有）。PR 範本內已包含這兩項檢查。
- Commit message：請用繁體中文描述變更並在完成 Roadmap 任務時包含 progress ID（例如：完成 P1-W01-D01-REPO-PackageManager-T03）。
- Pre-commit：本專案使用 Husky + lint-staged，自動執行格式化與 lint，請確保 commit 前修正 lint/格式問題。

---

## OS 注意事項（Windows / macOS）

- Windows 🔧
  - 建議使用 PowerShell 或 Windows Terminal 開發，若遇到長路徑問題請啟用 `git config --system core.longpaths true`。
  - 若專案新增需要編譯原生套件（node-gyp），請先安裝適當的 Build Tools（Windows-build-tools 或 Visual Studio 的 C++ 工具）。
  - 若 watcher 無法正確偵測檔案變更，可嘗試在 `pnpm run dev` 的 terminal 使用 `--watch` 的替代方式或調整 Vite/Electron 的設定。

- macOS 🍎
  - 請安裝 Xcode Command Line Tools：`xcode-select --install`。
  - Apple Silicon (M1/M2) 使用者：請確認 Node 與 native module 對 Apple Silicon 的相容性（必要時可使用 Homebrew 安裝 arm64 的依賴）。
  - 打包與簽名：若要在 macOS 上打包或上架，需要 macOS Keychain／簽名憑證與 notarization，確保在 CI/本機中有對應的秘密（例如：APPLE_CERT、GH_TOKEN 等）。

---

如需我把 CI workflow 進一步拆分/優化或新增更多平台的注意事項，我可以繼續協助。
