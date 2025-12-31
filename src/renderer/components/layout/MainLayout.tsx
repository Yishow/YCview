import type { ReactNode } from 'react';

type MainLayoutProps = {
  header?: ReactNode;
  toolbar?: ReactNode;
  statusBar?: ReactNode;
  children?: ReactNode;
};

export function MainLayout({ header, toolbar, statusBar, children }: MainLayoutProps) {
  return (
    <div className="relative flex h-screen flex-col bg-[var(--color-bg)] text-[var(--color-fg)]">
      {/* subtle grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <header className="relative border-b border-[var(--color-border)]">{header}</header>
      <div className="relative border-b border-[var(--color-border)]">{toolbar}</div>

      <main className="relative flex-1 overflow-hidden">{children}</main>

      <footer className="relative border-t border-[var(--color-border)]">{statusBar}</footer>
    </div>
  );
}
