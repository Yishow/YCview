import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface HashDialogProps {
  isOpen: boolean;
  onClose: () => void;
  files: string[];
}

type HashAlgorithm = 'MD5' | 'SHA1' | 'SHA256' | 'SHA512';

interface HashResult {
  fileName: string;
  hash: string;
  status: 'pending' | 'computing' | 'done';
}

const ALGORITHMS: HashAlgorithm[] = ['MD5', 'SHA1', 'SHA256', 'SHA512'];

const generateMockHash = (algo: HashAlgorithm, fileName: string): string => {
  const chars = '0123456789abcdef';
  const length = algo === 'MD5' ? 32 : algo === 'SHA1' ? 40 : algo === 'SHA256' ? 64 : 128;

  let hash = '';
  let seed = 0;
  for (let i = 0; i < fileName.length; i++) {
    seed = (seed << 5) - seed + fileName.charCodeAt(i);
    seed |= 0;
  }
  seed = Math.abs(seed + algo.length);

  for (let i = 0; i < length; i++) {
    hash += chars[(seed + i * 13) % 16];
  }
  return hash;
};

export const HashDialog = ({ isOpen, onClose, files }: HashDialogProps) => {
  const [selectedAlgo, setSelectedAlgo] = useState<HashAlgorithm>('SHA256');
  const [results, setResults] = useState<HashResult[]>([]);
  const [verifyInput, setVerifyInput] = useState('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let isActive = true;

    const startCalculation = async () => {
      // Small delay to ensure UI is ready and avoid synchronous state update warning
      await new Promise((resolve) => setTimeout(resolve, 0));

      if (!isActive) return;

      setResults(
        files.map((file) => ({
          fileName: file,
          hash: '',
          status: 'pending',
        })),
      );

      setVerifyInput('');

      for (let i = 0; i < files.length; i++) {
        if (!isActive) break;

        setResults((prev) => prev.map((r, idx) => (idx === i ? { ...r, status: 'computing' } : r)));

        const delay = Math.floor(Math.random() * 400) + 100;
        await new Promise((resolve) => setTimeout(resolve, delay));

        if (!isActive) break;

        setResults((prev) =>
          prev.map((r, idx) =>
            idx === i
              ? {
                  ...r,
                  status: 'done',
                  hash: generateMockHash(selectedAlgo, r.fileName),
                }
              : r,
          ),
        );
      }
    };

    startCalculation();

    return () => {
      isActive = false;
    };
  }, [isOpen, files, selectedAlgo]);

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 1500);
  };

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  const completedCount = results.filter((r) => r.status === 'done').length;
  const progress = files.length > 0 ? (completedCount / files.length) * 100 : 0;
  const isAllDone = completedCount === files.length;

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in-fade"
      onClick={handleBackdropClick}
    >
      <div className="glass-panel w-[800px] h-[600px] max-h-[90vh] rounded-lg shadow-2xl border border-[var(--color-border)] animate-in-scale relative overflow-hidden flex flex-col">
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[var(--color-accent)] opacity-60" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[var(--color-accent)] opacity-60" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[var(--color-accent)] opacity-60" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[var(--color-accent)] opacity-60" />

        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-[var(--color-accent)]/5 to-transparent bg-[length:100%_4px] animate-[scanline_3s_linear_infinite] opacity-30" />

        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] relative z-10 bg-[var(--color-bg)]/30 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded bg-[var(--color-accent)]/10 text-[var(--color-accent)] shadow-[0_0_10px_var(--color-accent-dim)]">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold uppercase tracking-wider text-[var(--color-accent)] drop-shadow-[0_0_5px_var(--color-accent-dim)]">
                Hash Verified
              </h2>
              <p className="text-[10px] uppercase tracking-wide text-[var(--color-fg)]/40 font-mono">
                Cryptographic Integrity Check
              </p>
            </div>
          </div>

          <div className="flex bg-[var(--color-bg)] rounded p-1 border border-[var(--color-border)]">
            {ALGORITHMS.map((algo) => (
              <button
                key={algo}
                onClick={() => setSelectedAlgo(algo)}
                className={clsx(
                  'px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all duration-200',
                  selectedAlgo === algo
                    ? 'bg-[var(--color-accent)] text-black shadow-[0_0_10px_var(--color-accent-dim)]'
                    : 'text-[var(--color-fg)]/50 hover:text-[var(--color-fg)] hover:bg-[var(--color-surface)]',
                )}
              >
                {algo}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden relative z-10">
          <div className="h-1 bg-[var(--color-surface)] w-full">
            <div
              className="h-full bg-[var(--color-accent)] transition-all duration-300 shadow-[0_0_10px_var(--color-accent-dim)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="grid grid-cols-[2fr_3fr_100px] gap-4 px-6 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface)] text-[10px] uppercase tracking-wider font-bold text-[var(--color-fg)]/50">
            <div>Filename</div>
            <div>{selectedAlgo} Checksum</div>
            <div className="text-right">Status</div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {results.map((result, index) => {
              const isMatch =
                verifyInput && result.hash.toLowerCase() === verifyInput.toLowerCase().trim();
              const isMismatch = verifyInput && result.status === 'done' && !isMatch;

              return (
                <div
                  key={index}
                  className={clsx(
                    'grid grid-cols-[2fr_3fr_100px] gap-4 px-4 py-3 rounded border transition-all duration-200 group relative overflow-hidden',
                    isMatch
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : isMismatch
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-[var(--color-bg)]/40 border-[var(--color-border)]/50 hover:border-[var(--color-accent)]/30 hover:bg-[var(--color-surface)]/50',
                  )}
                >
                  <div
                    className={clsx(
                      'absolute left-0 top-0 bottom-0 w-0.5 transition-colors',
                      result.status === 'done'
                        ? isMatch
                          ? 'bg-emerald-500'
                          : isMismatch
                            ? 'bg-red-500'
                            : 'bg-[var(--color-accent)]'
                        : 'bg-[var(--color-fg)]/20',
                    )}
                  />

                  <div className="truncate font-medium text-xs text-[var(--color-fg)]/90 flex items-center">
                    {result.fileName}
                  </div>

                  <div className="font-mono text-[10px] text-[var(--color-fg)]/70 truncate flex items-center relative group/hash">
                    {result.status === 'pending' && <span className="opacity-30">Pending...</span>}
                    {result.status === 'computing' && (
                      <span className="text-[var(--color-accent)] animate-pulse">Computing...</span>
                    )}
                    {result.status === 'done' && (
                      <>
                        <span
                          className={clsx(
                            'truncate select-all cursor-text',
                            isMatch && 'text-emerald-400 font-bold',
                            isMismatch && 'text-red-400',
                          )}
                        >
                          {result.hash}
                        </span>
                        <button
                          onClick={() => handleCopy(result.hash)}
                          className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover/hash:opacity-100 bg-[var(--color-surface)] px-2 py-0.5 rounded border border-[var(--color-border)] text-[10px] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-black transition-all shadow-lg"
                        >
                          {copiedHash === result.hash ? 'COPIED' : 'COPY'}
                        </button>
                      </>
                    )}
                  </div>

                  <div className="text-right flex justify-end items-center">
                    {result.status === 'computing' ? (
                      <svg
                        className="animate-spin h-4 w-4 text-[var(--color-accent)]"
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
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : result.status === 'done' ? (
                      isMatch ? (
                        <span className="text-emerald-400 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide">
                          <svg
                            className="w-3.5 h-3.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                          >
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                          Match
                        </span>
                      ) : isMismatch ? (
                        <span className="text-red-400 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide">
                          <svg
                            className="w-3.5 h-3.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                          >
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                          Mismatch
                        </span>
                      ) : (
                        <span className="text-[var(--color-accent)] text-[10px] font-bold uppercase tracking-wide">
                          Done
                        </span>
                      )
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-[var(--color-fg)]/20" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg)]/50 backdrop-blur-md relative z-20">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-[10px] uppercase tracking-wider text-[var(--color-fg)]/50 mb-1.5 flex justify-between">
                <span>Compare with hash</span>
                {verifyInput && (
                  <span
                    className={clsx(
                      'font-bold',
                      results.some((r) => r.hash.toLowerCase() === verifyInput.toLowerCase().trim())
                        ? 'text-emerald-400'
                        : 'text-red-400',
                    )}
                  >
                    {results.some((r) => r.hash.toLowerCase() === verifyInput.toLowerCase().trim())
                      ? 'MATCH FOUND'
                      : 'NO MATCH'}
                  </span>
                )}
              </label>
              <div className="relative group">
                <Input
                  value={verifyInput}
                  onChange={(e) => setVerifyInput(e.target.value)}
                  placeholder="Paste hash to verify..."
                  className="font-mono text-xs pr-20"
                  disabled={!isAllDone}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                  {verifyInput &&
                    (results.some(
                      (r) => r.hash.toLowerCase() === verifyInput.toLowerCase().trim(),
                    ) ? (
                      <div className="bg-emerald-500/20 text-emerald-400 p-1 rounded">
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      </div>
                    ) : (
                      <div className="bg-red-500/20 text-red-400 p-1 rounded">
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </div>
                    ))}
                </div>
              </div>
            </div>
            <Button variant="secondary" onClick={onClose} className="mb-[1px]">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
