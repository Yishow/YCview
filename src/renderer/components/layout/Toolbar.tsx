import { type ButtonHTMLAttributes } from 'react';

type ToolbarProps = {
  hasSelection?: boolean;
  onCopy?: () => void;
  onMove?: () => void;
  onDelete?: () => void;
  onRename?: () => void;
  onNewFolder?: () => void;
  onRefresh?: () => void;
};

type ToolbarButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  shortcut: string;
};

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
        <kbd
          className={`
            inline-flex items-center justify-center px-1 min-w-[18px]
            text-[9px] font-mono font-medium uppercase tracking-wide
            bg-[var(--color-surface)] border border-[var(--color-border)]
            rounded-[2px] shadow-[0_1px_0_var(--color-border)]
            opacity-70 transition-opacity duration-200
            ${!disabled && 'group-hover:opacity-100 group-hover:bg-[var(--color-bg)] group-hover:border-[var(--color-bg)]/50 group-hover:text-[var(--color-accent)]'}
          `}
        >
          {shortcut}
        </kbd>
      </span>
    </button>
  );
}

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
      <ToolbarButton
        label="Copy"
        shortcut="C"
        disabled={!hasSelection}
        onClick={onCopy}
        data-testid="toolbar-copy"
      />

      <ToolbarButton
        label="Move"
        shortcut="M"
        disabled={!hasSelection}
        onClick={onMove}
        data-testid="toolbar-move"
      />

      <ToolbarButton
        label="Delete"
        shortcut="D"
        disabled={!hasSelection}
        onClick={onDelete}
        data-testid="toolbar-delete"
      />

      <ToolbarButton
        label="Rename"
        shortcut="R"
        disabled={!hasSelection}
        onClick={onRename}
        data-testid="toolbar-rename"
      />

      <div className="mx-1 h-6 w-px bg-[var(--color-border)] opacity-50" />

      <ToolbarButton
        label="NewFolder"
        shortcut="F3"
        onClick={onNewFolder}
        data-testid="toolbar-new-folder"
      />

      <ToolbarButton
        label="Refresh"
        shortcut="F5"
        onClick={onRefresh}
        data-testid="toolbar-refresh"
      />
    </div>
  );
}
