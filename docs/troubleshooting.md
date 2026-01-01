# 故障排除記錄

本文檔記錄專案開發過程中遇到的技術問題、調查過程和解決方案。

---

## [2026-01-01] Claude Code Ralph-Wiggum Plugin 權限錯誤

### ⚠️ 最新更新（2026-01-01 下午）

**重要發現：Plugin 設計與安全策略不兼容**

經過進一步測試，發現方案 A 和方案 B 都無法解決問題。根本原因是：

1. **ralph-loop.md 的 allowed-tools 聲明**（第 4 行）：

   ```yaml
   allowed-tools: ['Bash(${CLAUDE_PLUGIN_ROOT}/scripts/setup-ralph-loop.sh)']
   ```

   只允許 `setup-ralph-loop.sh` 腳本

2. **實際執行的代碼塊**（第 12-44 行）：

   ````bash
   ```!
   "${CLAUDE_PLUGIN_ROOT}/scripts/setup-ralph-loop.sh" $ARGUMENTS

   # Extract and display completion promise if set
   if [ -f .claude/ralph-loop.local.md ]; then
     PROMISE=$(...)
     if [ -n "$PROMISE" ] && [ "$PROMISE" != "null" ]; then
       echo "..."
       # ... 多行 echo 語句（共 30+ 行）
     fi
   fi
   ````

   ```
   包含了 **setup-ralph-loop.sh + 後續的多行 if/echo 語句**

   ```

3. **權限檢查失敗**：
   - 安全檢查器檢測到這個包含換行和多個命令的代碼塊
   - 即使添加了 `Skill(ralph-wiggum:ralph-loop)` 和 `Bash(*/ralph-wiggum/*/scripts/setup-ralph-loop.sh:*)` 仍然失敗
   - 原因：權限檢查針對的是**整個多行代碼塊**，而不僅僅是單個腳本調用

**當前狀態：** 已暫時採用方案 C（完全移除 permissions 限制）進行測試

**備份：** `.claude/settings.local.json.backup` 包含原始配置

**長期解決方案建議：**

- 向 Claude Code 團隊報告此問題（plugin 的多行 ```! 代碼塊與安全策略不兼容）
- 或修改 ralph-loop.md，將所有邏輯移入 `setup-ralph-loop.sh`
- 或在項目中保持 permissions 為空（如果安全風險可接受）

---

### 問題概述

**症狀：**
執行 `/ralph-wiggum:ralph-loop` skill 時持續失敗，出現以下錯誤：

````
Error: Bash command permission check failed for pattern "```!
...
```": Command contains newlines that could separate multiple commands
````

**影響範圍：**

- 無法使用 ralph-wiggum plugin 的 loop 功能
- 阻礙自動化迭代開發流程

### 問題發生經過

1. **初次嘗試（失敗）**

   ```bash
   /ralph-wiggum:ralph-loop @.github/copilot-instructions.md @.github/prompts/01_do_next_task.prompt.md
   完成一個文件裡的項目後，要做詳細的review後git commit，Output <promise>COMPLETE</promise> when done.
   --max-iterations 100 --completion-promise "COMPLETE"
   ```

   - 錯誤原因：命令中包含換行符號
   - 錯誤原因：`<promise>` 標籤中的 `<` 被誤判為 shell input redirection

2. **移除換行符號後（仍失敗）**
   ```bash
   /ralph-wiggum:ralph-loop @.github/copilot-instructions.md @.github/prompts/01_do_next_task.prompt.md 依照progress.md完成下一個項目並commit --max-iterations 100 --completion-promise "COMPLETE"
   ```

   - 同樣的錯誤持續出現
   - 表明問題不在用戶輸入，而在 plugin 內部執行機制

### 深入調查過程

#### 1. 配置文件定位

**發現的關鍵配置：**

- **全局設置**：`~/.claude/settings.json`
  - 啟用了 ralph-wiggum plugin
  - 配置了其他 hooks（WebSearch transformer, statusLine）

- **項目級權限設置**：`.claude/settings.local.json` ⭐
  - 包含嚴格的 `permissions.allow` 白名單
  - **這是問題根源**

#### 2. 權限白名單分析

**原始配置**（`.claude/settings.local.json`）：

```json
{
  "permissions": {
    "allow": [
      "Skill(frontend-design:frontend-design)",
      "Bash(netstat:*)",
      "Bash(findstr:*)",
      "Bash(tasklist:*)",
      "Bash(pnpm add:*)",
      "Bash(pnpm install)",
      "Bash(pnpm install:*)",
      "Bash(echo \"pnpm dlx commitlint --edit $1\")"
    ]
  }
}
```

**發現：** ralph-wiggum skill 不在白名單中

#### 3. Plugin 執行機制分析

**查看 ralph-wiggum plugin 結構：**

- `~/.claude/plugins/cache/claude-plugins-official/ralph-wiggum/6d3752c000e2/`
  - `scripts/setup-ralph-loop.sh` - 主要設置腳本
  - `commands/ralph-loop.md` - Skill 定義文件

**ralph-loop.md 關鍵內容**（第 12-44 行）：

````bash
```!
"${CLAUDE_PLUGIN_ROOT}/scripts/setup-ralph-loop.sh" $ARGUMENTS

# Extract and display completion promise if set
if [ -f .claude/ralph-loop.local.md ]; then
  PROMISE=$(grep '^completion_promise:' .claude/ralph-loop.local.md | sed 's/completion_promise: *//' | sed 's/^"\(.*\)"$/\1/')
  if [ -n "$PROMISE" ] && [ "$PROMISE" != "null" ]; then
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo "CRITICAL - Ralph Loop Completion Promise"
    # ... 多行 echo 語句
  fi
fi
````

````

**問題根源：**
- Skill 執行時會運行一個**包含多行的 bash 腳本**
- 這個多行腳本不在白名單中
- 安全檢查器檢測到：
  - 換行符號（視為可能分隔多個命令）
  - 複雜的 shell 語法（if 語句、變量替換）
  - 多個 echo 命令
- 因此被拒絕執行

#### 4. 權限系統機制理解

**Claude Code 權限控制層級：**
1. **項目級權限**（`.claude/settings.local.json`）優先於全局設置
2. **Permission 格式支援：**
   - `Skill(plugin-name:skill-name)` - 允許特定 skill
   - `Bash(pattern:*)` - 允許匹配模式的 bash 命令
   - `Bash(*/path/to/script.sh:*)` - 允許特定路徑的腳本

### 解決方案

#### 方案 A：允許特定的 ralph-wiggum skill（✅ 已採用）

**優點：**
- ✅ 最小權限原則
- ✅ 安全性高
- ✅ 清晰明確的白名單
- ✅ 不會開放其他不必要的權限

**實施方式：**

修改 `.claude/settings.local.json`，在 `permissions.allow` 陣列中添加：

```json
{
  "permissions": {
    "allow": [
      "Skill(frontend-design:frontend-design)",
      "Skill(ralph-wiggum:ralph-loop)",  // ← 新增這行
      "Bash(netstat:*)",
      "Bash(findstr:*)",
      "Bash(tasklist:*)",
      "Bash(pnpm add:*)",
      "Bash(pnpm install)",
      "Bash(pnpm install:*)",
      "Bash(echo \"pnpm dlx commitlint --edit $1\")"
    ]
  }
}
````

**修改位置：** `.claude/settings.local.json:5`

**驗收方式：**

```bash
/ralph-wiggum:ralph-loop @.github/copilot-instructions.md @.github/prompts/01_do_next_task.prompt.md 依照progress.md完成下一個項目並commit --max-iterations 100 --completion-promise "COMPLETE"
```

應該可以成功啟動 ralph loop 而不會出現權限錯誤。

---

#### 方案 B：允許所有 ralph-wiggum 執行的腳本（備選）

**優點：**

- ✅ 允許 ralph-wiggum 的所有功能
- ✅ 未來新增的 ralph-wiggum scripts 也會被允許

**缺點：**

- ⚠️ 比方案 A 寬鬆
- ⚠️ 允許整個 ralph-wiggum 插件目錄的所有腳本

**實施方式：**

```json
{
  "permissions": {
    "allow": [
      "Skill(frontend-design:frontend-design)",
      "Bash(*/ralph-wiggum/*/scripts/*.sh:*)", // ← 允許 ralph-wiggum 的所有腳本
      "Bash(netstat:*)",
      "Bash(findstr:*)",
      "Bash(tasklist:*)",
      "Bash(pnpm add:*)",
      "Bash(pnpm install)",
      "Bash(pnpm install:*)",
      "Bash(echo \"pnpm dlx commitlint --edit $1\")"
    ]
  }
}
```

**適用場景：**

- 需要使用 ralph-wiggum 的多個 skills
- 希望一次性解決所有 ralph-wiggum 相關的權限問題

---

#### 方案 C：完全移除項目級權限限制（不推薦）

**優點：**

- ✅ 最簡單
- ✅ 不會再有權限問題

**缺點：**

- ❌ 完全移除安全防護
- ❌ 允許所有 bash 命令執行
- ❌ 可能引入安全風險

**實施方式：**

刪除或重命名 `.claude/settings.local.json`：

```bash
mv .claude/settings.local.json .claude/settings.local.json.backup
```

這樣會使用全局設置（`~/.claude/settings.json`），其中沒有 permissions 限制。

**適用場景：**

- 僅在完全信任的本地開發環境
- 不建議在生產環境或共享專案中使用

---

### 實施記錄

**日期：** 2026-01-01
**實施方案：** 方案 A（允許特定的 ralph-wiggum skill）
**修改文件：** `.claude/settings.local.json`
**修改內容：** 在第 5 行添加 `"Skill(ralph-wiggum:ralph-loop)"`

**修改前：**

```json
{
  "permissions": {
    "allow": [
      "Skill(frontend-design:frontend-design)",
      "Bash(netstat:*)"
      // ...
    ]
  }
}
```

**修改後：**

```json
{
  "permissions": {
    "allow": [
      "Skill(frontend-design:frontend-design)",
      "Skill(ralph-wiggum:ralph-loop)",
      "Bash(netstat:*)"
      // ...
    ]
  }
}
```

### 延伸知識

#### Claude Code 權限系統架構

```
全局設置 (~/.claude/settings.json)
    ↓
    覆蓋
    ↓
項目級設置 (.claude/settings.local.json)  ← 優先級更高
```

#### Permission 模式語法

| 模式                  | 說明                          | 範例                                    |
| --------------------- | ----------------------------- | --------------------------------------- |
| `Skill(plugin:skill)` | 允許特定 plugin 的特定 skill  | `Skill(ralph-wiggum:ralph-loop)`        |
| `Skill(plugin:*)`     | 允許特定 plugin 的所有 skills | `Skill(frontend-design:*)`              |
| `Bash(command:*)`     | 允許特定命令及其參數          | `Bash(pnpm install:*)`                  |
| `Bash(*/path/*.sh:*)` | 允許匹配路徑的腳本            | `Bash(*/ralph-wiggum/*/scripts/*.sh:*)` |

#### 調試技巧

1. **檢查當前生效的配置：**

   ```bash
   cat .claude/settings.local.json
   cat ~/.claude/settings.json
   ```

2. **查看 plugin 安裝位置：**

   ```bash
   ls -la ~/.claude/plugins/cache/
   ls -la ~/.claude/plugins/marketplaces/
   ```

3. **查看 plugin 的 skill 定義：**

   ```bash
   cat ~/.claude/plugins/cache/[plugin-name]/[version]/commands/*.md
   ```

4. **查看安全檢查範例：**
   ```bash
   cat ~/.claude/plugins/marketplaces/claude-code-plugins/plugins/plugin-dev/skills/hook-development/examples/validate-bash.sh
   ```

### 經驗總結

1. **權限錯誤不一定來自用戶輸入**
   - 即使命令格式正確，plugin 內部執行的腳本也可能被阻擋

2. **項目級配置優先於全局配置**
   - 檢查問題時要先查看 `.claude/settings.local.json`

3. **使用最小權限原則**
   - 優先使用 Skill 級別的允許，而不是開放整個 Bash 命令模式

4. **保留所有解決方案**
   - 不同場景可能需要不同的權限策略

### 相關資源

- Claude Code 官方文檔：https://github.com/anthropics/claude-code
- Ralph Wiggum Plugin 文檔：~/.claude/plugins/cache/claude-plugins-official/ralph-wiggum/[version]/README.md
- 權限系統範例：~/.claude/plugins/marketplaces/claude-code-plugins/plugins/plugin-dev/

---

## 後續可能的問題

如果未來遇到其他 plugin 的權限問題，可以參考本次解決方案的步驟：

1. 確認錯誤訊息中的命令來源
2. 檢查 `.claude/settings.local.json` 的 permissions 配置
3. 查看 plugin 的 commands/\*.md 文件，了解實際執行的腳本
4. 選擇適當的權限模式（Skill 或 Bash 模式）
5. 添加到白名單並測試

---

_本文檔將持續更新，記錄專案開發過程中的其他技術問題和解決方案。_
