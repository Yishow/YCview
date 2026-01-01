import { memo, useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useSelectionStore } from '../../stores/selection-store';
import { formatFileSize, formatNumber } from '../../utils/format-utils';

export interface StatusBarStats {
  fileCount: number;
  directoryCount: number;
  totalSize: number;
  diskUsed: number;
  diskTotal: number;
  markedItemSizes?: Map<string, number>;
}

export interface StatusBarProps {
  stats?: StatusBarStats;
}

const DEFAULT_STATS: StatusBarStats = {
  fileCount: 27,
  directoryCount: 5,
  totalSize: 35_967_126,
  diskUsed: 771_846 * 1024 * 1024,
  diskTotal: 1_906_610 * 1024 * 1024,
  markedItemSizes: new Map(),
};

const DEBOUNCE_MS = 150;

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}

const FileIcon = memo(function FileIcon() {
  return (
    <svg
      className="h-3.5 w-3.5 text-[var(--color-fg)] opacity-50"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </svg>
  );
});

const FolderIcon = memo(function FolderIcon() {
  return (
    <svg
      className="h-3.5 w-3.5 text-amber-500/70"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
      />
    </svg>
  );
});

const Separator = memo(function Separator() {
  return <div className="h-3 w-px bg-[var(--color-border)] opacity-50" />;
});

interface StatIndicatorProps {
  active: boolean;
  variant?: 'circle' | 'square';
}

const StatIndicator = memo(function StatIndicator({
  active,
  variant = 'circle',
}: StatIndicatorProps) {
  const baseClass = `h-2 w-2 transition-colors ${variant === 'circle' ? 'rounded-full' : 'rounded-sm'}`;
  const activeClass =
    variant === 'circle'
      ? 'bg-[var(--color-accent)] shadow-[0_0_6px_var(--color-glow)]'
      : 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]';
  const inactiveClass = 'bg-[var(--color-border)]';

  return <div className={`${baseClass} ${active ? activeClass : inactiveClass}`} />;
});

interface DiskProgressBarProps {
  usagePercent: number;
  colorClass: string;
}

const DiskProgressBar = memo(function DiskProgressBar({
  usagePercent,
  colorClass,
}: DiskProgressBarProps) {
  return (
    <div className="relative h-1.5 w-16 overflow-hidden rounded-full bg-[var(--color-border)]/30">
      <div
        className={`absolute inset-y-0 left-0 rounded-full transition-all ${colorClass.replace('text-', 'bg-')}`}
        style={{ width: `${Math.min(usagePercent, 100)}%` }}
      />
      <div
        className="absolute inset-y-0 w-4 animate-[scanline_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"
        style={{ animationPlayState: 'running' }}
      />
    </div>
  );
});

function getDiskStatusColor(usagePercent: number): string {
  if (usagePercent > 90) return 'text-red-400';
  if (usagePercent > 75) return 'text-amber-400';
  return 'text-emerald-400';
}

interface SelectionCounts {
  selectedCount: number;
  markedCount: number;
  markedItems: Set<string>;
}

function useSelectionCounts(): SelectionCounts {
  return useSelectionStore(
    useShallow((state) => ({
      selectedCount: state.selectedItems.size,
      markedCount: state.markedItems.size,
      markedItems: state.markedItems,
    })),
  );
}

