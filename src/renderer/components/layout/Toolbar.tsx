import { type ButtonHTMLAttributes } from 'react';

type ToolbarProps = {
  hasSelection?: boolean;
  isPreviewOpen?: boolean;
  onCopy?: () => void;
  onMove?: () => void;
  onDelete?: () => void;
  onRename?: () => void;
  onNewFolder?: () => void;
  onRefresh?: () => void;
  onHash?: () => void;
  onCompare?: () => void;
  onTogglePreview?: () => void;
};

type ToolbarButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  shortcut: string;
  isActive?: boolean;
};

function ToolbarButton({
  label,
  shortcut,
  disabled,
  isActive,
  onClick,
  ...rest
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative overflow-hidden border px-3 py-1.5 text-xs font-medium tracking-wide
        transition-all duration-200
        ${
          disabled
            ? 'cursor-not-allowed border-transparent bg-transparent text-[var(--color-text-muted)] opacity-50'
            : isActive
              ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)] shadow-[0_0_10px_rgba(59,130,246,0.2)]'
              : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:shadow-[0_0_10px_rgba(59,130,246,0.1)] active:scale-95'
        }
      `}
      title={disabled ? `${label} (${shortcut}) - 需先選取檔案` : `${label} (${shortcut})`}
      {...rest}
    >
      {!disabled && (
        <>
          <span className="absolute -left-1 -top-1 h-2 w-2 border-b border-r border-[var(--color-accent)] opacity-0 transition-opacity group-hover:opacity-100" />
          <span className="absolute -bottom-1 -right-1 h-2 w-2 border-l border-t border-[var(--color-accent)] opacity-0 transition-opacity group-hover:opacity-100" />
        </>
      )}

      <span className="relative z-10 flex items-center gap-2">
        <span className="uppercase">{label}</span>
        <kbd
          className={`
            hidden sm:inline-flex items-center justify-center px-1.5 min-w-[20px] h-4
            text-[9px] font-mono font-bold uppercase tracking-wider
            bg-[var(--color-bg)] border border-[var(--color-border)]
            opacity-50 transition-all duration-200
            ${!disabled && 'group-hover:opacity-100 group-hover:border-[var(--color-accent)] group-hover:text-[var(--color-accent)]'}
          `}
        >
          {shortcut}
        </kbd>
      </span>
    </button>
  );
}

function ToolbarDivider() {
  return (
    <div className="mx-2 h-6 w-px bg-[var(--color-border)] opacity-50 relative">
      <div className="absolute top-0 -left-0.5 h-1 w-2 bg-[var(--color-border)]" />
      <div className="absolute bottom-0 -left-0.5 h-1 w-2 bg-[var(--color-border)]" />
    </div>
  );
}

export function Toolbar({
  hasSelection = false,
  isPreviewOpen = false,
  onCopy,
  onMove,
  onDelete,
  onRename,
  onNewFolder,
  onRefresh,
  onHash,
  onCompare,
  onTogglePreview,
}: ToolbarProps) {
  return (
    <div className="relative flex items-center gap-1 overflow-x-auto border-b border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-2">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 10px)',
        }}
      />

      <div className="flex items-center gap-1 p-1">
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
      </div>

      <ToolbarDivider />

      <div className="flex items-center gap-1 p-1">
        <ToolbarButton
          label="New Folder"
          shortcut="F3"
          onClick={onNewFolder}
          data-testid="toolbar-new-folder"
        />
      </div>

      <ToolbarDivider />

      <div className="flex items-center gap-1 p-1">
        <ToolbarButton
          label="Hash"
          shortcut="Alt+H"
          disabled={!hasSelection}
          onClick={onHash}
          data-testid="toolbar-hash"
        />

        <ToolbarButton
          label="Compare"
          shortcut="Alt+C"
          disabled={!hasSelection}
          onClick={onCompare}
          data-testid="toolbar-compare"
        />
      </div>

      <ToolbarDivider />

      <div className="flex items-center gap-1 p-1">
        <ToolbarButton
          label="Preview"
          shortcut="Alt+P"
          isActive={isPreviewOpen}
          onClick={onTogglePreview}
          data-testid="toolbar-preview"
        />

        <ToolbarButton
          label="Refresh"
          shortcut="F5"
          onClick={onRefresh}
          data-testid="toolbar-refresh"
        />
      </div>
    </div>
  );
}
