import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { Button } from '../common/Button';
import {
  useSettingsStore,
  type ThemeMode,
  type SortBy,
  type SortOrder,
} from '../../stores/settings-store';

type TabId = 'appearance' | 'fileList' | 'behavior';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabConfig[] = [
  {
    id: 'appearance',
    label: 'Appearance',
    icon: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
  },
  {
    id: 'fileList',
    label: 'File List',
    icon: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    id: 'behavior',
    label: 'Behavior',
    icon: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const ToggleSwitch = ({ checked, onChange, disabled }: ToggleSwitchProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={clsx(
      'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200',
      'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)]',
      'disabled:cursor-not-allowed disabled:opacity-50',
      checked ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]',
    )}
  >
    <span
      className={clsx(
        'pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-200',
        checked ? 'translate-x-[18px]' : 'translate-x-[3px]',
      )}
    />
  </button>
);

interface SettingRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

const SettingRow = ({ label, description, children }: SettingRowProps) => (
  <div className="flex items-center justify-between py-3 border-b border-[var(--color-border)]/30 last:border-b-0">
    <div className="flex-1 pr-4">
      <div className="text-[var(--color-fg)] text-sm font-medium">{label}</div>
      {description && <div className="text-[var(--color-fg)]/50 text-xs mt-0.5">{description}</div>}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

const Select = ({ value, options, onChange, disabled }: SelectProps) => (
  <div className="relative group">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={clsx(
        'appearance-none bg-[var(--color-bg)] border border-[var(--color-border)] rounded px-3 py-1.5',
        'text-[var(--color-fg)] text-xs font-medium uppercase tracking-wide',
        'focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'cursor-pointer min-w-[120px] pr-8 transition-all duration-200',
        'hover:border-[var(--color-accent)]/50',
      )}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-fg)]/50">
      <svg
        className="w-3 h-3"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  </div>
);

const THEME_OPTIONS: SelectOption[] = [
  { value: 'system', label: 'System' },
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
];

const SORT_BY_OPTIONS: SelectOption[] = [
  { value: 'name', label: 'Name' },
  { value: 'size', label: 'Size' },
  { value: 'date', label: 'Date' },
  { value: 'extension', label: 'Extension' },
];

const SORT_ORDER_OPTIONS: SelectOption[] = [
  { value: 'asc', label: 'Ascending' },
  { value: 'desc', label: 'Descending' },
];

export const SettingsDialog = ({ isOpen, onClose }: SettingsDialogProps) => {
  const [activeTab, setActiveTab] = useState<TabId>('appearance');

  const {
    theme,
    showHiddenFiles,
    showFileSize,
    showFileDate,
    sortBy,
    sortOrder,
    foldersFirst,
    useTrashBin,
    confirmDelete,
    setTheme,
    setShowHiddenFiles,
    setShowFileSize,
    setShowFileDate,
    setSortBy,
    setSortOrder,
    setFoldersFirst,
    setUseTrashBin,
    setConfirmDelete,
  } = useSettingsStore();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  if (!isOpen) return null;

  const renderAppearanceTab = () => (
    <div className="space-y-1">
      <SettingRow label="Theme" description="Choose your preferred color scheme">
        <Select
          value={theme}
          options={THEME_OPTIONS}
          onChange={(value) => setTheme(value as ThemeMode)}
        />
      </SettingRow>
    </div>
  );

  const renderFileListTab = () => (
    <div className="space-y-1">
      <SettingRow label="Show Hidden Files" description="Display files starting with a dot">
        <ToggleSwitch checked={showHiddenFiles} onChange={setShowHiddenFiles} />
      </SettingRow>
      <SettingRow label="Show File Size" description="Display file size in the list">
        <ToggleSwitch checked={showFileSize} onChange={setShowFileSize} />
      </SettingRow>
      <SettingRow label="Show File Date" description="Display modification date in the list">
        <ToggleSwitch checked={showFileDate} onChange={setShowFileDate} />
      </SettingRow>
      <SettingRow label="Folders First" description="Show folders before files">
        <ToggleSwitch checked={foldersFirst} onChange={setFoldersFirst} />
      </SettingRow>
      <SettingRow label="Sort By" description="Default sorting criteria">
        <Select
          value={sortBy}
          options={SORT_BY_OPTIONS}
          onChange={(value) => setSortBy(value as SortBy)}
        />
      </SettingRow>
      <SettingRow label="Sort Order" description="Ascending or descending order">
        <Select
          value={sortOrder}
          options={SORT_ORDER_OPTIONS}
          onChange={(value) => setSortOrder(value as SortOrder)}
        />
      </SettingRow>
    </div>
  );

  const renderBehaviorTab = () => (
    <div className="space-y-1">
      <SettingRow
        label="Use Trash Bin"
        description="Move deleted files to trash instead of permanent deletion"
      >
        <ToggleSwitch checked={useTrashBin} onChange={setUseTrashBin} />
      </SettingRow>
      <SettingRow
        label="Confirm Delete"
        description="Show confirmation dialog before deleting files"
      >
        <ToggleSwitch checked={confirmDelete} onChange={setConfirmDelete} />
      </SettingRow>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'appearance':
        return renderAppearanceTab();
      case 'fileList':
        return renderFileListTab();
      case 'behavior':
        return renderBehaviorTab();
      default:
        return null;
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in-fade"
      onClick={handleBackdropClick}
    >
      <div className="glass-panel w-[560px] max-h-[80vh] rounded-lg shadow-2xl border border-[var(--color-border)] animate-in-scale relative overflow-hidden flex flex-col">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent opacity-50" />

        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[var(--color-accent)] opacity-50" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[var(--color-accent)] opacity-50" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[var(--color-accent)] opacity-50" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[var(--color-accent)] opacity-50" />

        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center rounded bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold uppercase tracking-wider text-[var(--color-accent)]">
              Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded text-[var(--color-fg)]/50 hover:text-[var(--color-fg)] hover:bg-[var(--color-border)]/30 transition-colors duration-200"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex border-b border-[var(--color-border)] bg-[var(--color-bg)]/50">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-200 relative',
                activeTab === tab.id
                  ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/5'
                  : 'text-[var(--color-fg)]/60 hover:text-[var(--color-fg)] hover:bg-[var(--color-fg)]/5',
              )}
            >
              <span className={clsx(activeTab === tab.id && 'text-[var(--color-accent)]')}>
                {tab.icon}
              </span>
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-accent)]" />
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-[300px]">{renderTabContent()}</div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-bg)]/50">
          <p className="text-[10px] uppercase tracking-wide text-[var(--color-fg)]/40">
            Changes are saved automatically
          </p>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
