import { useEffect, useState, useCallback } from 'react';
import { FilePanel } from './components/layout/FilePanel';
import { Header } from './components/layout/Header';
import { MainLayout } from './components/layout/MainLayout';
import { StatusBar } from './components/layout/StatusBar';
import { Toolbar } from './components/layout/Toolbar';
import { PreviewPanel } from './components/layout/PreviewPanel';
import { HashDialog } from './components/dialogs/HashDialog';
import { CompareDialog } from './components/dialogs/CompareDialog';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { initializeThemeSystem } from './stores/settings-store';
import { useSelectionStore } from './stores/selection-store';

export default function App() {
  const [focusedPanel, setFocusedPanel] = useState<'left' | 'right'>('left');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewFilePath, setPreviewFilePath] = useState<string | null>(null);
  const [isHashDialogOpen, setIsHashDialogOpen] = useState(false);
  const [isCompareDialogOpen, setIsCompareDialogOpen] = useState(false);

  const selectedItems = useSelectionStore((state) => state.selectedItems);
  const hasSelection = selectedItems.size > 0;
  const selectedFilesArray = Array.from(selectedItems);

  useEffect(() => {
    const cleanup = initializeThemeSystem();
    return cleanup;
  }, []);

  const handleCopy = () => console.log('[TODO] Copy');
  const handleMove = () => console.log('[TODO] Move');
  const handleDelete = () => console.log('[TODO] Delete');
  const handleRename = () => console.log('[TODO] Rename');
  const handleNewFolder = () => console.log('[TODO] NewFolder');
  const handleRefresh = () => console.log('[TODO] Refresh');
  const handleEnter = () => console.log('[TODO] Enter/Open');
  const handleBackspace = () => console.log('[TODO] Backspace/GoUp');

  const handleTogglePreview = useCallback(() => {
    setIsPreviewOpen((prev) => !prev);
    if (selectedFilesArray.length > 0) {
      setPreviewFilePath(selectedFilesArray[0]);
    }
  }, [selectedFilesArray]);

  const handleHash = useCallback(() => {
    if (hasSelection) {
      setIsHashDialogOpen(true);
    }
  }, [hasSelection]);

  const handleCompare = useCallback(() => {
    if (hasSelection) {
      setIsCompareDialogOpen(true);
    }
  }, [hasSelection]);

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
      onTogglePreview: handleTogglePreview,
      onHash: handleHash,
      onCompare: handleCompare,
    },
  });

  return (
    <>
      <MainLayout
        header={<Header title="WinCV Modern" currentPath="C:\\ (placeholder)" />}
        toolbar={
          <Toolbar
            hasSelection={hasSelection}
            isPreviewOpen={isPreviewOpen}
            onCopy={handleCopy}
            onMove={handleMove}
            onDelete={handleDelete}
            onRename={handleRename}
            onNewFolder={handleNewFolder}
            onRefresh={handleRefresh}
            onHash={handleHash}
            onCompare={handleCompare}
            onTogglePreview={handleTogglePreview}
          />
        }
        statusBar={<StatusBar />}
        previewPanel={
          <PreviewPanel
            isOpen={isPreviewOpen}
            onToggle={handleTogglePreview}
            filePath={previewFilePath}
          />
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

      <HashDialog
        isOpen={isHashDialogOpen}
        onClose={() => setIsHashDialogOpen(false)}
        files={selectedFilesArray}
      />

      <CompareDialog
        isOpen={isCompareDialogOpen}
        onClose={() => setIsCompareDialogOpen(false)}
        file1={selectedFilesArray[0]}
        file2={selectedFilesArray[1]}
      />
    </>
  );
}
