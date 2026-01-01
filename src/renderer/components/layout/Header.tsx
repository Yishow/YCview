import { useSettingsStore, type ThemeMode } from '../../stores/settings-store';

type HeaderProps = {
  title: string;
  currentPath: string;
};

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M21.64 13a1 1 0 00-1.05-.14 8.05 8.05 0 01-3.37.73 8.15 8.15 0 01-8.14-8.1 8.59 8.59 0 01.25-2A1 1 0 008 2.36a10.14 10.14 0 1014 11.69 1 1 0 00-.36-1.05z" />
    </svg>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function GearIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

function ThemeIcon({ theme }: { theme: ThemeMode }) {
  const iconClass = 'w-4 h-4 transition-all duration-300 ease-out';

  switch (theme) {
    case 'dark':
      return <MoonIcon className={iconClass} />;
    case 'light':
      return <SunIcon className={iconClass} />;
    case 'system':
      return <GearIcon className={iconClass} />;
  }
}

const THEME_LABELS: Record<ThemeMode, string> = {
  dark: '深色模式',
  light: '淺色模式',
  system: '跟隨系統',
};

export function Header({ title, currentPath }: HeaderProps) {
  const theme = useSettingsStore((state) => state.theme);
  const cycleTheme = useSettingsStore((state) => state.cycleTheme);

  return (
    <div className="relative flex items-center justify-between gap-3 overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5">
      <div
        className="pointer-events-none absolute left-0 top-0 h-full w-1 bg-[var(--color-accent)] opacity-50"
        style={{ boxShadow: '0 0 10px var(--color-accent)' }}
      />
      <div className="pointer-events-none absolute right-0 top-0 h-8 w-8 border-r border-t border-[var(--color-border)] opacity-30" />

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-3">
          <div
            className="text-lg font-black tracking-wider text-[var(--color-fg)] uppercase"
            style={{ textShadow: '0 0 20px var(--color-glow)' }}
          >
            {title}
          </div>
          <div className="hidden rounded bg-[var(--color-surface)] px-1.5 py-0.5 text-[10px] font-bold tracking-widest text-[var(--color-accent)] opacity-70 sm:block">
            V.1.0.0
          </div>
        </div>
        <div className="font-mono text-xs opacity-50 flex items-center gap-2 mt-0.5">
          <span className="text-[var(--color-accent)]">►</span>
          <span className="truncate">{currentPath}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={cycleTheme}
          className="group relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-sm
            border border-[var(--color-border)] bg-[var(--color-surface)]
            text-[var(--color-text-secondary)] transition-all duration-300
            hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]
            active:scale-95"
          aria-label={`切換主題：${THEME_LABELS[theme]}`}
          title={THEME_LABELS[theme]}
        >
          <div className="absolute inset-0 bg-[var(--color-accent)] opacity-0 transition-opacity group-hover:opacity-10" />

          <div className="absolute left-0 top-0 h-1.5 w-1.5 border-l border-t border-[var(--color-border)] transition-colors group-hover:border-[var(--color-accent)]" />
          <div className="absolute bottom-0 right-0 h-1.5 w-1.5 border-b border-r border-[var(--color-border)] transition-colors group-hover:border-[var(--color-accent)]" />

          <span
            className="relative z-10 flex items-center justify-center
              transition-transform duration-500 ease-out group-hover:rotate-[360deg]"
          >
            <ThemeIcon theme={theme} />
          </span>
        </button>

        <div className="flex items-center gap-1 rounded-sm border border-[var(--color-border)] bg-[var(--color-surface)] p-1">
          <button
            type="button"
            className="flex h-6 w-8 items-center justify-center rounded-sm text-xs opacity-60 hover:bg-[var(--color-bg)] hover:text-[var(--color-fg)] hover:opacity-100 transition-colors"
            aria-label="最小化視窗"
            onClick={() => {}}
          >
            <span className="translate-y-0.5">_</span>
          </button>
          <div className="h-3 w-px bg-[var(--color-border)] opacity-50" />
          <button
            type="button"
            className="flex h-6 w-8 items-center justify-center rounded-sm text-xs opacity-60 hover:bg-[var(--color-bg)] hover:text-[var(--color-fg)] hover:opacity-100 transition-colors"
            aria-label="最大化/還原視窗"
            onClick={() => {}}
          >
            □
          </button>
          <div className="h-3 w-px bg-[var(--color-border)] opacity-50" />
          <button
            type="button"
            className="flex h-6 w-8 items-center justify-center rounded-sm text-xs opacity-60 hover:bg-red-500/20 hover:text-red-500 hover:opacity-100 transition-colors"
            aria-label="關閉視窗"
            onClick={() => {}}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
