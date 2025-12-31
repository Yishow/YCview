---
name: wincv_state_shortcuts_phase1
description: "依 Roadmap 的 Zustand stores、選取/標記、快捷鍵、theme/settings 實作"
agent: agent
---

參考：
- ../../WinCV_Development_Roadmap.md（Selection store、KeyboardShortcuts hook、Settings store、theme tokens、electron-store 等）
- ../../WinCV_Specification.md（標記 Tag all / Untag all、按鍵表、trash bin 等行為語意）
- ../../docs/progress.md

規則：
- 僅完成下一個未勾選 store/hook/settings/theme 任務。
- 快捷鍵集合與行為優先採 Roadmap MVP 列表；若 Specification 有更多鍵，先記到 docs/decisions.md 或放到 Phase 2+ 任務。

輸出：
- 本次新增/修改的 store/hook 檔案
- 驗收方式（包含至少一個快捷鍵可用的手動步驟）
- progress 勾選
