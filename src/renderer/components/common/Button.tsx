import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from 'react';
import clsx from 'clsx';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      children,
      leftIcon,
      rightIcon,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'group relative inline-flex items-center justify-center font-bold uppercase tracking-wider transition-all duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 overflow-hidden';

    const variants = {
      primary:
        'bg-[var(--color-accent)] text-black border border-[var(--color-accent)] hover:shadow-[0_0_15px_var(--color-accent-dim)] active:translate-y-[1px]',
      secondary:
        'border border-[var(--color-border)] bg-transparent text-[var(--color-fg)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:shadow-[0_0_10px_var(--color-accent-dim)] active:translate-y-[1px]',
      ghost:
        'border border-transparent bg-transparent text-[var(--color-fg)] hover:bg-[var(--color-accent-dim)] hover:text-[var(--color-accent)] active:translate-y-[1px]',
      danger:
        'border border-red-500/50 text-red-500 bg-transparent hover:border-red-500 hover:bg-red-500/10 hover:shadow-[0_0_10px_rgba(239,68,68,0.2)] active:translate-y-[1px]',
    };

    const sizes = {
      sm: 'text-[10px] px-3 py-1 gap-1.5 h-7',
      md: 'text-xs px-5 py-2 gap-2 h-9',
      lg: 'text-sm px-7 py-3 gap-2.5 h-11',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {(variant === 'primary' || variant === 'secondary') && !disabled && !loading && (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[scanline_1s_ease-in-out_infinite]" />
        )}

        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
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
        )}
        {!loading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
        <span className="relative z-10">{children}</span>
        {!loading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}

        {(variant === 'primary' || variant === 'secondary') && (
          <>
            <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-current opacity-50" />
            <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-current opacity-50" />
          </>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
