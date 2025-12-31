---
name: wincv_release_packaging_phase1
description: "依 Roadmap 建立 electron-builder.yml、圖示、以及 GitHub Actions release.yml"
agent: agent
---

參考：
- ../../WinCV_Development_Roadmap.md（electron-builder.yml 範本、Windows/macOS/Linux target、workflows/release.yml）
- ../../docs/progress.md

規則：
- 只做下一個 packaging/release 任務。
- 產出必須能在 CI 跑起來（至少語法正確、能 build）。

完成後：
- 說明如何打 tag 觸發 release
- 更新 progress
