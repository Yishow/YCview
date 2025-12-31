---
name: wincv_ui_shell_phase1
description: "依 Roadmap 的 UI 結構（MainLayout/Header/Toolbar/StatusBar/SplitPane/Panel）逐步完成"
agent: agent
---

參考：
- ../../WinCV_Development_Roadmap.md（Phase 1 Week 2 的元件清單、props 介面、toolbarButtons、FileItem 顏色規則等）
- ../../WinCV_Specification.md（兩欄檔案管理、快捷鍵語意、顏色/主題概念作為 UX 參考）
- ../../docs/progress.md

規則：
- 只做 progress 下一個 UI 任務（例如先 MainLayout 再 Header，再 Toolbar...）。
- 元件檔名、props、資料流（Zustand stores）以 Roadmap 的建議為準。
- 只要完成「可渲染且可驗收」的最小 UI，不要一次把所有功能塞滿。

完成後：
- 提供手動驗收步驟（能看到 layout/按鈕/列表/hover/選取狀態等）
- 更新 progress 勾選