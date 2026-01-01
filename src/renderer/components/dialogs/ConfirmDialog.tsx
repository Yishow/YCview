import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { Button } from '../common/Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const isDanger = variant === 'danger';
  const textColor = isDanger ? 'text-red-500' : 'text-[var(--color-accent)]';

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isDanger) {
      onCancel();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in-fade"
      onClick={handleBackdropClick}
    >
      <div className="glass-panel w-[400px] p-6 rounded-lg shadow-2xl border border-[var(--color-border)] animate-in-scale relative overflow-hidden">
        <div
          className={clsx(
            'absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-50',
            textColor,
          )}
        />

        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-current opacity-50" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-current opacity-50" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-current opacity-50" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-current opacity-50" />

        <h3 className={clsx('text-lg font-bold uppercase tracking-wider mb-4', textColor)}>
          {title}
        </h3>

        <p className="text-[var(--color-fg)] opacity-80 mb-8 leading-relaxed font-light">
          {message}
        </p>

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button variant={isDanger ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
