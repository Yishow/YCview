import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTabStore } from '../../stores/tab-store';
import { Tab } from './Tab';

export function TabBar() {
  const { tabs, activeTabId, switchTab, removeTab, pinTab, unpinTab, addTab, moveTab, updateTab } =
    useTabStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [draggedTabId, setDraggedTabId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleCloseTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeTab(id);
  };

  const handlePinTab = (e: React.MouseEvent, id: string, isPinned: boolean) => {
    e.stopPropagation();
    if (isPinned) {
      unpinTab(id);
    } else {
      pinTab(id);
    }
  };

  const handleTitleChange = useCallback(
    (id: string, newTitle: string) => {
      updateTab(id, { title: newTitle });
    },
    [updateTab],
  );

  const handleDragStart = useCallback((e: React.DragEvent, tabId: string) => {
    setDraggedTabId(tabId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', tabId);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, targetIndex: number) => {
      e.preventDefault();
      if (draggedTabId) {
        setDragOverIndex(targetIndex);
      }
    },
    [draggedTabId],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, targetIndex: number) => {
      e.preventDefault();
      if (draggedTabId) {
        moveTab(draggedTabId, targetIndex);
      }
      setDraggedTabId(null);
      setDragOverIndex(null);
    },
    [draggedTabId, moveTab],
  );

  const handleDragEnd = useCallback(() => {
    setDraggedTabId(null);
    setDragOverIndex(null);
  }, []);

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
  }, [tabs]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

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

  const hasOverflow = canScrollLeft || canScrollRight;

  return (
    <div className="flex w-full items-end border-b border-[var(--color-border)] bg-[var(--color-bg)] pt-1 relative">
      <button
        onClick={() => scroll('left')}
        disabled={!canScrollLeft}
        className={`
          flex h-9 w-6 shrink-0 items-center justify-center border-b border-t border-[var(--color-border)] 
          bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] transition-all
          hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-accent)] focus:outline-none disabled:opacity-30 disabled:hover:text-[var(--color-text-secondary)]
          ${canScrollLeft ? 'border-r' : 'border-r-0 w-0 px-0 overflow-hidden opacity-0'}
        `}
        aria-label="Scroll Left"
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
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <div
        ref={containerRef}
        onScroll={checkScroll}
        className="flex flex-1 overflow-x-auto overflow-y-hidden scrollbar-none scroll-smooth"
      >
        <div className="flex h-full items-end">
          {tabs.map((tab, index) => (
            <Tab
              key={tab.id}
              tab={tab}
              tabIndex={index}
              totalTabs={tabs.length}
              isActive={tab.id === activeTabId}
              onClick={() => switchTab(tab.id)}
              onClose={(e) => handleCloseTab(e, tab.id)}
              onPin={(e) => handlePinTab(e, tab.id, tab.isPinned)}
              onTitleChange={(newTitle) => handleTitleChange(tab.id, newTitle)}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              isDragging={draggedTabId === tab.id}
              dragOverIndex={dragOverIndex}
            />
          ))}
        </div>
      </div>

      <button
        onClick={() => scroll('right')}
        disabled={!canScrollRight}
        className={`
          flex h-9 w-6 shrink-0 items-center justify-center border-b border-t border-l border-[var(--color-border)] 
          bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] transition-all
          hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-accent)] focus:outline-none disabled:opacity-30 disabled:hover:text-[var(--color-text-secondary)]
          ${canScrollRight ? '' : 'w-0 px-0 overflow-hidden opacity-0 border-l-0'}
        `}
        aria-label="Scroll Right"
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
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {hasOverflow && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={`
              flex h-9 w-9 shrink-0 items-center justify-center border-b border-l border-t border-[var(--color-border)] 
              bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] transition-colors 
              hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-accent)] focus:outline-none
              ${showDropdown ? 'bg-[var(--color-bg-hover)] text-[var(--color-accent)]' : ''}
            `}
            title="List all tabs"
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
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-1 z-50 w-64 max-h-[60vh] overflow-y-auto rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl backdrop-blur-md">
              <div className="py-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      switchTab(tab.id);
                      setShowDropdown(false);
                    }}
                    className={`
                      flex w-full items-center gap-2 px-3 py-2 text-xs text-left transition-colors
                      ${
                        tab.id === activeTabId
                          ? 'bg-[var(--color-accent-dim)] text-[var(--color-accent)] border-l-2 border-l-[var(--color-accent)]'
                          : 'text-[var(--color-fg)] hover:bg-[var(--color-bg-hover)] border-l-2 border-l-transparent'
                      }
                    `}
                  >
                    <span className="w-4 flex justify-center shrink-0">
                      {tab.icon === 'home' ? '⌂' : '📁'}
                    </span>
                    <span className="truncate">{tab.title}</span>
                    {tab.isPinned && <span className="ml-auto opacity-50">📌</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => addTab()}
        className="flex h-9 w-9 shrink-0 items-center justify-center border-b border-l border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-accent)] focus:outline-none"
        title="New Tab"
        aria-label="New Tab"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
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
  );
}
