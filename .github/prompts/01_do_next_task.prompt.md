---
name: wincv_do_next_task
description: "只做 progress.md 下一個未完成項目；完成後更新 progress 並停下"
agent: agent
---

請打開並遵守：
- ../../docs/progress.md
- ../../docs/decisions.md
- ../../WinCV_Development_Roadmap.md
- ../../WinCV_Specification.md
- ../../WinCV_Feature_Analysis.md

規則（硬性）：
- 只允許處理 docs/progress.md 中「下一個未勾選」的項目（依檔案順序）。
- 若該項目需要資訊但文件沒有：把問題寫入 docs/decisions.md，並停止等待我回覆。
- 不可順手多做「看起來相關」的其他項目。

執行流程：
1) 先回報：本次要做的 checkbox 原文、預期修改檔案清單、驗收方式。
2) 實作最小改動（只達成本項驗收）。
3) 執行/提供驗收（npm scripts、Vitest、Playwright 或手動步驟）。
4) 更新 docs/progress.md：勾選本項，並在該項下方附上「驗收結果」與指令。
5) 停下並問我是否進行下一項。