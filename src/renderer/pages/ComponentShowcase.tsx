import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { ContextMenu, type ContextMenuItem } from '../components/common/ContextMenu';
import { Tooltip } from '../components/common/Tooltip';
import { useState } from 'react';

export function ComponentShowcase() {
  const [searchValue, setSearchValue] = useState('');
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  const menuItems: ContextMenuItem[] = [
    { label: 'Open', shortcut: 'Enter', onClick: () => console.log('Open') },
    { label: 'Open in New Tab', shortcut: 'Cmd+T' },
    { separator: true },
    {
      label: 'View',
      children: [
        { label: 'List', shortcut: 'Cmd+1' },
        { label: 'Grid', shortcut: 'Cmd+2' },
        { label: 'Columns', shortcut: 'Cmd+3' },
      ],
    },
    { label: 'Sort By', children: [{ label: 'Name' }, { label: 'Date' }, { label: 'Size' }] },
    { separator: true },
    { label: 'Delete', shortcut: 'Del', danger: true, icon: <span>🗑️</span> },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-12 text-[var(--color-fg)] font-sans selection:bg-[var(--color-accent)] selection:text-black">
      <div className="mb-12 border-b border-[var(--color-border)] pb-6">
        <h1 className="text-4xl font-bold uppercase tracking-tighter mb-2">System Components</h1>
        <p className="text-[var(--color-accent)] text-sm font-mono tracking-widest opacity-80">
          // INDUSTRIAL_UI_V2.0 // READY
        </p>
      </div>

      <div className="space-y-16 max-w-5xl">
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-[var(--color-border)] flex-1" />
            <h2 className="text-sm font-mono uppercase tracking-widest opacity-50">
              Interactables // Buttons
            </h2>
            <div className="h-px bg-[var(--color-border)] flex-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase opacity-70">Primary & Variants</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary">Initialize</Button>
                <Button variant="secondary">Configure</Button>
                <Button variant="ghost">Cancel</Button>
                <Button variant="danger">Terminate</Button>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase opacity-70">Sizes</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase opacity-70">States</h3>
              <div className="flex flex-wrap gap-4">
                <Button disabled>Disabled</Button>
                <Button loading>Processing</Button>
                <Button variant="secondary" loading>
                  Loading
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase opacity-70">With Icons</h3>
              <div className="flex flex-wrap gap-4">
                <Button leftIcon={<span>←</span>}>Back</Button>
                <Button rightIcon={<span>→</span>}>Next</Button>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-[var(--color-border)] flex-1" />
            <h2 className="text-sm font-mono uppercase tracking-widest opacity-50">
              Data Entry // Inputs
            </h2>
            <div className="h-px bg-[var(--color-border)] flex-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold opacity-60">System ID</label>
              <Input placeholder="Enter unique identifier..." />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold opacity-60">Passcode</label>
              <Input type="password" placeholder="••••••••" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold opacity-60">Search Database</label>
              <Input
                type="search"
                placeholder="Query system..."
                clearable
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-red-500">Error State</label>
              <Input
                error="Invalid Configuration"
                placeholder="Value..."
                defaultValue="Invalid Value"
              />
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-[var(--color-border)] flex-1" />
            <h2 className="text-sm font-mono uppercase tracking-widest opacity-50">
              Overlays // Tooltip & Context
            </h2>
            <div className="h-px bg-[var(--color-border)] flex-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase opacity-70">Tooltips</h3>
              <div className="flex gap-4">
                <Tooltip content="System Info">
                  <Button size="sm" variant="secondary">
                    Hover Me
                  </Button>
                </Tooltip>

                <Tooltip content="Danger Zone" position="bottom">
                  <Button size="sm" variant="danger">
                    Hover Bottom
                  </Button>
                </Tooltip>

                <Tooltip content="Quick Access" position="right">
                  <div className="w-8 h-8 border border-[var(--color-border)] flex items-center justify-center cursor-help hover:bg-[var(--color-accent-dim)] transition-colors">
                    ?
                  </div>
                </Tooltip>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase opacity-70">Context Menu</h3>
              <div
                onContextMenu={handleContextMenu}
                className="h-32 border border-dashed border-[var(--color-border)] flex items-center justify-center bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-context-menu"
              >
                <span className="text-sm font-mono opacity-50">
                  Right-click in this area to initialize menu protocol
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {contextMenuPos && (
        <ContextMenu
          items={menuItems}
          position={contextMenuPos}
          onClose={() => setContextMenuPos(null)}
        />
      )}
    </div>
  );
}
