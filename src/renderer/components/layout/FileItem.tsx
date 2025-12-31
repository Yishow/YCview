import { memo } from 'react';
import { clsx } from 'clsx';

export type FileInfo = {
  id: string;
  name: string;
  path?: string;
  sizeBytes: number;
  type: string;
  modifiedAt: string;
  isDirectory?: boolean;
  extension?: string;
};

export type FileItemProps = {
  file: FileInfo;
  isSelected?: boolean;
  isMarked?: boolean;
  isFocused?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onDoubleClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
};

// 顏色規則（依檔案類型）
const getFileColor = (file: FileInfo): string => {
  if (file.isDirectory) {
    return 'text-yellow-400';
  }

  const ext = file.extension?.toLowerCase() || '';

  // Executable files
  if (['.exe', '.bat', '.cmd', '.sh', '.app', '.msi'].includes(ext)) {
    return 'text-green-400';
  }

  // Archive files
  if (['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'].includes(ext)) {
    return 'text-red-400';
  }

  // Image files
  if (['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico'].includes(ext)) {
    return 'text-purple-400';
  }

  // Document files
  if (['.pdf', '.doc', '.docx', '.txt', '.md', '.rtf'].includes(ext)) {
    return 'text-blue-400';
  }

  // Code files
  if (['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.c', '.cpp', '.css', '.html'].includes(ext)) {
    return 'text-cyan-400';
  }

  // Default
  return 'text-[var(--color-text)]';
};

function formatSize(bytes: number): string {
  if (bytes <= 0) return '-';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(1)} GB`;
}

function FileItemComponent({
  file,
  isSelected = false,
  isMarked = false,
  isFocused = false,
  onClick,
  onDoubleClick,
  onContextMenu,
}: FileItemProps) {
  const fileColor = getFileColor(file);

  return (
    <div
      className={clsx(
        'grid h-[28px] grid-cols-[1fr_120px_140px_120px] items-center gap-2 px-3 text-xs',
        'cursor-pointer select-none transition-colors',
        // Hover 效果
        !isSelected && 'hover:bg-[var(--color-border)]/30',
        // Selected 狀態（最高優先）
        isSelected && 'bg-[var(--color-accent)]/20',
        // Marked 狀態（次優先）
        !isSelected && isMarked && 'bg-yellow-500/10',
        // Focused 狀態（輔助高亮）
        isFocused && 'ring-1 ring-inset ring-[var(--color-accent)]/50',
      )}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      role="listitem"
      aria-selected={isSelected}
      data-testid="file-item"
      data-selected={isSelected}
      data-marked={isMarked}
      data-focused={isFocused}
    >
      {/* 名稱欄位 */}
      <div className="flex min-w-0 items-center gap-2">
        {/* 標記指示器 */}
        {isMarked && (
          <div className="h-2 w-2 flex-shrink-0 rounded-full bg-yellow-400" aria-label="已標記" />
        )}

        {/* 檔案圖示與名稱 */}
        <div className="min-w-0 truncate">
          <span className={clsx('mr-1.5', fileColor)}>{file.isDirectory ? '📁' : '📄'}</span>
          <span className={clsx(isSelected && 'font-medium')}>{file.name}</span>
        </div>
      </div>

      {/* 大小欄位 */}
      <div className="text-right tabular-nums opacity-70">
        {file.isDirectory ? '-' : formatSize(file.sizeBytes)}
      </div>

      {/* 日期欄位 */}
      <div className="tabular-nums opacity-70">{file.modifiedAt}</div>

      {/* 類型欄位 */}
      <div className="opacity-70">{file.type}</div>
    </div>
  );
}

export const FileItem = memo(FileItemComponent);
