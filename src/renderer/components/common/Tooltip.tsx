import { type ReactNode, useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: TooltipPosition;
  delay?: number;
  className?: string;
  shortcut?: string;
}

export interface ShortcutBadgeProps {
  shortcut: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const ShortcutBadge = ({ shortcut, className, size = 'sm' }: ShortcutBadgeProps) => {
  const keys = shortcut.split('+').filter(Boolean);

  const sizeClasses = {
    sm: 'text-[9px] px-1 py-0.5 min-w-[16px]',
    md: 'text-[10px] px-1.5 py-0.5 min-w-[18px]',
  };

  return (
    <span className={clsx('inline-flex items-center gap-0.5', className)}>
      {keys.map((key, index) => (
        <span key={index} className="inline-flex items-center gap-0.5">
          <kbd
            className={clsx(
              'inline-flex items-center justify-center font-mono font-medium uppercase tracking-wide',
              'bg-[var(--color-surface)] border border-[var(--color-border)]',
              'text-[var(--color-fg)] opacity-80',
              'shadow-[0_1px_0_var(--color-border),inset_0_0_0_0.5px_rgba(255,255,255,0.1)]',
              'rounded-[2px]',
              sizeClasses[size],
            )}
          >
            {key.trim()}
          </kbd>
          {index < keys.length - 1 && (
            <span className="text-[8px] text-[var(--color-fg)] opacity-30 mx-0.5">+</span>
          )}
        </span>
      ))}
    </span>
  );
};

export const Tooltip = ({
  content,
  children,
  position = 'top',
  delay = 300,
  className,
  shortcut,
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const animationClasses = {
    top: 'origin-bottom animate-in-slide',
    bottom: 'origin-top animate-in-slide',
    left: 'origin-right animate-in-scale',
    right: 'origin-left animate-in-scale',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && (
        <div
          className={clsx(
            'absolute z-50 whitespace-nowrap px-2 py-1 text-[10px] uppercase font-bold tracking-wider',
            'bg-[var(--color-bg)] text-[var(--color-accent)] border border-[var(--color-accent)]',
            'shadow-[0_0_10px_var(--color-accent-dim)]',
            positionClasses[position],
            animationClasses[position],
            className,
          )}
        >
          <span className="flex items-center gap-2">
            <span>{content}</span>
            {shortcut && <ShortcutBadge shortcut={shortcut} />}
          </span>

          <div className="absolute inset-0 bg-[var(--color-accent)]/5 pointer-events-none" />
        </div>
      )}
    </div>
  );
};
