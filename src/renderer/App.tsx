import { useState } from 'react';
import { FilePanel } from './components/layout/FilePanel';
import { Header } from './components/layout/Header';
import { MainLayout } from './components/layout/MainLayout';
import { Toolbar } from './components/layout/Toolbar';
import { STORE_SCAFFOLD_VERSION } from './stores';

export default function App() {
  const [focusedPanel, setFocusedPanel] = useState<'left' | 'right'>('left');

  return (
    <MainLayout
      header={<Header title="WinCV Modern" currentPath="C:\\ (placeholder)" />}
      toolbar={
        <Toolbar
          hasSelection={false}
          onCopy={() => console.log('[TODO] Copy')}
          onMove={() => console.log('[TODO] Move')}
          onDelete={() => console.log('[TODO] Delete')}
          onRename={() => console.log('[TODO] Rename')}
          onNewFolder={() => console.log('[TODO] NewFolder')}
          onRefresh={() => console.log('[TODO] Refresh')}
        />
      }
      statusBar={
        <div className="flex items-center justify-between gap-3 px-3 py-2 text-xs opacity-80">
          <div>StatusBar (placeholder)</div>
          <div>Store scaffold v{STORE_SCAFFOLD_VERSION}</div>
        </div>
      }
    >
      <div className="grid h-full grid-cols-2">
        <FilePanel
          isFocused={focusedPanel === 'left'}
          currentPath="C:\\Users\\User\\Documents"
          onClick={() => setFocusedPanel('left')}
        />
        <FilePanel
          isFocused={focusedPanel === 'right'}
          currentPath="D:\\Projects\\WinCV"
          onClick={() => setFocusedPanel('right')}
        />
      </div>
    </MainLayout>
  );
}
