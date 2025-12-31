# 待確認清單

1. CRC32/SFV 是否保留：功能分析建議移除，但規格書仍列出 CRC32/SFV；需決定 Phase 2/3 的 HashService 與 UI 是否僅支援 MD5/SHA（影響測試案例與介面文案）。  
2. 雲端整合優先順序：Phase 3 規劃同時支援 Google Drive/OneDrive/Dropbox，需確認首波目標與 OAuth 流程優先順序，以避免過度並行實作與測試負擔。  
3. 終端機與 Git 整合範圍：Phase 3 計畫導入 xterm.js 與 Git 狀態顯示，需確認是否必須跨平台支援（Windows/macOS/Linux）及是否允許僅讀取狀態、不提供提交操作，以評估依賴與安全風險。  
4. 自訂主題與多語系交付順序：Phase 3 的主題編輯器與 i18n 列於同一週期，需確認兩者可否拆批發布，避免 UI 字串凍結時間與翻譯流程互相阻塞。
