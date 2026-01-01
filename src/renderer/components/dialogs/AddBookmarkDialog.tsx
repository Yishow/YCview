import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface AddBookmarkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string, color: string) => void;
  initialPath: string;
  initialName?: string;
}

const COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Cyan', value: '#06b6d4' },
];

export const AddBookmarkDialog = ({
  isOpen,
  onClose,
  onConfirm,
  initialPath,
  initialName = '',
}: AddBookmarkDialogProps) => {
  const [name, setName] = useState(initialName || initialPath.split('/').pop() || 'Bookmark');
  const [color, setColor] = useState(COLORS[0].value);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    onConfirm(name.trim(), color);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in-fade"
      onClick={handleBackdropClick}
    >
      <div className="glass-panel w-[480px] rounded-lg shadow-2xl border border-[var(--color-border)] animate-in-scale relative overflow-hidden flex flex-col">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent opacity-50" />
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[var(--color-accent)] opacity-50" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[var(--color-accent)] opacity-50" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[var(--color-accent)] opacity-50" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[var(--color-accent)] opacity-50" />

        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center rounded bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold uppercase tracking-wider text-[var(--color-accent)]">
              Add Bookmark
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded text-[var(--color-fg)]/50 hover:text-[var(--color-fg)] hover:bg-[var(--color-border)]/30 transition-colors duration-200"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg)]/60">
              Path
            </label>
            <div className="px-3 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded text-sm text-[var(--color-fg)]/50 font-mono truncate">
              {initialPath}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg)]/60">
              Name
            </label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Bookmark Name"
              autoFocus
              error={error}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg)]/60">
              Color
            </label>
            <div className="flex flex-wrap gap-3">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={clsx(
                    'w-8 h-8 rounded-full transition-all duration-200 relative group',
                    color === c.value
                      ? 'ring-2 ring-offset-2 ring-offset-[var(--color-bg)]'
                      : 'hover:scale-110',
                  )}
                  style={{
                    backgroundColor: c.value,
                    boxShadow: color === c.value ? `0 0 10px ${c.value}80` : 'none',
                    borderColor: color === c.value ? c.value : 'transparent',
                  }}
                  title={c.name}
                >
                  {color === c.value && (
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Bookmark
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};