export const StatusBar = memo(function StatusBar({ stats = DEFAULT_STATS }: StatusBarProps) {
  const { selectedCount, markedCount, markedItems } = useSelectionCounts();

  const debouncedSelectedCount = useDebouncedValue(selectedCount, DEBOUNCE_MS);
  const debouncedMarkedCount = useDebouncedValue(markedCount, DEBOUNCE_MS);
  const debouncedMarkedItems = useDebouncedValue(markedItems, DEBOUNCE_MS);

  const markedSize = useMemo(() => {
    if (!stats.markedItemSizes || debouncedMarkedItems.size === 0) {
      return 0;
    }
    let total = 0;
    for (const path of debouncedMarkedItems) {
      total += stats.markedItemSizes.get(path) ?? 0;
    }
    return total;
  }, [debouncedMarkedItems, stats.markedItemSizes]);

  const diskStats = useMemo(() => {
    const diskFree = stats.diskTotal - stats.diskUsed;
    const diskUsagePercent = stats.diskTotal > 0 ? (stats.diskUsed / stats.diskTotal) * 100 : 0;
    const diskColorClass = getDiskStatusColor(diskUsagePercent);
    return { diskFree, diskUsagePercent, diskColorClass };
  }, [stats.diskTotal, stats.diskUsed]);

  return (
    <div className="group relative flex items-center justify-between overflow-hidden px-3 py-2">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 4px)',
        }}
      />

      <div className="relative flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-4 w-4 items-center justify-center">
            <FileIcon />
          </div>
          <span className="font-mono text-xs tabular-nums tracking-tight text-[var(--color-fg)]">
            <span className="opacity-60">檔案</span>
            <span className="mx-1 opacity-30">/</span>
            <span className="font-medium">{formatNumber(stats.fileCount)}</span>
          </span>
        </div>

        <Separator />

        <div className="flex items-center gap-2">
          <div className="flex h-4 w-4 items-center justify-center">
            <FolderIcon />
          </div>
          <span className="font-mono text-xs tabular-nums tracking-tight text-[var(--color-fg)]">
            <span className="opacity-60">目錄</span>
            <span className="mx-1 opacity-30">/</span>
            <span className="font-medium">{formatNumber(stats.directoryCount)}</span>
          </span>
        </div>
      </div>

      <div className="relative flex items-center gap-4">
        <div className="flex items-center gap-2">
          <StatIndicator active={debouncedSelectedCount > 0} variant="circle" />
          <span className="font-mono text-xs tabular-nums tracking-tight text-[var(--color-fg)]">
            <span className="opacity-60">選取</span>
            <span className="mx-1 opacity-30">/</span>
            <span
              className={
                debouncedSelectedCount > 0 ? 'font-medium text-[var(--color-accent)]' : 'opacity-50'
              }
            >
              {formatNumber(debouncedSelectedCount)}
            </span>
          </span>
        </div>

        <Separator />

        <div className="flex items-center gap-2">
          <StatIndicator active={debouncedMarkedCount > 0} variant="square" />
          <span className="font-mono text-xs tabular-nums tracking-tight text-[var(--color-fg)]">
            <span className="opacity-60">標記</span>
            <span className="mx-1 opacity-30">:</span>
            <span
              className={debouncedMarkedCount > 0 ? 'font-medium text-emerald-400' : 'opacity-50'}
            >
              {formatNumber(debouncedMarkedCount)}
            </span>
            <span className="mx-1 opacity-30">/</span>
            <span className={markedSize > 0 ? 'font-medium' : 'opacity-50'}>
              {formatFileSize(markedSize)}
            </span>
            <span className="mx-1 opacity-30">/</span>
            <span className="opacity-60">{formatFileSize(stats.totalSize)}</span>
          </span>
        </div>
      </div>

      <div className="relative flex items-center gap-3">
        <div className="flex items-center gap-2">
          <DiskProgressBar
            usagePercent={diskStats.diskUsagePercent}
            colorClass={diskStats.diskColorClass}
          />
          <span className="font-mono text-xs tabular-nums tracking-tight text-[var(--color-fg)]">
            <span className="opacity-60">剩餘</span>
            <span className="mx-1 opacity-30">:</span>
            <span className={`font-medium ${diskStats.diskColorClass}`}>
              {formatFileSize(diskStats.diskFree)}
            </span>
            <span className="mx-1 opacity-30">/</span>
            <span className="opacity-60">{formatFileSize(stats.diskTotal)}</span>
          </span>
        </div>

        <div className="h-3 w-px bg-[var(--color-border)] opacity-30" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-fg)] opacity-30">
          YCview
        </span>
      </div>
    </div>
  );
});
