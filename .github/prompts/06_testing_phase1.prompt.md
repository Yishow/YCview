---
name: wincv_testing_phase1
description: '依 Roadmap 建立 Vitest 單元測試與 Playwright E2E（含 theme toggle 範例）'
agent: agent
---

參考：

- ../../WinCV_Development_Roadmap.md（Vitest 測試檔建議、Playwright E2E 驗收例、CI test.yml）
- ../../docs/progress.md

規則：

- 只做下一個測試相關任務。
- 測試要對應 progress 的驗收標準（例如 format-utils、sort-utils、settings-store、theme toggle）。

完成後：

- 提供 pnpm scripts（或 package.json 變更）
- 本地如何跑：unit / e2e
- 更新 progress
