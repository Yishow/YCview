import React, { MouseEvent, useState, useCallback, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { ContextMenu, ContextMenuItem } from '../common/ContextMenu';

export interface Bookmark {
  id: string;
  name: string;
  path: string;
  icon: string;
  color: string;
  order: number;
  createdAt: number;
}

interface BookmarkItemProps {
  bookmark: Bookmark;
  onClick: (path: string) => void;
  onEdit: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
  onOpenInNewTab: (path: string) => void;
}

export function BookmarkItem({
  bookmark,
  onClick,
  onEdit,
  onDelete,
  onOpenInNewTab,
}: BookmarkItemProps) {
  const { id, name, path, icon, color } = bookmark;
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEditConfirm = useCallback(() => {
    const trimmedValue = editValue.trim();
    if (trimmedValue && trimmedValue !== name) {
      onEdit(id, trimmedValue);
    }
    setIsEditing(false);
  }, [editValue, name, id, onEdit]);

  const handleEditCancel = useCallback(() => {
    setEditValue(name);
    setIsEditing(false);
  }, [name]);

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleEditConfirm();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleEditCancel();
      }
    },
    [handleEditConfirm, handleEditCancel],
  );

  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const contextMenuItems: ContextMenuItem[] = [
    {
      label: '在新分頁開啟',
      onClick: () => onOpenInNewTab(path),
    },
    { separator: true },
    {
      label: '重新命名',
      onClick: () => {
        setIsEditing(true);
        setEditValue(name);
      },
    },
    {
      label: '刪除書籤',
      onClick: () => onDelete(id),
      danger: true,
    },
  ];

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => !isEditing && onClick(path)}
        onContextMenu={handleContextMenu}
        className={clsx(
          'group relative flex h-6 min-w-[80px] max-w-[160px] select-none items-center gap-2',
          'border border-transparent hover:border-[var(--color-border)]',
          'bg-transparent hover:bg-[var(--color-bg-secondary)]',
          'transition-all duration-200 ease-out',
          'px-2 text-xs font-medium tracking-wide text-[var(--color-text-secondary)] hover:text-[var(--color-fg)]',
          'rounded-sm',
          isEditing && 'bg-[var(--color-bg-secondary)] border-[var(--color-accent)]',
        )}
        title={path}
      >
        <div
          className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full transition-opacity opacity-60 group-hover:opacity-100"
          style={{ backgroundColor: color || 'var(--color-accent)' }}
        />

        <span className="ml-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
          {icon || '🔖'}
        </span>

        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleEditConfirm}
            onKeyDown={handleEditKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 min-w-0 bg-transparent text-[var(--color-fg)] outline-none placeholder-[var(--color-text-muted)]"
          />
        ) : (
          <span className="flex-1 truncate">{name}</span>
        )}

        {!isEditing && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--color-accent-dim)] to-transparent -translate-x-full animate-[scanline_1s_ease-in-out_infinite] opacity-10" />
          </div>
        )}

        <div className="absolute top-0 right-0 h-1 w-1 border-t border-r border-[var(--color-border)] opacity-0 group-hover:opacity-50 transition-opacity" />
        <div className="absolute bottom-0 right-0 h-1 w-1 border-b border-r border-[var(--color-border)] opacity-0 group-hover:opacity-50 transition-opacity" />
      </div>

      {contextMenu && (
        <ContextMenu items={contextMenuItems} position={contextMenu} onClose={closeContextMenu} />
      )}
    </>
  );
}
