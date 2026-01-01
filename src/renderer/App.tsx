import { useState } from 'react';
import { FilePanel } from './components/layout/FilePanel';
import { Header } from './components/layout/Header';
import { MainLayout } from './components/layout/MainLayout';
import { StatusBar } from './components/layout/StatusBar';
import { Toolbar } from './components/layout/Toolbar';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

export default function App() {
  const [focusedPanel, setFocusedPanel] = useState<'left' | 'right'>('left');

  const handleCopy = () => console.log('[TODO] Copy');
  const handleMove = () => console.log('[TODO] Move');
  const handleDelete = () => console.log('[TODO] Delete');
  const handleRename = () => console.log('[TODO] Rename');
  const handleNewFolder = () => console.log('[TODO] NewFolder');
  const handleRefresh = () => console.log('[TODO] Refresh');
  const handleEnter = () => console.log('[TODO] Enter/Open');
  const handleBackspace = () => console.log('[TODO] Backspace/GoUp');

  useKeyboardShortcuts({
    handlers: {
      onCopy: handleCopy,
      onMove: handleMove,
      onDelete: handleDelete,
      onRename: handleRename,
      onEnter: handleEnter,
      onBackspace: handleBackspace,
      onNewFolder: handleNewFolder,
      onRefresh: handleRefresh,
    },
  });

  return (
    <MainLayout
      header={<Header title="WinCV Modern" currentPath="C:\\ (placeholder)" />}
      toolbar={
        <Toolbar
          hasSelection={false}
          onCopy={handleCopy}
          onMove={handleMove}
          onDelete={handleDelete}
          onRename={handleRename}
          onNewFolder={handleNewFolder}
          onRefresh={handleRefresh}
        />
      }
      statusBar={<StatusBar />}
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
