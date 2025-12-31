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

若需我把 Workflow 再進一步拆分為 lint/test/build 三個獨立 job（以便並行執行與更精細的快取），我可以替你調整。
