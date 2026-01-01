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

const FILE_TYPE_COLORS: Record<string, string> = {
  directory: 'text-amber-400',
  executable: 'text-emerald-400',
  archive: 'text-rose-400',
  image: 'text-violet-400',
  document: 'text-sky-400',
  code: 'text-cyan-400',
  default: 'text-[var(--color-text)]',
};

const EXECUTABLE_EXTS = ['.exe', '.bat', '.cmd', '.sh', '.app', '.msi'];
const ARCHIVE_EXTS = ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'];
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico'];
const DOCUMENT_EXTS = ['.pdf', '.doc', '.docx', '.txt', '.md', '.rtf'];
const CODE_EXTS = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.c', '.cpp', '.css', '.html'];

function getFileColor(file: FileInfo): string {
  if (file.isDirectory) return FILE_TYPE_COLORS.directory;

  const ext = file.extension?.toLowerCase() || '';

  if (EXECUTABLE_EXTS.includes(ext)) return FILE_TYPE_COLORS.executable;
  if (ARCHIVE_EXTS.includes(ext)) return FILE_TYPE_COLORS.archive;
  if (IMAGE_EXTS.includes(ext)) return FILE_TYPE_COLORS.image;
  if (DOCUMENT_EXTS.includes(ext)) return FILE_TYPE_COLORS.document;
  if (CODE_EXTS.includes(ext)) return FILE_TYPE_COLORS.code;

  return FILE_TYPE_COLORS.default;
}

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
        'grid h-7 grid-cols-[1fr_100px_140px_80px] items-center gap-2 px-3 text-xs',
        'cursor-pointer select-none transition-all duration-100',
        'border-l-2',
        !isSelected && !isMarked && !isFocused && 'border-transparent hover:bg-white/5',
        isSelected && 'border-[var(--color-accent)] bg-[var(--color-accent)]/15',
        !isSelected && isMarked && 'border-amber-500 bg-amber-500/10',
        isFocused && 'ring-1 ring-inset ring-[var(--color-accent)]/60',
        isSelected && isMarked && 'border-amber-500',
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
      <div className="flex min-w-0 items-center gap-1.5">
        {isMarked && (
          <div
            className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.6)]"
            aria-label="已標記"
          />
        )}
        <span className={clsx('flex-shrink-0', fileColor)}>{file.isDirectory ? '▸' : '◦'}</span>
        <span
          className={clsx(
            'min-w-0 truncate',
            isSelected && 'font-medium text-[var(--color-accent)]',
            isMarked && !isSelected && 'text-amber-300',
          )}
        >
          {file.name}
        </span>
      </div>

      <div className="text-right font-mono text-[10px] opacity-60">
        {file.isDirectory ? '<DIR>' : formatSize(file.sizeBytes)}
      </div>

      <div className="font-mono text-[10px] opacity-60">{file.modifiedAt}</div>

      <div className="font-mono text-[10px] uppercase opacity-50">{file.type}</div>
    </div>
  );
}

export const FileItem = memo(FileItemComponent);
