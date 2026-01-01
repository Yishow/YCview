import type { ReactNode } from 'react';

type MainLayoutProps = {
  header?: ReactNode;
  tabBar?: ReactNode;
  toolbar?: ReactNode;
  statusBar?: ReactNode;
  previewPanel?: ReactNode;
  children?: ReactNode;
};

export function MainLayout({
  header,
  tabBar,
  toolbar,
  statusBar,
  previewPanel,
  children,
}: MainLayoutProps) {
  return (
    <div className="relative flex h-screen flex-col bg-[var(--color-bg)] text-[var(--color-fg)] overflow-hidden">
      {/* 戰術網格背景 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03] z-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* 中心輝光效果 */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[radial-gradient(circle_at_center,var(--color-accent)_0%,transparent_70%)] z-0" />

      {/* Header */}
      <header className="relative z-10 border-b border-[var(--color-border)] shadow-sm">
        {header}
      </header>

      {/* TabBar */}
      {tabBar && (
        <div className="relative z-10 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          {tabBar}
        </div>
      )}

      {/* Toolbar */}
      <div className="relative z-10 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-sm">
        {toolbar}
      </div>

      {/* Main content with optional preview panel */}
      <main className="relative flex-1 overflow-hidden z-0">
        <div className="absolute inset-0 pointer-events-none border-[20px] border-transparent border-t-[var(--color-bg)]/10" />
        <div className="flex h-full">
          {/* 主要內容區域 */}
          <div className="flex-1 overflow-hidden">{children}</div>
          {/* 預覽面板 (右側) */}
          {previewPanel}
        </div>
      </main>

      {/* Footer/StatusBar */}
      <footer className="relative z-10 border-t border-[var(--color-border)] bg-[var(--color-bg)]">
        {statusBar}
      </footer>
    </div>
  );
}
