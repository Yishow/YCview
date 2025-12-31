---
name: wincv_scaffold_phase1
description: "只在你允許時，用 Roadmap Phase 1 的 1.1.x 建立 repo/工具鏈骨架"
agent: agent
---

前置：確認 docs/progress.md 已存在且 Phase 1 MVP 的 Week 1 任務已拆好。

請只處理下列類型的任務（若 progress 下一項不是此類型就不要做）：
- Git 初始化、branch/PR template、issue template、.gitignore
- npm init、Electron+React+TS+Vite 骨架
- ESLint/Prettier/Husky/lint-staged

所有檔名/位置以 Roadmap 建議為準（例如 workflows build.yml/test.yml/release.yml、src/main、src/renderer、src/shared 等）。

完成後：
- 必須能跑：npm test / npm run build（依 Roadmap 的規劃調整）
- 更新 docs/progress.md 勾選並填入驗收指令
- 停下等待我確認