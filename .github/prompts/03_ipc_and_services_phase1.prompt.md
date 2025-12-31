---
name: wincv_ipc_services_phase1
description: "依 Roadmap 的 main/preload/ipc/service 清單逐項完成（readDirectory/getInfo/getDrives/copy/move/delete/rename/createDirectory 等）"
agent: agent
---

請依序參考：
- ../../WinCV_Development_Roadmap.md（Phase 1 MVP 的 Week 1~3、以及 API 章節的 IPC channels、request/response types）
- ../../WinCV_Specification.md（Copy/Move/Delete/Rename 等行為與按鍵語意，作為 UX/行為驗收參考）
- ../../docs/progress.md

規則：
- 僅實作 progress 下一個 IPC/Service 任務。
- IPC channels、types、preload expose API 的命名與內容以 Roadmap 的列表為準（包含 progress events）。 
- 若 Specification 與 Roadmap 行為不一致：寫入 docs/decisions.md 並停止。

每次輸出：
- 改了哪些檔案（例如 src/main/ipc/*.ts、src/main/services/*.ts、src/preload.ts、src/shared/types.ts）
- 如何手動測試（或 unit test）
- 更新 progress 勾選