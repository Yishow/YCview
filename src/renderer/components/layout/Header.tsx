type HeaderProps = {
  title: string;
  currentPath: string;
};

export function Header({ title, currentPath }: HeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2">
      <div className="min-w-0">
        <div className="font-bold tracking-wide">{title}</div>
        <div className="truncate text-xs opacity-70">{currentPath}</div>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          className="rounded px-2 py-1 text-xs opacity-80 hover:bg-[var(--color-border)] hover:opacity-100"
          aria-label="最小化視窗"
          onClick={() => {}}
        >
          _
        </button>
        <button
          type="button"
          className="rounded px-2 py-1 text-xs opacity-80 hover:bg-[var(--color-border)] hover:opacity-100"
          aria-label="最大化/還原視窗"
          onClick={() => {}}
        >
          □
        </button>
        <button
          type="button"
          className="rounded px-2 py-1 text-xs opacity-80 hover:bg-red-500/15 hover:text-red-600 hover:opacity-100"
          aria-label="關閉視窗"
          onClick={() => {}}
        >
          ×
        </button>
      </div>
    </div>
  );
}
