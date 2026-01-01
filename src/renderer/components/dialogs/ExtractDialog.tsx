import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

export interface ExtractOptions {
  destinationPath: string;
  password?: string;
  overwrite: boolean;
}

interface ExtractDialogProps {
  isOpen: boolean;
  onClose: () => void;
  archivePath: string;
  defaultDestination: string;
  onExtract: (options: ExtractOptions) => void;
}

export const ExtractDialog = ({
  isOpen,
  onClose,
  archivePath,
  defaultDestination,
  onExtract,
}: ExtractDialogProps) => {
  const [destination, setDestination] = useState(defaultDestination);
  const [password, setPassword] = useState('');
  const [overwrite, setOverwrite] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isProcessing) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, isProcessing]);

  const handleExtract = () => {
    setIsProcessing(true);
    onExtract({
      destinationPath: destination,
      password: password || undefined,
      overwrite,
    });
  };

  const archiveName = archivePath.split('/').pop() || archivePath;

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in-fade">
      <div className="glass-panel w-[500px] p-0 rounded-lg shadow-2xl border border-[var(--color-border)] animate-in-scale relative overflow-hidden flex flex-col">
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[var(--color-accent)] pointer-events-none" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[var(--color-accent)] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[var(--color-accent)] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[var(--color-accent)] pointer-events-none" />

        <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center gap-3 bg-[var(--color-bg)]/30">
          <div className="w-8 h-8 rounded bg-[var(--color-accent)]/10 flex items-center justify-center text-[var(--color-accent)] shrink-0 animate-pulse">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
          </div>
          <h2 className="text-lg font-bold uppercase tracking-wider text-[var(--color-accent)]">
            Extract Archive
          </h2>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-[var(--color-surface)]/50 border border-[var(--color-border)] rounded p-3 flex items-start gap-3">
            <div className="mt-1 w-2 h-2 rounded-full bg-[var(--color-accent)] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-wide text-[var(--color-fg)]/50 mb-1">
                Archive File
              </p>
              <p className="text-xs font-mono text-[var(--color-fg)] truncate" title={archivePath}>
                {archiveName}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg)]/70">
              Destination Folder
            </label>
            <Input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="/path/to/extract/"
              size="md"
              leftIcon={
                <svg
                  className="w-4 h-4 text-[var(--color-fg)]/50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg)]/70">
              Password (If encrypted)
            </label>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size="md"
              leftIcon={
                <svg
                  className="w-4 h-4 text-[var(--color-fg)]/50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              }
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={overwrite}
                onChange={(e) => setOverwrite(e.target.checked)}
                className="peer sr-only"
              />
              <div
                className={clsx(
                  'w-5 h-5 border rounded transition-all duration-200 flex items-center justify-center',
                  overwrite
                    ? 'bg-[var(--color-accent)] border-[var(--color-accent)]'
                    : 'bg-[var(--color-bg)] border-[var(--color-border)] group-hover:border-[var(--color-accent)]',
                )}
              >
                <svg
                  className={clsx(
                    'w-3 h-3 text-white transition-transform duration-200',
                    overwrite ? 'scale-100' : 'scale-0',
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="absolute inset-0 bg-[var(--color-accent)]/20 rounded scale-0 peer-focus:scale-150 transition-transform duration-200 -z-10" />
            </div>
            <span className="text-xs font-medium text-[var(--color-fg)] group-hover:text-[var(--color-accent)] transition-colors duration-200">
              Overwrite existing files
            </span>
          </label>
        </div>

        <div className="p-6 pt-0 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleExtract}
            disabled={!destination || isProcessing}
            className={clsx(isProcessing && 'animate-pulse')}
          >
            {isProcessing ? 'Extracting...' : 'Start Extraction'}
          </Button>
        </div>

        {isProcessing && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] z-10 flex items-end">
            <div className="w-full h-1 bg-[var(--color-accent)] animate-[scanline_1.5s_linear_infinite]" />
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};
