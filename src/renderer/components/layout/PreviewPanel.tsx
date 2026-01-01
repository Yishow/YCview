import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ImagePreview } from '../preview/ImagePreview';
import { TextPreview } from '../preview/TextPreview';

interface PreviewPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  filePath: string | null;
  onResize?: (width: number) => void;
}

const DEFAULT_WIDTH = 400;
const MIN_WIDTH = 300;
const MAX_WIDTH = 800;

export function PreviewPanel({ isOpen, onToggle, filePath, onResize }: PreviewPanelProps) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const [content, setContent] = useState<string>('');
  const sidebarRef = useRef<HTMLDivElement>(null);

  const extension = filePath ? filePath.split('.').pop()?.toLowerCase() : '';

  const getFileType = (ext: string) => {
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico'].includes(ext)) return 'image';
    if (
      [
        'txt',
        'md',
        'json',
        'xml',
        'csv',
        'log',
        'js',
        'ts',
        'jsx',
        'tsx',
        'css',
        'html',
        'py',
        'sh',
      ].includes(ext)
    )
      return 'text';
    return 'unknown';
  };

  const fileType = getFileType(extension || '');

  useEffect(() => {
    if (isOpen && filePath && fileType === 'text') {
      const timer = setTimeout(() => {
        setContent(
          `Loading ${filePath}...\n\nfunction demo() {\n  console.log("Hello from ${filePath}");\n  return true;\n}`,
        );
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [filePath, isOpen, fileType]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = window.innerWidth - e.clientX;
      const clampedWidth = Math.min(Math.max(newWidth, MIN_WIDTH), MAX_WIDTH);

      setWidth(clampedWidth);
      onResize?.(clampedWidth);
    },
    [isResizing, onResize],
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  if (!isOpen) return null;

  return (
    <div
      ref={sidebarRef}
      className="fixed right-0 top-10 bottom-8 z-40 flex flex-col border-l border-[#333] bg-[#1a1a1a]/95 backdrop-blur-xl shadow-2xl transition-all duration-75 ease-out"
      style={{ width: isResizing ? width : width }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-[var(--color-accent)] active:bg-[var(--color-accent)] z-50 transition-colors delay-75 group"
        onMouseDown={handleMouseDown}
      >
        <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 h-8 w-1 rounded-full bg-[#555] opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="flex h-10 items-center justify-between border-b border-[#333] px-4 bg-[#222]">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="text-xs font-bold text-[#888]">PREVIEW</span>
          <span className="text-[#444]">|</span>
          <span className="truncate text-xs text-[#ccc]" title={filePath || ''}>
            {filePath?.split(/[/\\]/).pop()}
          </span>
        </div>
        <button
          onClick={onToggle}
          className="rounded-sm p-1 hover:bg-[#333] hover:text-[var(--color-accent)] transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {!filePath ? (
          <div className="flex h-full flex-col items-center justify-center text-[#555] gap-2">
            <div className="text-4xl opacity-20">∅</div>
            <div className="text-xs tracking-widest uppercase">No File Selected</div>
          </div>
        ) : fileType === 'image' ? (
          <ImagePreview key={filePath} src={filePath} alt={filePath.split(/[/\\]/).pop()} />
        ) : fileType === 'text' ? (
          <TextPreview key={filePath} content={content} language={extension} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-[#555] gap-4">
            <div className="h-16 w-16 border border-dashed border-[#444] flex items-center justify-center rounded-lg">
              <span className="text-xs font-mono">{extension?.toUpperCase()}</span>
            </div>
            <div className="text-xs tracking-widest uppercase">Preview Unavailable</div>
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20 mix-blend-overlay" />
    </div>
  );
}
