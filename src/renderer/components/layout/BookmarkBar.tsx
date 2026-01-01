import { useRef, useState, useEffect } from 'react';
import { BookmarkItem } from './BookmarkItem';
import { useTabStore } from '../../stores/tab-store';
import { useBookmarks } from '../../hooks/useBookmarks';
import { AddBookmarkDialog } from '../dialogs/AddBookmarkDialog';

export function BookmarkBar() {
  const { bookmarks, removeBookmark, updateBookmark, addBookmark, handleDrop } = useBookmarks();
  const { addTab } = useTabStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addDialogPath, setAddDialogPath] = useState('');

  const checkScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      checkScroll();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    checkScroll();

    return () => {
      observer.disconnect();
    };
  }, [bookmarks]);

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = 200;
      const targetScroll =
        containerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      containerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth',
      });
    }
  };

  const handleBookmarkClick = (path: string) => {
    addTab(path);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'link';
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const items = e.dataTransfer.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].kind === 'file') {
            const file = items[i].getAsFile();
            if (file && 'path' in file) {
              handleDrop(e.nativeEvent, (file as File & { path: string }).path);
            }
          }
        }
      }

      const path = e.dataTransfer.getData('text/plain');
      if (path) {
        handleDrop(e.nativeEvent, path);
      }
    } catch (err) {
      console.error('Failed to handle drop', err);
    }
  };

  const openAddDialog = (path: string = '') => {
    setAddDialogPath(path || '/Users/yishow/NewFolder');
    setIsAddDialogOpen(true);
  };

  const handleAddConfirm = (name: string, color: string) => {
    addBookmark({
      name,
      path: addDialogPath,
      icon: '📁',
      color,
    });
  };

  return (
    <>
      <div
        className="flex w-full items-center border-b border-[var(--color-border)] bg-[var(--color-bg)] h-9 relative z-10"
        onDragOver={handleDragOver}
        onDrop={onDrop}
      >
        <div className="flex h-full w-8 shrink-0 items-center justify-center border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
          <span className="opacity-50 text-xs">★</span>
        </div>

        <button
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          className={`
            flex h-full w-6 shrink-0 items-center justify-center border-r border-[var(--color-border)] 
            bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] transition-all
            hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-accent)] focus:outline-none disabled:opacity-30
            ${canScrollLeft ? '' : 'w-0 px-0 overflow-hidden opacity-0 border-r-0'}
          `}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div
          ref={containerRef}
          onScroll={checkScroll}
          className="flex flex-1 items-center gap-1 overflow-x-auto overflow-y-hidden scrollbar-none scroll-smooth px-1"
        >
          {bookmarks.map((bookmark) => (
            <BookmarkItem
              key={bookmark.id}
              bookmark={bookmark}
              onClick={handleBookmarkClick}
              onEdit={(id, name) => updateBookmark(id, { name })}
              onDelete={removeBookmark}
              onOpenInNewTab={addTab}
            />
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          className={`
            flex h-full w-6 shrink-0 items-center justify-center border-l border-[var(--color-border)] 
            bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] transition-all
            hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-accent)] focus:outline-none disabled:opacity-30
            ${canScrollRight ? '' : 'w-0 px-0 overflow-hidden opacity-0 border-l-0'}
          `}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        <button
          onClick={() => openAddDialog()}
          className="flex h-full w-8 shrink-0 items-center justify-center border-l border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-accent)] focus:outline-none"
          title="Add Bookmark"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {isAddDialogOpen && (
        <AddBookmarkDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onConfirm={handleAddConfirm}
          initialPath={addDialogPath}
        />
      )}
    </>
  );
}
