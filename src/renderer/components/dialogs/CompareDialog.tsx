import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { Button } from '../common/Button';

interface CompareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  file1?: string;
  file2?: string;
}

type CompareMode = 'quick' | 'content' | 'text';

interface FileInfo {
  path: string;
  size: number;
  hash: string;
  modTime: string;
  content?: string;
}

const getMockFileInfo = (path: string): FileInfo => {
  const isCode =
    path.endsWith('.ts') || path.endsWith('.tsx') || path.endsWith('.js') || path.endsWith('.json');
  return {
    path,
    size: Math.floor(Math.random() * 1024 * 1024),
    hash: Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    modTime: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString(),
    content: isCode
      ? `import React from 'react';\n\nexport const Component = () => {\n  return <div>Hello World</div>;\n};\n`
      : undefined,
  };
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const CompareDialog = ({ isOpen, onClose, file1, file2 }: CompareDialogProps) => {
  const [mode, setMode] = useState<CompareMode>('quick');
  const [leftFile, setLeftFile] = useState<FileInfo | null>(null);
  const [rightFile, setRightFile] = useState<FileInfo | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (file1) setLeftFile(getMockFileInfo(file1));
        if (file2) setRightFile(getMockFileInfo(file2));
        if (!file1) setLeftFile(null);
        if (!file2) setRightFile(null);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, file1, file2]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSwap = () => {
    setLeftFile(rightFile);
    setRightFile(leftFile);
  };

  const handleCompare = () => {
    setIsComparing(true);
    setTimeout(() => setIsComparing(false), 800);
  };

  const comparisonResult = useMemo(() => {
    if (!leftFile || !rightFile) return null;

    const sameSize = leftFile.size === rightFile.size;
    const sameHash = leftFile.hash === rightFile.hash;

    return {
      sameSize,
      sameHash,
      identical: sameSize && sameHash,
    };
  }, [leftFile, rightFile]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in-fade">
      <div className="relative w-[1000px] h-[800px] max-h-[95vh] bg-[var(--color-bg)] rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-[var(--color-border)] flex flex-col overflow-hidden">
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[var(--color-accent)] pointer-events-none" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[var(--color-accent)] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[var(--color-accent)] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[var(--color-accent)] pointer-events-none" />

        <div className="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wIDJoNHYxSDB6IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] opacity-20 z-10" />

        <div className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 flex items-center justify-center bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/30 shadow-[0_0_10px_var(--color-accent-dim)]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold uppercase tracking-widest text-[var(--color-accent)] drop-shadow-[0_0_5px_var(--color-accent-dim)]">
                File Compare
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] uppercase tracking-wider text-[var(--color-fg)]/50 font-mono">
                  System Ready
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex p-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-sm">
              {(['quick', 'content', 'text'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={clsx(
                    'px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-300',
                    mode === m
                      ? 'bg-[var(--color-accent)] text-black shadow-[0_0_10px_var(--color-accent-dim)]'
                      : 'text-[var(--color-fg)]/50 hover:text-[var(--color-fg)]',
                  )}
                >
                  {m} Mode
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-[var(--color-fg)]/50 hover:text-red-500 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="relative z-20 flex-1 flex flex-col p-6 gap-6 overflow-hidden">
          <div className="flex items-stretch gap-4 h-32 shrink-0">
            <FileCard file={leftFile} label="Source A" onSelect={() => {}} active={!!leftFile} />

            <div className="flex flex-col justify-center">
              <button
                onClick={handleSwap}
                className="p-2 rounded border border-[var(--color-border)] text-[var(--color-fg)]/50 hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-all active:scale-95 bg-[var(--color-surface)]"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
              </button>
            </div>

            <FileCard
              file={rightFile}
              label="Target B"
              onSelect={() => {}}
              active={!!rightFile}
              alignRight
            />
          </div>

          <div className="flex justify-center py-2 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--color-border)] opacity-30"></div>
            </div>
            <div className="relative bg-[var(--color-bg)] px-4">
              <Button
                variant="primary"
                size="md"
                onClick={handleCompare}
                loading={isComparing}
                disabled={!leftFile || !rightFile}
                className="w-48"
              >
                Execute Compare
              </Button>
            </div>
          </div>

          <div className="flex-1 border border-[var(--color-border)] bg-[var(--color-surface)]/30 rounded relative overflow-hidden group">
            {!leftFile || !rightFile ? (
              <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 text-[var(--color-fg)]/30">
                <svg
                  className="w-16 h-16 opacity-20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="uppercase tracking-widest text-xs">
                  Select two files to initiate comparison
                </p>
              </div>
            ) : mode === 'text' ? (
              <MockTextDiff leftContent={leftFile.content} rightContent={rightFile.content} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-8 p-8">
                <div className="flex items-center gap-6">
                  <ResultIndicator
                    label="File Size"
                    match={comparisonResult?.sameSize}
                    valueA={formatBytes(leftFile.size)}
                    valueB={formatBytes(rightFile.size)}
                  />
                  <div className="h-12 w-px bg-[var(--color-border)]"></div>
                  <ResultIndicator
                    label="Hash Check"
                    match={comparisonResult?.sameHash}
                    valueA={leftFile.hash.substring(0, 8) + '...'}
                    valueB={rightFile.hash.substring(0, 8) + '...'}
                  />
                </div>

                <div
                  className={clsx(
                    'px-8 py-4 border-2 rounded backdrop-blur-md transition-all duration-500 transform',
                    comparisonResult?.identical
                      ? 'border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.2)]'
                      : 'border-red-500/50 bg-red-500/10 shadow-[0_0_30px_rgba(239,68,68,0.2)]',
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={clsx(
                        'w-12 h-12 rounded-full flex items-center justify-center text-2xl border',
                        comparisonResult?.identical
                          ? 'border-emerald-500 text-emerald-500'
                          : 'border-red-500 text-red-500',
                      )}
                    >
                      {comparisonResult?.identical ? '✓' : '✗'}
                    </div>
                    <div>
                      <h3
                        className={clsx(
                          'text-xl font-bold uppercase tracking-widest',
                          comparisonResult?.identical ? 'text-emerald-500' : 'text-red-500',
                        )}
                      >
                        {comparisonResult?.identical ? 'Match Confirmed' : 'Mismatch Detected'}
                      </h3>
                      <p className="text-[10px] uppercase tracking-wide text-[var(--color-fg)]/60 font-mono mt-1">
                        {comparisonResult?.identical
                          ? 'Files are bit-for-bit identical'
                          : 'Files differ in content or metadata'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px]" />
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-[var(--color-border)]/30 text-[10px] uppercase tracking-wider text-[var(--color-fg)]/40 font-mono">
            <span>Module: CP-2099</span>
            <span>Latency: 12ms</span>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

const FileCard = ({
  file,
  label,
  onSelect,
  active,
  alignRight,
}: {
  file: FileInfo | null;
  label: string;
  onSelect: () => void;
  active: boolean;
  alignRight?: boolean;
}) => (
  <div
    className={clsx(
      'flex-1 border rounded p-4 relative overflow-hidden transition-all duration-300 group hover:border-[var(--color-accent)]/50',
      active
        ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5'
        : 'border-[var(--color-border)] border-dashed bg-[var(--color-surface)]/50',
      alignRight && 'text-right',
    )}
  >
    <div
      className={clsx(
        'absolute top-0 w-16 h-1 bg-[var(--color-accent)] transition-all duration-300',
        active ? 'opacity-100' : 'opacity-0',
        alignRight ? 'right-0' : 'left-0',
      )}
    />

    <div className="flex flex-col h-full justify-between relative z-10">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-fg)]/40 block mb-2">
          {label}
        </span>
        {file ? (
          <>
            <div
              className="font-bold text-sm text-[var(--color-fg)] truncate font-mono"
              title={file.path}
            >
              {file.path.split('/').pop()}
            </div>
            <div className="text-[10px] text-[var(--color-fg)]/50 truncate font-mono mt-1">
              {file.path}
            </div>
          </>
        ) : (
          <div className="text-[var(--color-fg)]/30 italic text-sm">No file loaded</div>
        )}
      </div>

      {file && (
        <div
          className={clsx(
            'flex gap-4 text-[10px] font-mono text-[var(--color-fg)]/60 mt-4',
            alignRight && 'justify-end',
          )}
        >
          <span>{formatBytes(file.size)}</span>
          <span className="opacity-30">|</span>
          <span>{new Date(file.modTime).toLocaleDateString()}</span>
        </div>
      )}

      {!file && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" variant="secondary" onClick={onSelect}>
            Select File
          </Button>
        </div>
      )}
    </div>
  </div>
);

const ResultIndicator = ({
  label,
  match,
  valueA,
  valueB,
}: {
  label: string;
  match?: boolean;
  valueA: string;
  valueB: string;
}) => (
  <div className="flex flex-col items-center min-w-[120px]">
    <span className="text-[10px] uppercase tracking-wider text-[var(--color-fg)]/50 mb-2">
      {label}
    </span>
    <div
      className={clsx(
        'w-8 h-8 rounded flex items-center justify-center text-sm border mb-2 transition-colors duration-300',
        match
          ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-500'
          : 'border-red-500/50 bg-red-500/10 text-red-500',
      )}
    >
      {match ? '✓' : '≠'}
    </div>
    <div className="flex gap-2 text-[10px] font-mono text-[var(--color-fg)]/60">
      <span>{valueA}</span>
      <span className="opacity-30">vs</span>
      <span>{valueB}</span>
    </div>
  </div>
);

const MockTextDiff = ({
  leftContent,
  rightContent,
}: {
  leftContent?: string;
  rightContent?: string;
}) => {
  const linesA = (leftContent || '').split('\n');
  const linesB = (rightContent || '').split('\n');
  const maxLines = Math.max(linesA.length, linesB.length);

  return (
    <div className="h-full overflow-auto font-mono text-xs bg-[#0a0a0a]">
      <div className="flex border-b border-[var(--color-border)] sticky top-0 bg-[#0a0a0a] z-10">
        <div className="flex-1 p-2 text-center text-[var(--color-fg)]/40 border-r border-[var(--color-border)]">
          Source A
        </div>
        <div className="flex-1 p-2 text-center text-[var(--color-fg)]/40">Target B</div>
      </div>
      {Array.from({ length: Math.max(10, maxLines) }).map((_, i) => {
        const lineA = linesA[i] || '';
        const lineB = linesB[i] || '';
        const isDiff = lineA !== lineB;

        return (
          <div
            key={i}
            className={clsx(
              'flex hover:bg-[var(--color-surface)]/20 group',
              isDiff && 'bg-yellow-500/5',
            )}
          >
            <div className="w-8 shrink-0 text-right pr-2 text-[var(--color-fg)]/20 select-none border-r border-[var(--color-border)]/30 py-0.5">
              {i + 1}
            </div>

            <div
              className={clsx(
                'flex-1 px-2 whitespace-pre py-0.5 border-r border-[var(--color-border)]/30 overflow-hidden text-[var(--color-fg)]/80',
                isDiff && 'bg-red-500/10 text-red-400',
              )}
            >
              {lineA}
            </div>

            <div
              className={clsx(
                'flex-1 px-2 whitespace-pre py-0.5 overflow-hidden text-[var(--color-fg)]/80',
                isDiff && 'bg-emerald-500/10 text-emerald-400',
              )}
            >
              {lineB}
            </div>
          </div>
        );
      })}
    </div>
  );
};
