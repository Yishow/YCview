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
    <div className="flex items-center justify-between gap-3 px-3 py-2">
      <div className="min-w-0">
        <div className="font-bold tracking-wide">{title}</div>
        <div className="truncate text-xs opacity-70">{currentPath}</div>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={cycleTheme}
          className="group relative flex h-7 w-7 items-center justify-center rounded
            border border-[var(--color-border)] bg-[var(--color-bg-secondary)]
            text-[var(--color-text-secondary)] transition-all duration-200
            hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-hover)]
            hover:text-[var(--color-accent)] hover:shadow-[0_0_8px_var(--color-glow)]
            active:scale-95"
          aria-label={`切換主題：${THEME_LABELS[theme]}`}
          title={THEME_LABELS[theme]}
        >
          <span
            className="pointer-events-none absolute inset-0 overflow-hidden rounded opacity-0 
              transition-opacity duration-200 group-hover:opacity-100"
          >
            <span
              className="absolute inset-0 bg-gradient-to-r from-transparent 
                via-[var(--color-accent)] to-transparent opacity-10"
              style={{
                animation: 'scanline 1.5s linear infinite',
              }}
            />
          </span>

          <span
            className="relative z-10 flex items-center justify-center
              transition-transform duration-300 ease-out group-hover:rotate-12"
          >
            <ThemeIcon theme={theme} />
          </span>

          <span className="absolute -right-px -top-px h-1.5 w-1.5 border-r border-t border-[var(--color-border)] opacity-50" />
          <span className="absolute -bottom-px -left-px h-1.5 w-1.5 border-b border-l border-[var(--color-border)] opacity-50" />
        </button>

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
