import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../common/Button';

interface ProgressDialogProps {
  isOpen: boolean;
  title: string;
  progress: number;
  currentFile: string;
  speed: string;
  eta: string;
  onCancel: () => void;
}

export const ProgressDialog = ({
  isOpen,
  title,
  progress,
  currentFile,
  speed,
  eta,
  onCancel,
}: ProgressDialogProps) => {
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

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in-fade">
      <div className="glass-panel w-[480px] p-6 rounded-lg shadow-2xl border border-[var(--color-border)] animate-in-scale relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[var(--color-accent)]" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[var(--color-accent)]" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[var(--color-accent)]" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[var(--color-accent)]" />

        <h3 className="text-lg font-bold uppercase tracking-wider text-[var(--color-accent)] mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-[var(--color-accent)] animate-pulse" />
          {title}
        </h3>

        <div className="space-y-4">
          <div className="relative h-2 bg-[var(--color-surface)] overflow-hidden rounded-full border border-[var(--color-border)]">
            <div
              className="absolute top-0 left-0 h-full bg-[var(--color-accent)] transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-[scanline_2s_linear_infinite]" />
            </div>
          </div>

          <div className="flex justify-between text-xs text-[var(--color-fg)] opacity-70 font-mono">
            <span>{Math.round(progress)}%</span>
            <span>{speed}</span>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-[var(--color-fg)] opacity-50 uppercase tracking-wide">
              Processing:
            </p>
            <p className="text-sm font-mono truncate text-[var(--color-fg)]" title={currentFile}>
              {currentFile}
            </p>
          </div>

          <div className="flex justify-between items-end pt-2">
            <div className="text-xs text-[var(--color-fg)] opacity-50 font-mono">ETA: {eta}</div>
            <Button variant="secondary" size="sm" onClick={onCancel}>
              Cancel Operation
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
