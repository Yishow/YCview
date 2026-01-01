import { type ReactNode, useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: TooltipPosition;
  delay?: number;
  className?: string;
}

export const Tooltip = ({
  content,
  children,
  position = 'top',
  delay = 300,
  className,
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
          {content}

          <div className="absolute inset-0 bg-[var(--color-accent)]/5 pointer-events-none" />
        </div>
      )}
    </div>
  );
};
