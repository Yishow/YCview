import { STORE_SCAFFOLD_VERSION } from './stores';

export default function App() {
  return (
    <div className="flex h-screen flex-col">
      <header className="border-b border-[var(--color-border)] p-3">
        <div className="font-bold">WinCV Modern</div>
        <div className="text-xs opacity-80">Tailwind 已載入（placeholder）</div>
      </header>

      <main className="grid flex-1 grid-cols-2">
        <section className="border-r border-[var(--color-border)] p-3">
          Left Panel (placeholder)
        </section>
        <section className="p-3">Right Panel (placeholder)</section>
      </main>

      <footer className="border-t border-[var(--color-border)] p-2 text-xs">
        StatusBar (placeholder) · Store scaffold v{STORE_SCAFFOLD_VERSION}
      </footer>
    </div>
  );
}
