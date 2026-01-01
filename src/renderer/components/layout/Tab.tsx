import React, { MouseEvent, useState, useCallback, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { Tab as TabType } from '../../stores/tab-store';
import { ContextMenu, ContextMenuItem } from '../common/ContextMenu';

interface TabProps {
  tab: TabType;
  tabIndex: number;
  totalTabs: number;
  isActive: boolean;
  onClick: () => void;
  onClose: (e: MouseEvent) => void;
  onPin: (e: MouseEvent) => void;
  onCloseOthers?: () => void;
  onCloseToRight?: () => void;
  onDuplicate?: () => void;
  onTitleChange?: (newTitle: string) => void;
  onDragStart?: (e: React.DragEvent, tabId: string) => void;
  onDragOver?: (e: React.DragEvent, tabIndex: number) => void;
  onDrop?: (e: React.DragEvent, tabIndex: number) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  isDragging?: boolean;
  dragOverIndex?: number | null;
}

export function Tab({
  tab,
  tabIndex,
  totalTabs,
  isActive,
  onClick,
  onClose,
  onPin,
  onCloseOthers,
  onCloseToRight,
  onDuplicate,
  onTitleChange,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging,
  dragOverIndex,
}: TabProps) {
  const { title, isLoading, isPinned, icon } = tab;

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      setIsEditing(true);
      setEditValue(title);
    },
    [title],
  );

  const handleEditConfirm = useCallback(() => {
    const trimmedValue = editValue.trim();
    if (trimmedValue && trimmedValue !== title) {
      onTitleChange?.(trimmedValue);
    }
    setIsEditing(false);
  }, [editValue, title, onTitleChange]);

  const handleEditCancel = useCallback(() => {
    setEditValue(title);
    setIsEditing(false);
  }, [title]);

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

  const handleDragStartInternal = useCallback(
    (e: React.DragEvent) => {
      if (isEditing) {
        e.preventDefault();
        return;
      }
      onDragStart?.(e, tab.id);
    },
    [isEditing, onDragStart, tab.id],
  );

  const handleDragOverInternal = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      onDragOver?.(e, tabIndex);
    },
    [onDragOver, tabIndex],
  );

  const handleDropInternal = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      onDrop?.(e, tabIndex);
    },
    [onDrop, tabIndex],
  );

  const handleDragEndInternal = useCallback(
    (e: React.DragEvent) => {
      onDragEnd?.(e);
    },
    [onDragEnd],
  );

  const showDropIndicator = dragOverIndex === tabIndex;

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
      label: '關閉分頁',
      shortcut: 'Ctrl+W',
      onClick: () => {
        onClose({} as MouseEvent);
      },
    },
    {
      label: '關閉其他分頁',
      disabled: totalTabs <= 1,
      onClick: () => {
        onCloseOthers?.();
      },
    },
    {
      label: '關閉右側分頁',
      disabled: tabIndex >= totalTabs - 1,
      onClick: () => {
        onCloseToRight?.();
      },
    },
    { separator: true },
    {
      label: '複製分頁',
      onClick: () => {
        onDuplicate?.();
      },
    },
    {
      label: isPinned ? '取消釘選' : '釘選分頁',
      onClick: () => {
        onPin({} as MouseEvent);
      },
    },
  ];

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        draggable={!isEditing}
        onClick={isEditing ? undefined : onClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        onDragStart={handleDragStartInternal}
        onDragOver={handleDragOverInternal}
        onDrop={handleDropInternal}
        onDragEnd={handleDragEndInternal}
        onKeyDown={(e) => {
          if (!isEditing && (e.key === 'Enter' || e.key === ' ')) {
            onClick();
          }
        }}
        className={clsx(
          'group relative flex h-9 min-w-[120px] max-w-[200px] select-none items-center gap-2 border-r border-t px-3 text-xs transition-all duration-200 ease-out focus:outline-none',
          isActive
            ? 'z-10 border-[var(--color-accent)] bg-[var(--color-bg)] text-[var(--color-accent)]'
            : 'border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-fg)]',
          isDragging && 'opacity-50',
        )}
        title={tab.path}
      >
        {showDropIndicator && (
          <div className="absolute -left-px top-0 bottom-0 w-[2px] bg-[var(--color-accent)] shadow-[0_0_8px_var(--color-glow)]" />
        )}

        {isActive && (
          <div className="absolute inset-x-0 -top-px h-[2px] bg-[var(--color-accent)] shadow-[0_0_8px_var(--color-glow)]" />
        )}

        <div className="flex h-4 w-4 shrink-0 items-center justify-center">
          {isLoading ? (
            <svg
              className="h-3 w-3 animate-spin text-[var(--color-accent)]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <span className={clsx('opacity-70', isActive && 'opacity-100')}>
              {icon === 'home' ? '⌂' : '📁'}
            </span>
          )}
        </div>

        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleEditConfirm}
            onKeyDown={handleEditKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 min-w-0 bg-[var(--color-bg)] border border-[var(--color-accent)] px-1 py-0.5 text-xs font-medium tracking-wide text-[var(--color-fg)] outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
        ) : (
          <span className="flex-1 truncate font-medium tracking-wide">{title}</span>
        )}

        <div
          className={clsx(
            'flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100',
            isActive && 'opacity-100',
            isEditing && 'hidden',
          )}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPin(e);
            }}
            className={clsx(
              'flex h-4 w-4 items-center justify-center rounded hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-fg)]',
              isPinned ? 'text-[var(--color-accent)] opacity-100' : 'opacity-50',
            )}
            title={isPinned ? 'Unpin Tab' : 'Pin Tab'}
          >
            {isPinned ? '📌' : '📍'}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose(e);
            }}
            className="flex h-4 w-4 items-center justify-center rounded hover:bg-red-500/20 hover:text-red-500"
            title="Close Tab"
          >
            ×
          </button>
        </div>

        {isActive && (
          <>
            <div className="absolute bottom-0 right-0 h-1 w-1 border-b border-r border-[var(--color-accent)] opacity-50" />
            <div className="absolute bottom-0 left-0 h-1 w-1 border-b border-l border-[var(--color-accent)] opacity-50" />
          </>
        )}

        {!isActive && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--color-accent-dim)] to-transparent -translate-x-full animate-[scanline_1s_ease-in-out_infinite] opacity-10" />
          </div>
        )}
      </div>

      {contextMenu && (
        <ContextMenu items={contextMenuItems} position={contextMenu} onClose={closeContextMenu} />
      )}
    </>
  );
}
