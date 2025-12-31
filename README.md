# YCview

一個基於 Electron + React + TypeScript + Vite 的桌面應用範本（WinCV modern）。

## 套件管理

本專案採用 pnpm 作為套件管理工具，請使用 pnpm 執行下列開發步驟。

- 安裝依賴：

  pnpm install

- 開發（同時啟動 renderer 與 electron）：

  pnpm run dev

- 程式碼檢查：

  pnpm run lint

- 測試：

  pnpm test

- 建置：

  pnpm run build

---

## CI 範例說明

本專案包含一個 GitHub Actions 範例 workflow：`.github/workflows/ci.yml`，其要點如下：

- 使用 Node.js (v20)
- 使用 `pnpm/action-setup` 安裝 pnpm
- 使用 pnpm cache（`.pnpm-store`）以加速 CI
- 執行 `pnpm install --frozen-lockfile`、`pnpm run lint`、`pnpm test`、`pnpm run build`

你可以根據專案需要調整 node 版本、pnpm 版本或要執行的步驟。

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
