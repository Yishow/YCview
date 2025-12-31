import { Header } from './components/layout/Header';
import { MainLayout } from './components/layout/MainLayout';
import { STORE_SCAFFOLD_VERSION } from './stores';

export default function App() {
  return (
    <MainLayout
      header={<Header title="WinCV Modern" currentPath="C:\\ (placeholder)" />}
      toolbar={
        <div className="flex items-center gap-2 px-3 py-2 text-xs">
          <span className="rounded border border-[var(--color-border)] px-2 py-1">Copy (C)</span>
          <span className="rounded border border-[var(--color-border)] px-2 py-1">Move (M)</span>
          <span className="rounded border border-[var(--color-border)] px-2 py-1">Delete (D)</span>
          <span className="rounded border border-[var(--color-border)] px-2 py-1">Rename (R)</span>
          <span className="rounded border border-[var(--color-border)] px-2 py-1">
            NewFolder (F3)
          </span>
          <span className="rounded border border-[var(--color-border)] px-2 py-1">
            Refresh (F5)
          </span>
        </div>
      }
      statusBar={
        <div className="flex items-center justify-between gap-3 px-3 py-2 text-xs opacity-80">
          <div>StatusBar (placeholder)</div>
          <div>Store scaffold v{STORE_SCAFFOLD_VERSION}</div>
        </div>
      }
    >
      <div className="grid h-full grid-cols-2">
        <section className="border-r border-[var(--color-border)] p-3">
          Left Panel (placeholder)
        </section>
        <section className="p-3">Right Panel (placeholder)</section>
      </div>
    </MainLayout>
  );
}
