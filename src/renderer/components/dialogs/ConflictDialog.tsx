import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../common/Button';
import type { ConflictStrategy } from '../../../shared/types';

interface ConflictDialogProps {
  isOpen: boolean;
  fileName: string;
  sourcePath: string;
  destPath: string;
  onResolve: (strategy: ConflictStrategy, applyToAll: boolean) => void;
  onCancel: () => void;
}

export const ConflictDialog = ({
  isOpen,
  fileName,
  sourcePath,
  destPath,
  onResolve,
  onCancel,
}: ConflictDialogProps) => {
  const [applyToAll, setApplyToAll] = useState(false);

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

  const handleResolve = (strategy: ConflictStrategy) => {
    onResolve(strategy, applyToAll);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in-fade">
      <div className="glass-panel w-[500px] p-6 rounded-lg shadow-2xl border border-[var(--color-border)] animate-in-scale relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50" />

        <h3 className="text-lg font-bold uppercase tracking-wider text-yellow-500 mb-4 flex items-center gap-2">
          <span>⚠️</span> File Conflict
        </h3>

        <div className="space-y-4 mb-6">
          <p className="text-[var(--color-fg)] opacity-80 leading-relaxed">
            A file named <span className="font-bold text-[var(--color-accent)]">{fileName}</span>{' '}
            already exists in the destination.
          </p>

          <div className="bg-[var(--color-bg)]/50 p-3 rounded border border-[var(--color-border)] text-xs font-mono space-y-2">
            <div className="flex justify-between">
              <span className="opacity-50">Source:</span>
              <span className="truncate max-w-[300px]" title={sourcePath}>
                {sourcePath}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-50">Destination:</span>
              <span className="truncate max-w-[300px]" title={destPath}>
                {destPath}
              </span>
            </div>
          </div>
        </div>

        <div
          className="flex items-center mb-6 cursor-pointer"
          onClick={() => setApplyToAll(!applyToAll)}
        >
          <div
            className={`w-4 h-4 border border-[var(--color-accent)] mr-2 flex items-center justify-center transition-all ${applyToAll ? 'bg-[var(--color-accent)]' : 'bg-transparent'}`}
          >
            {applyToAll && (
              <svg
                className="w-3 h-3 text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
          <span className="text-sm text-[var(--color-fg)] select-none">Apply to all conflicts</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Button variant="secondary" onClick={() => handleResolve('skip')}>
            Skip
          </Button>
          <Button variant="secondary" onClick={() => handleResolve('rename')}>
            Rename
          </Button>
          <Button variant="primary" onClick={() => handleResolve('overwrite')}>
            Overwrite
          </Button>
        </div>

        <div className="mt-4 flex justify-center">
          <button
            onClick={onCancel}
            className="text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
          >
            Cancel Operation
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
