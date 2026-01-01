import { type ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

export interface ContextMenuItem {
  label?: string;
  icon?: ReactNode;
  shortcut?: string;
  disabled?: boolean;
  onClick?: () => void;
  separator?: boolean;
  children?: ContextMenuItem[];
  danger?: boolean;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  position: { x: number; y: number };
  onClose: () => void;
  className?: string;
}

const SubMenu = ({ item, parentOpen }: { item: ContextMenuItem; parentOpen: boolean }) => {
  if (!item.children || item.children.length === 0) return null;

  return (
    <div
      className={clsx(
        'absolute left-full top-0 min-w-[180px] p-1 glass-panel shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all duration-200 origin-top-left',
        parentOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible',
      )}
    >
      {item.children.map((child, idx) => (
        <ContextMenuItemRow key={idx} item={child} />
      ))}
    </div>
  );
};

const ContextMenuItemRow = ({ item, onClick }: { item: ContextMenuItem; onClick?: () => void }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (item.separator) {
    return <div className="h-[1px] my-1 bg-[var(--color-border)] opacity-50" />;
  }

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={() => {
          if (item.disabled) return;
          if (item.children) return;
          item.onClick?.();
          onClick?.();
        }}
        disabled={item.disabled}
        className={clsx(
          'w-full flex items-center justify-between px-3 py-1.5 text-xs text-left transition-colors duration-150',
          item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          item.danger
            ? 'text-red-500 hover:bg-red-500/10'
            : 'text-[var(--color-fg)] hover:bg-[var(--color-accent)] hover:text-black',
          'focus:outline-none',
        )}
      >
        <div className="flex items-center gap-2">
          {item.icon && (
            <span className="w-4 h-4 flex items-center justify-center">{item.icon}</span>
          )}
          <span className="font-medium tracking-wide">{item.label}</span>
        </div>

        <div className="flex items-center gap-3 ml-4">
          {item.shortcut && (
            <kbd
              className={clsx(
                'inline-flex items-center justify-center px-1 min-w-[16px]',
                'text-[9px] font-mono font-medium uppercase tracking-wide',
                'bg-[var(--color-surface)] border border-[var(--color-border)]',
                'rounded-[2px] shadow-[0_1px_0_var(--color-border)]',
                'opacity-60',
                !item.disabled && !item.danger && 'group-hover:opacity-100 group-hover:text-black',
              )}
            >
              {item.shortcut}
            </kbd>
          )}
          {item.children && (
            <svg
              className="w-3 h-3 opacity-70"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </div>
      </button>

      {item.children && <SubMenu item={item} parentOpen={isHovered} />}
    </div>
  );
};

export const ContextMenu = ({ items, position, onClose, className }: ContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const style = {
    top: position.y,
    left: position.x,
  };

  return createPortal(
    <div
      ref={menuRef}
      style={style}
      className={clsx(
        'fixed z-50 min-w-[200px] p-1 glass-panel shadow-[0_4px_30px_rgba(0,0,0,0.6)] animate-in-fade animate-in-scale origin-top-left',
        className,
      )}
    >
      <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t border-l border-[var(--color-accent)] opacity-50" />
      <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b border-r border-[var(--color-accent)] opacity-50" />

      {items.map((item, index) => (
        <ContextMenuItemRow key={index} item={item} onClick={onClose} />
      ))}
    </div>,
    document.body,
  );
};
