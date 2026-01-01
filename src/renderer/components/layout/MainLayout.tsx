import type { ReactNode } from 'react';

type MainLayoutProps = {
  header?: ReactNode;
  tabBar?: ReactNode;
  toolbar?: ReactNode;
  statusBar?: ReactNode;
  children?: ReactNode;
};

export function MainLayout({ header, tabBar, toolbar, statusBar, children }: MainLayoutProps) {
  return (
    <div className="relative flex h-screen flex-col bg-[var(--color-bg)] text-[var(--color-fg)] overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03] z-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[radial-gradient(circle_at_center,var(--color-accent)_0%,transparent_70%)] z-0" />

      <header className="relative z-10 border-b border-[var(--color-border)] shadow-sm">
        {header}
      </header>

      {tabBar && (
        <div className="relative z-10 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          {tabBar}
        </div>
      )}

      <div className="relative z-10 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-sm">
        {toolbar}
      </div>

      <main className="relative flex-1 overflow-hidden z-0">
        <div className="absolute inset-0 pointer-events-none border-[20px] border-transparent border-t-[var(--color-bg)]/10" />
        {children}
      </main>

      <footer className="relative z-10 border-t border-[var(--color-border)] bg-[var(--color-bg)]">
        {statusBar}
      </footer>
    </div>
  );
}
