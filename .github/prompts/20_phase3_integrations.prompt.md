---
name: wincv_phase3_integrations
description: "Phase 3 整合：Google Drive/OneDrive/Dropbox、Sync、Search、Terminal(xterm.js)、Git"
agent: agent
---

參考：
- ../../WinCV_Development_Roadmap.md（Phase 3 provider 介面、OAuth/API、Sync/Search/Terminal/Git 章節）
- ../../WinCV_Feature_Analysis.md（雲端/Git/Terminal 對照）
- ../../docs/progress.md

規則：
- 只做 progress 下一個整合任務。
- 牽涉 OAuth/Secrets 的地方必須先寫入 docs/decisions.md 詢問如何管理金鑰（本機 .env / keychain / GitHub secrets）。

完成後：
- 最小端到端 demo（例如 provider authenticate stub + listFiles mock）
- 更新 progress
