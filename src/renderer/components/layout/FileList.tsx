import { useEffect, useMemo, useRef, useState } from 'react';
import { FileItem, type FileInfo } from './FileItem';

export type FileListItem = {
  id: string;
  name: string;
  type: string;
  sizeBytes: number;
  modifiedAt: string;
  isDirectory?: boolean;
  extension?: string;
};

export type FileListProps = {
  items: FileListItem[];
  selectedIds?: Set<string>;
  markedIds?: Set<string>;
  focusedId?: string | null;
  onItemClick?: (id: string, e: React.MouseEvent) => void;
  onItemDoubleClick?: (id: string) => void;
  onItemContextMenu?: (id: string, e: React.MouseEvent) => void;
};

const ROW_HEIGHT = 28;
const OVERSCAN = 8;

export function FileList({
  items,
  selectedIds = new Set(),
  markedIds = new Set(),
  focusedId = null,
  onItemClick,
  onItemDoubleClick,
  onItemContextMenu,
}: FileListProps) {
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
      <div className="grid grid-cols-[1fr_100px_140px_80px] items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]/50 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider opacity-60">
        <div>Name</div>
        <div className="text-right">Size</div>
        <div>Modified</div>
        <div>Type</div>
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
          {visibleItems.map((it) => {
            const fileInfo: FileInfo = {
              id: it.id,
              name: it.name,
              sizeBytes: it.sizeBytes,
              type: it.type,
              modifiedAt: it.modifiedAt,
              isDirectory: it.isDirectory,
              extension: it.extension,
            };

            return (
              <FileItem
                key={it.id}
                file={fileInfo}
                isSelected={selectedIds.has(it.id)}
                isMarked={markedIds.has(it.id)}
                isFocused={focusedId === it.id}
                onClick={(e) => onItemClick?.(it.id, e)}
                onDoubleClick={() => onItemDoubleClick?.(it.id)}
                onContextMenu={(e) => onItemContextMenu?.(it.id, e)}
              />
            );
          })}
          <div style={{ height: padBottom }} aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
