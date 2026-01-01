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

interface StatIndicatorProps {
  active: boolean;
  variant?: 'circle' | 'square';
}

const StatIndicator = memo(function StatIndicator({
  active,
  variant = 'circle',
}: StatIndicatorProps) {
  const baseClass = `h-1.5 w-1.5 transition-all duration-300 ${variant === 'circle' ? 'rounded-full' : 'rounded-none'}`;
  const activeClass =
    variant === 'circle'
      ? 'bg-[var(--color-accent)] shadow-[0_0_8px_var(--color-accent)] scale-110'
      : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] scale-110';
  const inactiveClass = 'bg-[var(--color-border)] opacity-50';

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
    <div className="relative h-2 w-20 overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)]">
      <div className="absolute inset-0 flex items-center justify-between px-[1px]">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-full w-px bg-[var(--color-bg)] z-20 opacity-50" />
        ))}
      </div>
      <div
        className={`absolute inset-y-0 left-0 transition-all duration-500 ${colorClass.replace('text-', 'bg-')}`}
        style={{ width: `${Math.min(usagePercent, 100)}%` }}
      />
      <div className="absolute inset-y-0 w-8 animate-[scanline_2s_linear_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent z-10" />
    </div>
  );
});

function getDiskStatusColor(usagePercent: number): string {
  if (usagePercent > 90) return 'text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]';
  if (usagePercent > 75) return 'text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]';
  return 'text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]';
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
    <div className="group relative flex items-center justify-between overflow-hidden border-t border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-1.5 text-[10px] select-none">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 3px)',
        }}
      />

      <div className="relative flex items-center gap-6">
        <div className="flex items-center gap-2 group/item">
          <div className="opacity-40 group-hover/item:text-[var(--color-accent)] transition-colors">
            FILE.SYS
          </div>
          <div className="h-3 w-px bg-[var(--color-border)] opacity-50" />
          <div className="flex items-center gap-2">
            <span className="opacity-50">FILES:</span>
            <span className="font-mono font-medium text-[var(--color-fg)] bg-[var(--color-surface)] px-1 rounded-sm border border-[var(--color-border)] border-opacity-50 min-w-[30px] text-center">
              {formatNumber(stats.fileCount)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="opacity-50">DIRS:</span>
            <span className="font-mono font-medium text-[var(--color-fg)] bg-[var(--color-surface)] px-1 rounded-sm border border-[var(--color-border)] border-opacity-50 min-w-[30px] text-center">
              {formatNumber(stats.directoryCount)}
            </span>
          </div>
        </div>
      </div>

      <div className="relative flex items-center gap-6">
        <div className="flex items-center gap-2">
          <StatIndicator active={debouncedSelectedCount > 0} variant="circle" />
          <span className="opacity-50">SEL:</span>
          <span
            className={`font-mono transition-colors ${
              debouncedSelectedCount > 0 ? 'text-[var(--color-accent)] font-bold' : 'opacity-50'
            }`}
          >
            {formatNumber(debouncedSelectedCount)}
          </span>
        </div>

        <div className="h-3 w-px bg-[var(--color-border)] opacity-50" />

        <div className="flex items-center gap-2">
          <StatIndicator active={debouncedMarkedCount > 0} variant="square" />
          <span className="opacity-50">MKD:</span>
          <span
            className={`font-mono transition-colors ${
              debouncedMarkedCount > 0 ? 'text-emerald-500 font-bold' : 'opacity-50'
            }`}
          >
            {formatNumber(debouncedMarkedCount)}
          </span>
          {markedSize > 0 && (
            <span className="font-mono opacity-60">({formatFileSize(markedSize)})</span>
          )}
        </div>
      </div>

      <div className="relative flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="opacity-50">DISK:</span>
          <DiskProgressBar
            usagePercent={diskStats.diskUsagePercent}
            colorClass={diskStats.diskColorClass}
          />
          <span className={`font-mono ${diskStats.diskColorClass}`}>
            {Math.round(diskStats.diskUsagePercent)}%
          </span>
        </div>

        <div className="h-3 w-px bg-[var(--color-border)] opacity-50" />

        <div className="flex items-center gap-1 opacity-40">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="font-mono tracking-widest uppercase text-[9px]">ONLINE</span>
        </div>
      </div>
    </div>
  );
});
