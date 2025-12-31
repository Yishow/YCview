export default function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <header style={{ padding: 12, borderBottom: '1px solid #333' }}>
        <div style={{ fontWeight: 700 }}>WinCV Modern</div>
        <div style={{ opacity: 0.8, fontSize: 12 }}>Renderer bootstrap placeholder</div>
      </header>

      <main style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1 }}>
        <section style={{ padding: 12, borderRight: '1px solid #333' }}>
          Left Panel (placeholder)
        </section>
        <section style={{ padding: 12 }}>Right Panel (placeholder)</section>
      </main>

      <footer style={{ padding: 8, borderTop: '1px solid #333', fontSize: 12 }}>
        StatusBar (placeholder)
      </footer>
    </div>
  );
}
