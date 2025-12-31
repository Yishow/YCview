import { useMemo, useState } from 'react';
import { FileList, type FileListItem } from './FileList';
import { PathBar } from './PathBar';

/**
 * FilePanel 組件
 *
 * 聚合 PathBar（路徑列）與 FileList（檔案列表）的容器組件。
 * 支援焦點狀態視覺回饋，當左右面板切換時提供明確的視覺提示。
 *
 * @remarks
 * MVP 階段使用 placeholder 組件，後續會替換為完整實作。
 */

type FilePanelProps = {
  /** 面板是否為焦點狀態 */
  isFocused?: boolean;
  /** 當前路徑（傳遞給 PathBar） */
  currentPath?: string;
  /** 點擊面板時的回調（用於切換焦點） */
  onClick?: () => void;
};

/**
 * FilePanel 容器組件
 *
 * 整合路徑列與檔案列表，並提供焦點狀態的視覺回饋。
 * 焦點時會顯示強調邊框與微妙的背景色調變化。
 */
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
  const items = useMemo(() => makeMockItems(currentPath ?? 'C:\\', 1000), [currentPath]);

  // 選取與標記狀態 (demo)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [markedIds, setMarkedIds] = useState<Set<string>>(new Set());
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const handleItemClick = (id: string, e: React.MouseEvent) => {
    if (e.ctrlKey) {
      // Ctrl+Click: 切換選取
      const newSet = new Set(selectedIds);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      setSelectedIds(newSet);
    } else if (e.shiftKey) {
      // Shift+Click: 範圍選取 (簡化版本)
      setSelectedIds(new Set([id]));
    } else {
      // 普通點擊: 單選
      setSelectedIds(new Set([id]));
    }
    setFocusedId(id);
  };

  const handleItemDoubleClick = (id: string) => {
    console.log('Double-click:', id);
    // TODO: 進入目錄或開啟檔案
  };

  const handleItemContextMenu = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Context menu:', id);
    // TODO: 顯示右鍵選單
  };

  // Ins 鍵標記/取消標記
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Insert' && focusedId) {
      const newSet = new Set(markedIds);
      if (newSet.has(focusedId)) {
        newSet.delete(focusedId);
      } else {
        newSet.add(focusedId);
      }
      setMarkedIds(newSet);
      e.preventDefault();
    }
  };

  return (
    <div
      className={`
        flex h-full flex-col
        transition-all duration-300 ease-out
        ${isFocused ? 'ring-2 ring-[var(--color-accent)] ring-offset-0' : 'ring-1 ring-transparent'}
      `}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label={isFocused ? '當前聚焦的檔案面板' : '檔案面板'}
      tabIndex={0}
      data-testid={`file-panel-${isFocused ? 'focused' : 'unfocused'}`}
    >
      {/* 焦點指示器 - 頂部細線 */}
      <div
        className={`
          h-0.5 w-full
          transition-all duration-300
          ${
            isFocused
              ? 'bg-[var(--color-accent)] opacity-100 shadow-sm'
              : 'bg-transparent opacity-0'
          }
        `}
      />

      {/* 面板內容區 */}
      <div
        className={`
          flex flex-1 flex-col overflow-hidden
          transition-all duration-300
          ${isFocused ? 'bg-[var(--color-accent)]/[0.02]' : 'bg-transparent'}
        `}
      >
        {/* 路徑列 */}
        <PathBar path={currentPath ?? 'C:\\'} />

        {/* 檔案列表 */}
        <div className="flex-1 overflow-hidden">
          <FileList
            items={items}
            selectedIds={selectedIds}
            markedIds={markedIds}
            focusedId={focusedId}
            onItemClick={handleItemClick}
            onItemDoubleClick={handleItemDoubleClick}
            onItemContextMenu={handleItemContextMenu}
          />
        </div>
      </div>
    </div>
  );
}
