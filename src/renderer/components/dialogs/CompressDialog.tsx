import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

export interface CompressOptions {
  format: 'zip' | 'tar' | 'tar.gz';
  level: number;
  password?: string;
  destinationPath: string;
}

interface CompressDialogProps {
  isOpen: boolean;
  onClose: () => void;
  files: string[];
  defaultDestination: string;
  onCompress: (options: CompressOptions) => void;
}

type Format = 'zip' | 'tar' | 'tar.gz';

export const CompressDialog = ({
  isOpen,
  onClose,
  files,
  defaultDestination,
  onCompress,
}: CompressDialogProps) => {
  const [format, setFormat] = useState<Format>('zip');
  const [level, setLevel] = useState<number>(5);
  const [password, setPassword] = useState('');
  const [destination, setDestination] = useState(defaultDestination);
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

  const handleCompress = () => {
    setIsProcessing(true);
    onCompress({
      format,
      level,
      password: password || undefined,
      destinationPath: destination,
    });
  };

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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h2 className="text-lg font-bold uppercase tracking-wider text-[var(--color-accent)]">
            Compress Files
          </h2>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-[var(--color-surface)]/50 border border-[var(--color-border)] rounded p-3 flex items-start gap-3">
            <div className="mt-1 w-2 h-2 rounded-full bg-[var(--color-accent)] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-wide text-[var(--color-fg)]/50 mb-1">
                Selected Items ({files.length})
              </p>
              <p
                className="text-xs font-mono text-[var(--color-fg)] truncate"
                title={files.join(', ')}
              >
                {files.length === 1 ? files[0] : `${files.length} items selected`}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg)]/70">
              Archive Format
            </label>
            <div className="flex gap-2">
              {(['zip', 'tar', 'tar.gz'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={clsx(
                    'flex-1 py-2 px-3 text-xs font-mono uppercase tracking-wide border transition-all duration-200 relative overflow-hidden group',
                    format === fmt
                      ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10'
                      : 'border-[var(--color-border)] text-[var(--color-fg)]/60 hover:border-[var(--color-fg)]/40 hover:text-[var(--color-fg)] bg-[var(--color-bg)]',
                  )}
                >
                  {format === fmt && (
                    <div className="absolute inset-0 bg-[var(--color-accent)]/5 animate-pulse" />
                  )}
                  <span className="relative z-10">{fmt}</span>
                </button>
              ))}
            </div>
          </div>

          {format === 'zip' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg)]/70">
                  Compression Level
                </label>
                <span className="text-xs font-mono text-[var(--color-accent)]">
                  {level === 0 ? 'Store' : level === 9 ? 'Ultra' : level}
                </span>
              </div>
              <div className="relative h-6 flex items-center">
                <input
                  type="range"
                  min="0"
                  max="9"
                  step="1"
                  value={level}
                  onChange={(e) => setLevel(parseInt(e.target.value))}
                  className="w-full h-1 bg-[var(--color-border)] rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)] focus:outline-none focus:ring-0"
                />
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[var(--color-accent)] pointer-events-none rounded-l-lg"
                  style={{ width: `${(level / 9) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg)]/70">
              Output Filename
            </label>
            <Input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="/path/to/archive.zip"
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
                    d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                  />
                </svg>
              }
            />
          </div>

          {format === 'zip' && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg)]/70">
                Password (Optional)
              </label>
              <Input
                type="password"
                placeholder="Enter password to encrypt"
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
          )}
        </div>

        <div className="p-6 pt-0 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCompress}
            disabled={!destination || isProcessing}
            className={clsx(isProcessing && 'animate-pulse')}
          >
            {isProcessing ? 'Compressing...' : 'Start Compression'}
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
