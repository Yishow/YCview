import { PathBar } from './PathBar';

/**
 * FilePanel 組件
 *
 * 聚合 PathBar（路徑列）與 FileList（檔案列表）的容器組件。
 * 支援焦點狀態視覺回饋，當左右面板切換時提供明確的視覺提示。
 *
 * @remarks
 * MVP 階段使用 placeholder 組件，後續會替換為完整實作。
 */

type FilePanelProps = {
  /** 面板是否為焦點狀態 */
  isFocused?: boolean;
  /** 當前路徑（傳遞給 PathBar） */
  currentPath?: string;
  /** 點擊面板時的回調（用於切換焦點） */
  onClick?: () => void;
};

/**
 * FileList Placeholder 組件
 *
 * 顯示檔案列表（虛擬滾動列表）
 */
function FileList() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <div className="text-4xl opacity-30">📂</div>
      <div className="text-sm opacity-60">檔案列表 (placeholder)</div>
      <div className="text-xs opacity-40">FileList 虛擬列表將在後續任務中實作</div>
    </div>
  );
}

/**
 * FilePanel 容器組件
 *
 * 整合路徑列與檔案列表，並提供焦點狀態的視覺回饋。
 * 焦點時會顯示強調邊框與微妙的背景色調變化。
 */
export function FilePanel({ isFocused = false, currentPath, onClick }: FilePanelProps) {
  return (
    <div
      className={`
        flex h-full flex-col
        transition-all duration-300 ease-out
        ${isFocused ? 'ring-2 ring-[var(--color-accent)] ring-offset-0' : 'ring-1 ring-transparent'}
      `}
      onClick={onClick}
      role="region"
      aria-label={isFocused ? '當前聚焦的檔案面板' : '檔案面板'}
      tabIndex={0}
      data-testid={`file-panel-${isFocused ? 'focused' : 'unfocused'}`}
    >
      {/* 焦點指示器 - 頂部細線 */}
      <div
        className={`
          h-0.5 w-full
          transition-all duration-300
          ${
            isFocused
              ? 'bg-[var(--color-accent)] opacity-100 shadow-sm'
              : 'bg-transparent opacity-0'
          }
        `}
      />

      {/* 面板內容區 */}
      <div
        className={`
          flex flex-1 flex-col overflow-hidden
          transition-all duration-300
          ${isFocused ? 'bg-[var(--color-accent)]/[0.02]' : 'bg-transparent'}
        `}
      >
        {/* 路徑列 */}
        <PathBar path={currentPath ?? 'C:\\'} />

        {/* 檔案列表 */}
        <div className="flex-1 overflow-hidden">
          <FileList />
        </div>
      </div>
    </div>
  );
}
