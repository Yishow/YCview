import { useMemo, useRef, useEffect } from 'react';
import { FileList, type FileListItem } from './FileList';
import { PathBar } from './PathBar';
import { useSelection } from '../../hooks/useSelection';

type FilePanelProps = {
  isFocused?: boolean;
  currentPath?: string;
  onClick?: () => void;
};

function makeMockItems(seed: string, count: number): FileListItem[] {
  const baseName = seed.split('\\').filter(Boolean).pop() ?? 'Root';
  const pad2 = (n: number) => String(n).padStart(2, '0');

  const extensions = [
    '.txt',
    '.pdf',
    '.docx',
    '.xlsx',
    '.jpg',
    '.png',
    '.zip',
    '.exe',
    '.js',
    '.ts',
  ];

  return Array.from({ length: count }, (_, i) => {
    const isDirectory = i % 12 === 0;
    const ext = extensions[i % extensions.length];
    const name = isDirectory
      ? `資料夾_${baseName}_${pad2(i)}`
      : `檔案_${baseName}_${pad2(i)}${ext}`;
    const sizeBytes = isDirectory ? 0 : (i * 1937) % (1024 * 1024 * 8);
    const y = 2025;
    const m = pad2(((i % 12) + 1) | 0);
    const d = pad2(((i % 28) + 1) | 0);
    const hh = pad2(i % 24);
    const mm = pad2((i * 7) % 60);

    return {
      id: `${seed}::${i}`,
      name,
      type: isDirectory ? '<DIR>' : ext.substring(1).toUpperCase(),
      sizeBytes,
      modifiedAt: `${y}-${m}-${d} ${hh}:${mm}`,
      isDirectory,
      extension: ext,
    };
  });
}

export function FilePanel({ isFocused = false, currentPath, onClick }: FilePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const items = useMemo(() => makeMockItems(currentPath ?? 'C:\\', 1000), [currentPath]);
  const itemIds = useMemo(() => items.map((item) => item.id), [items]);

  const { selectedItems, markedItems, focusedItem, handleClick, handleKeyDown, getMarkedCount } =
    useSelection({ items: itemIds, pageSize: 20 });

  useEffect(() => {
    if (isFocused && panelRef.current) {
      panelRef.current.focus();
    }
  }, [isFocused]);

  const handleItemClick = (id: string, e: React.MouseEvent) => {
    handleClick(id, e);
  };

  const handleItemDoubleClick = (id: string) => {
    console.log('Double-click:', id);
  };

  const handleItemContextMenu = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Context menu:', id);
  };

  const selectedCount = selectedItems.size;
  const markedCount = getMarkedCount();

  return (
    <div
      ref={panelRef}
      className={`
        flex h-full flex-col
        transition-all duration-200 ease-out
        ${isFocused ? 'ring-2 ring-[var(--color-accent)] ring-offset-0' : 'ring-1 ring-transparent'}
      `}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label={isFocused ? '當前聚焦的檔案面板' : '檔案面板'}
      tabIndex={0}
      data-testid={`file-panel-${isFocused ? 'focused' : 'unfocused'}`}
    >
      <div
        className={`
          h-0.5 w-full transition-all duration-200
          ${isFocused ? 'bg-[var(--color-accent)] opacity-100' : 'bg-transparent opacity-0'}
        `}
      />

      <div
        className={`
          flex flex-1 flex-col overflow-hidden transition-colors duration-200
          ${isFocused ? 'bg-[var(--color-accent)]/[0.02]' : 'bg-transparent'}
        `}
      >
        <PathBar path={currentPath ?? 'C:\\'} />

        <div className="flex-1 overflow-hidden">
          <FileList
            items={items}
            selectedIds={selectedItems}
            markedIds={markedItems}
            focusedId={focusedItem}
            onItemClick={handleItemClick}
            onItemDoubleClick={handleItemDoubleClick}
            onItemContextMenu={handleItemContextMenu}
          />
        </div>

        {(selectedCount > 0 || markedCount > 0) && (
          <div className="flex items-center gap-4 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-1.5 text-xs">
            {selectedCount > 0 && (
              <span className="text-[var(--color-accent)]">{selectedCount} 個選取</span>
            )}
            {markedCount > 0 && <span className="text-yellow-400">{markedCount} 個標記</span>}
          </div>
        )}
      </div>
    </div>
  );
}
