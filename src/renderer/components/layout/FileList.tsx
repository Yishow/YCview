import { useEffect, useMemo, useRef, useState } from 'react';

export type FileListItem = {
  id: string;
  name: string;
  type: string;
  sizeBytes: number;
  modifiedAt: string;
  isDirectory?: boolean;
};

export type FileListProps = {
  items: FileListItem[];
};

const ROW_HEIGHT = 28;
const OVERSCAN = 8;

function formatSize(bytes: number) {
  if (bytes <= 0) return '-';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(1)} GB`;
}

export function FileList({ items }: FileListProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const [viewportHeight, setViewportHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      setViewportHeight(el.clientHeight);
    });

    ro.observe(el);
    setViewportHeight(el.clientHeight);

    return () => ro.disconnect();
  }, []);

  const total = items.length;

  const range = useMemo(() => {
    if (total === 0 || viewportHeight === 0) return { start: 0, end: 0 };

    const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
    const visibleCount = Math.ceil(viewportHeight / ROW_HEIGHT) + OVERSCAN * 2;
    const end = Math.min(total, start + visibleCount);

    return { start, end };
  }, [scrollTop, total, viewportHeight]);

  const visibleItems = useMemo(
    () => items.slice(range.start, range.end),
    [items, range.end, range.start],
  );

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const next = e.currentTarget.scrollTop;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => setScrollTop(next));
  };

  const padTop = range.start * ROW_HEIGHT;
  const padBottom = (total - range.end) * ROW_HEIGHT;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[1fr_120px_140px_120px] items-center gap-2 border-b border-[var(--color-border)] px-3 py-2 text-xs font-medium opacity-80">
        <div>名稱</div>
        <div className="text-right">大小</div>
        <div>日期</div>
        <div>類型</div>
      </div>

      {/* Empty state */}
      {total === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
          <div className="text-3xl opacity-30">📭</div>
          <div className="text-sm opacity-70">此資料夾是空的</div>
          <div className="text-xs opacity-40">尚無檔案可顯示</div>
        </div>
      ) : (
        <div
          ref={viewportRef}
          onScroll={onScroll}
          className="flex-1 overflow-auto"
          role="list"
          aria-label="檔案列表"
          data-testid="file-list"
        >
          <div style={{ height: padTop }} aria-hidden="true" />
          {visibleItems.map((it) => (
            <div
              key={it.id}
              className="grid h-[28px] grid-cols-[1fr_120px_140px_120px] items-center gap-2 px-3 text-xs transition-colors hover:bg-[var(--color-border)]/30"
              role="listitem"
              data-testid="file-row"
            >
              <div className="min-w-0 truncate">
                <span className={it.isDirectory ? 'opacity-90' : 'opacity-80'}>
                  {it.isDirectory ? '📁' : '📄'}
                </span>
                <span className="ml-2">{it.name}</span>
              </div>
              <div className="text-right tabular-nums opacity-70">
                {it.isDirectory ? '-' : formatSize(it.sizeBytes)}
              </div>
              <div className="tabular-nums opacity-70">{it.modifiedAt}</div>
              <div className="opacity-70">{it.type}</div>
            </div>
          ))}
          <div style={{ height: padBottom }} aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
