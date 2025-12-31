import { useMemo, useState } from 'react';

export type PathBarProps = {
  /** 目前顯示路徑（Windows 建議用 \\ 分隔） */
  path: string;
  /** 點擊麵包屑後回傳新路徑（未提供時僅更新顯示，不改變外部狀態） */
  onPathChange?: (nextPath: string) => void;
};

function normalizeWindowsPath(input: string) {
  return input.replace(/\//g, '\\');
}

type Crumb = { label: string; fullPath: string };

function buildCrumbs(path: string): Crumb[] {
  const p = normalizeWindowsPath(path);
  const m = /^([A-Za-z]:)(\\.*)?$/.exec(p);
  const drive = m?.[1] ?? '';
  const rest = (m?.[2] ?? '').replace(/^\\+/, '');

  if (!drive) return [{ label: p, fullPath: p }];

  const parts = rest ? rest.split('\\').filter(Boolean) : [];
  const crumbs: Crumb[] = [{ label: drive, fullPath: `${drive}\\` }];

  let acc = `${drive}\\`;
  for (const seg of parts) {
    acc = acc.endsWith('\\') ? `${acc}${seg}` : `${acc}\\${seg}`;
    crumbs.push({ label: seg, fullPath: acc });
  }

  return crumbs;
}

function getDriveFromPath(path: string) {
  const m = /^([A-Za-z]:)/.exec(normalizeWindowsPath(path));
  return m?.[1]?.toUpperCase() ?? 'C:';
}

export function PathBar({ path, onPathChange }: PathBarProps) {
  const [displayPath, setDisplayPath] = useState(path);

  const crumbs = useMemo(() => buildCrumbs(displayPath), [displayPath]);
  const drive = useMemo(() => getDriveFromPath(displayPath), [displayPath]);

  const setPath = (next: string) => {
    if (onPathChange) onPathChange(next);
    else setDisplayPath(next);
  };

  return (
    <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-3 py-2 text-sm">
      {/* 磁碟下拉 placeholder（之後會接 IPC getDrives） */}
      <label className="flex items-center gap-1">
        <span className="sr-only">選擇磁碟</span>
        <select
          className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-xs opacity-80 outline-none transition hover:opacity-100 focus:ring-2 focus:ring-[var(--color-accent)]"
          value={drive}
          onChange={(e) => setPath(`${e.target.value}\\`)}
          aria-label="選擇磁碟（placeholder）"
        >
          <option value="C:">C:</option>
          <option value="D:">D:</option>
          <option value="E:">E:</option>
        </select>
      </label>

      <span className="opacity-30" aria-hidden="true">
        |
      </span>

      <nav aria-label="路徑導覽" className="min-w-0 flex-1">
        <ol className="flex min-w-0 items-center gap-1">
          {crumbs.map((c, idx) => {
            const isLast = idx === crumbs.length - 1;
            return (
              <li key={`${c.fullPath}-${idx}`} className="min-w-0 flex items-center gap-1">
                <button
                  type="button"
                  className={
                    `min-w-0 truncate rounded px-1 py-0.5 text-left focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] ` +
                    (isLast
                      ? 'font-medium'
                      : 'opacity-80 hover:bg-[var(--color-border)] hover:opacity-100')
                  }
                  aria-current={isLast ? 'page' : undefined}
                  onClick={() => setPath(c.fullPath)}
                  disabled={isLast}
                  title={c.fullPath}
                >
                  {c.label}
                </button>
                {!isLast && (
                  <span className="opacity-40" aria-hidden="true">
                    ›
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
