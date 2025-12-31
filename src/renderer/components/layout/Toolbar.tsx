import { type ButtonHTMLAttributes } from 'react';

type ToolbarProps = {
  /** 是否有選中檔案（用於控制部分按鈕的 disabled 狀態） */
  hasSelection?: boolean;
  /** 複製操作回調 */
  onCopy?: () => void;
  /** 移動操作回調 */
  onMove?: () => void;
  /** 刪除操作回調 */
  onDelete?: () => void;
  /** 重新命名操作回調 */
  onRename?: () => void;
  /** 新增資料夾操作回調 */
  onNewFolder?: () => void;
  /** 重新整理操作回調 */
  onRefresh?: () => void;
};

type ToolbarButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** 按鈕文字 */
  label: string;
  /** 快捷鍵提示 */
  shortcut: string;
};

/**
 * 工具列按鈕組件
 *
 * 提供一致的按鈕樣式與互動效果（hover、disabled 狀態）
 */
function ToolbarButton({ label, shortcut, disabled, onClick, ...rest }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative rounded border px-3 py-1.5 text-xs
        transition-all duration-200
        ${
          disabled
            ? 'cursor-not-allowed border-[var(--color-border)] opacity-40'
            : 'border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-[var(--color-bg)] hover:shadow-sm active:scale-95'
        }
      `}
      title={disabled ? `${label} (${shortcut}) - 需先選取檔案` : `${label} (${shortcut})`}
      {...rest}
    >
      <span className="flex items-center gap-1.5">
        <span>{label}</span>
        <span
          className={`
            text-[10px] opacity-60
            ${!disabled && 'group-hover:opacity-90'}
          `}
        >
          ({shortcut})
        </span>
      </span>
    </button>
  );
}

/**
 * 工具列組件
 *
 * 顯示主要檔案操作按鈕（Copy/Move/Delete/Rename/NewFolder/Refresh）並附快捷鍵提示。
 * 部分操作需選取檔案後才可用（hasSelection 控制 disabled 狀態）。
 */
export function Toolbar({
  hasSelection = false,
  onCopy,
  onMove,
  onDelete,
  onRename,
  onNewFolder,
  onRefresh,
}: ToolbarProps) {
  return (
    <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-3 py-2">
      {/* Copy - 需選取檔案 */}
      <ToolbarButton
        label="Copy"
        shortcut="C"
        disabled={!hasSelection}
        onClick={onCopy}
        data-testid="toolbar-copy"
      />

      {/* Move - 需選取檔案 */}
      <ToolbarButton
        label="Move"
        shortcut="M"
        disabled={!hasSelection}
        onClick={onMove}
        data-testid="toolbar-move"
      />

      {/* Delete - 需選取檔案 */}
      <ToolbarButton
        label="Delete"
        shortcut="D"
        disabled={!hasSelection}
        onClick={onDelete}
        data-testid="toolbar-delete"
      />

      {/* Rename - 需選取檔案 */}
      <ToolbarButton
        label="Rename"
        shortcut="R"
        disabled={!hasSelection}
        onClick={onRename}
        data-testid="toolbar-rename"
      />

      {/* Divider */}
      <div className="mx-1 h-6 w-px bg-[var(--color-border)] opacity-50" />

      {/* NewFolder - 隨時可用 */}
      <ToolbarButton
        label="NewFolder"
        shortcut="F3"
        onClick={onNewFolder}
        data-testid="toolbar-new-folder"
      />

      {/* Refresh - 隨時可用 */}
      <ToolbarButton
        label="Refresh"
        shortcut="F5"
        onClick={onRefresh}
        data-testid="toolbar-refresh"
      />
    </div>
  );
}
