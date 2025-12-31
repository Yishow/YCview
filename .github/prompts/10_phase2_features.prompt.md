---
name: wincv_phase2_features
description: "Phase 2 功能：Tabs/Bookmarks/批次改名/壓縮解壓/預覽/MD5-SHA（一次只做一個子功能）"
agent: agent
---

參考：
- ../../WinCV_Development_Roadmap.md（Phase 2 各 Week 的功能描述、types/interfaces、對話框元件）
- ../../WinCV_Feature_Analysis.md（Phase 2 應包含的能力對照）
- ../../WinCV_Specification.md（hash/zip/unzip 等行為語意）
- ../../docs/progress.md

規則：
- 只完成 progress 下一個 Phase 2 子功能（例如 Tabs store 或 ArchiveService 的 list）。
- 任何新 IPC channel / store / dialog 都要先對齊 Roadmap 的命名與介面。

完成後：
- 最小可用 UI/命令或測試
- 更新 progress 並停下
