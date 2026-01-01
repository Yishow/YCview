import { type InputHTMLAttributes, forwardRef, type ReactNode, useCallback } from 'react';
import clsx from 'clsx';

export type InputSize = 'sm' | 'md' | 'lg';

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  size?: InputSize;
  error?: string | boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  clearable?: boolean;
  containerClassName?: string;
  onClear?: () => void;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      size = 'md',
      error,
      leftIcon,
      rightIcon,
      clearable,
      containerClassName,
      disabled,
      onClear,
      onChange,
      ...props
    },
    ref,
  ) => {
    const activeLeftIcon =
      leftIcon ||
      (type === 'search' ? (
        <svg
          className="h-4 w-4 text-[var(--color-fg)] opacity-50"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ) : null);

    const handleClear = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (onClear) {
          onClear();
        } else if (onChange) {
          const event = {
            target: { value: '' },
            currentTarget: { value: '' },
          } as React.ChangeEvent<HTMLInputElement>;
          onChange(event);
        }
      },
      [onClear, onChange],
    );

    const activeRightIcon =
      clearable && !disabled ? (
        <button
          type="button"
          onClick={handleClear}
          className="text-[var(--color-fg)] hover:text-[var(--color-accent)] opacity-50 hover:opacity-100 focus:outline-none transition-all duration-200"
          tabIndex={-1}
        >
          <svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      ) : (
        rightIcon
      );

    const sizes = {
      sm: 'text-[10px] py-1 h-7',
      md: 'text-xs py-2 h-9',
      lg: 'text-sm py-3 h-11',
    };

    const iconPaddingLeft = {
      sm: 'pl-8',
      md: 'pl-9',
      lg: 'pl-11',
    };

    const iconPaddingRight = {
      sm: 'pr-8',
      md: 'pr-9',
      lg: 'pr-11',
    };

    const standardPadding = 'px-3';

    const paddingClass = clsx(
      activeLeftIcon ? iconPaddingLeft[size] : standardPadding,
      activeRightIcon ? iconPaddingRight[size] : standardPadding,
    );

    const hasError = !!error;

    return (
      <div className={clsx('w-full', containerClassName)}>
        <div className="relative group">
          <input
            ref={ref}
            type={type}
            disabled={disabled}
            className={clsx(
              'block w-full bg-[var(--color-bg)] text-[var(--color-fg)] transition-colors duration-200',
              'placeholder:text-[var(--color-fg)] placeholder:opacity-30',
              'focus:outline-none',
              'border-b border-[var(--color-border)]',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--color-fg)]/5',
              hasError
                ? 'border-red-500 text-red-500 placeholder:text-red-500/50'
                : 'focus:bg-[var(--color-surface-hover)]',
              sizes[size],
              paddingClass,
              className,
            )}
            {...props}
          />

          <div
            className={clsx(
              'absolute bottom-0 left-0 h-[1px] w-full bg-[var(--color-accent)] origin-center scale-x-0 transition-transform duration-300 ease-out group-focus-within:scale-x-100',
              hasError && 'bg-red-500',
            )}
          />

          <div
            className={clsx(
              'absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-300 group-focus-within:opacity-100',
              hasError
                ? 'shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                : 'shadow-[0_0_15px_var(--color-accent-dim)]',
            )}
          />

          {activeLeftIcon && (
            <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center pl-2.5 pointer-events-none">
              {activeLeftIcon}
            </div>
          )}

          {activeRightIcon && (
            <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center pr-2.5">
              {activeRightIcon}
            </div>
          )}
        </div>
        {typeof error === 'string' && (
          <p className="mt-1 text-[10px] uppercase tracking-wide text-red-500 font-bold animate-in-slide">
            ⚠️ {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
