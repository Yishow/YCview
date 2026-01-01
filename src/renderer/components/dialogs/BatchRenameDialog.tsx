import { useState, useCallback, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import {
  generatePreview,
  createEmptyRule,
  getCaseModeName,
  type RenameRule,
  type RenamePreview,
} from '../../utils/rename-engine';

interface BatchRenameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  files: string[];
  onApply: (previews: RenamePreview[]) => void;
}

type RuleType = RenameRule['type'];

const RULE_TYPES: { value: RuleType; label: string }[] = [
  { value: 'findReplace', label: 'Find & Replace' },
  { value: 'prefix', label: 'Add Prefix' },
  { value: 'suffix', label: 'Add Suffix' },
  { value: 'sequence', label: 'Sequence Number' },
  { value: 'case', label: 'Change Case' },
  { value: 'removeChars', label: 'Remove Characters' },
];

const CASE_MODES: { value: 'upper' | 'lower' | 'title' | 'sentence'; label: string }[] = [
  { value: 'upper', label: 'UPPERCASE' },
  { value: 'lower', label: 'lowercase' },
  { value: 'title', label: 'Title Case' },
  { value: 'sentence', label: 'Sentence case' },
];

const SEQUENCE_POSITIONS: { value: 'prefix' | 'suffix' | 'replace'; label: string }[] = [
  { value: 'prefix', label: 'Prefix' },
  { value: 'suffix', label: 'Suffix' },
  { value: 'replace', label: 'Replace Name' },
];

interface RuleEditorProps {
  rule: RenameRule;
  index: number;
  onChange: (index: number, rule: RenameRule) => void;
  onRemove: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  isFirst: boolean;
  isLast: boolean;
}

const RuleEditor = ({
  rule,
  index,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: RuleEditorProps) => {
  const handleTypeChange = useCallback(
    (newType: RuleType) => {
      onChange(index, createEmptyRule(newType));
    },
    [index, onChange],
  );

  const renderRuleFields = () => {
    switch (rule.type) {
      case 'findReplace':
        return (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[var(--color-fg)]/50 mb-1">
                Find
              </label>
              <Input
                size="sm"
                value={rule.find}
                onChange={(e) => onChange(index, { ...rule, find: e.target.value })}
                placeholder="Search text..."
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[var(--color-fg)]/50 mb-1">
                Replace
              </label>
              <Input
                size="sm"
                value={rule.replace}
                onChange={(e) => onChange(index, { ...rule, replace: e.target.value })}
                placeholder="Replacement..."
              />
            </div>
            <div className="col-span-2 flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={rule.caseSensitive}
                  onChange={(e) => onChange(index, { ...rule, caseSensitive: e.target.checked })}
                  className="w-4 h-4 rounded border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-accent)] focus:ring-[var(--color-accent)] focus:ring-offset-0"
                />
                <span className="text-[var(--color-fg)]/70">Case Sensitive</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={rule.useRegex}
                  onChange={(e) => onChange(index, { ...rule, useRegex: e.target.checked })}
                  className="w-4 h-4 rounded border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-accent)] focus:ring-[var(--color-accent)] focus:ring-offset-0"
                />
                <span className="text-[var(--color-fg)]/70">Use Regex</span>
              </label>
            </div>
          </div>
        );

      case 'prefix':
      case 'suffix':
        return (
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[var(--color-fg)]/50 mb-1">
              {rule.type === 'prefix' ? 'Prefix' : 'Suffix'} Value
            </label>
            <Input
              size="sm"
              value={rule.value}
              onChange={(e) => onChange(index, { ...rule, value: e.target.value })}
              placeholder={`Enter ${rule.type}...`}
            />
          </div>
        );

      case 'sequence':
        return (
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[var(--color-fg)]/50 mb-1">
                Start
              </label>
              <Input
                size="sm"
                type="number"
                value={rule.start}
                onChange={(e) => onChange(index, { ...rule, start: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[var(--color-fg)]/50 mb-1">
                Step
              </label>
              <Input
                size="sm"
                type="number"
                value={rule.step}
                onChange={(e) => onChange(index, { ...rule, step: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[var(--color-fg)]/50 mb-1">
                Digits
              </label>
              <Input
                size="sm"
                type="number"
                min={1}
                max={10}
                value={rule.digits}
                onChange={(e) =>
                  onChange(index, {
                    ...rule,
                    digits: Math.max(1, Math.min(10, parseInt(e.target.value) || 1)),
                  })
                }
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[var(--color-fg)]/50 mb-1">
                Position
              </label>
              <select
                value={rule.position}
                onChange={(e) =>
                  onChange(index, {
                    ...rule,
                    position: e.target.value as 'prefix' | 'suffix' | 'replace',
                  })
                }
                className="w-full h-7 text-[10px] bg-[var(--color-bg)] border-b border-[var(--color-border)] text-[var(--color-fg)] focus:outline-none focus:border-[var(--color-accent)] px-2"
              >
                {SEQUENCE_POSITIONS.map((pos) => (
                  <option key={pos.value} value={pos.value}>
                    {pos.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 'case':
        return (
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[var(--color-fg)]/50 mb-1">
              Case Mode
            </label>
            <div className="flex gap-2">
              {CASE_MODES.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => onChange(index, { ...rule, mode: mode.value })}
                  className={clsx(
                    'px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-200',
                    'border',
                    rule.mode === mode.value
                      ? 'bg-[var(--color-accent)] text-black border-[var(--color-accent)]'
                      : 'border-[var(--color-border)] text-[var(--color-fg)]/70 hover:border-[var(--color-accent)]/50',
                  )}
                >
                  {getCaseModeName(mode.value)}
                </button>
              ))}
            </div>
          </div>
        );

      case 'removeChars':
        return (
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[var(--color-fg)]/50 mb-1">
              Characters to Remove
            </label>
            <Input
              size="sm"
              value={rule.chars}
              onChange={(e) => onChange(index, { ...rule, chars: e.target.value })}
              placeholder="e.g. -_ "
            />
            <p className="text-[10px] text-[var(--color-fg)]/40 mt-1">
              Enter characters without separator (e.g. -_ removes dash, underscore, space)
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-sm p-4 relative group">
      <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-accent)]/50" />
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[var(--color-accent)] opacity-50" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[var(--color-accent)] opacity-50" />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent)]">
            Rule {index + 1}
          </span>
          <select
            value={rule.type}
            onChange={(e) => handleTypeChange(e.target.value as RuleType)}
            className="h-7 text-xs bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-fg)] focus:outline-none focus:border-[var(--color-accent)] px-2 rounded-sm cursor-pointer uppercase tracking-wide font-bold"
          >
            {RULE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onMoveUp(index)}
            disabled={isFirst}
            className="p-1.5 text-[var(--color-fg)]/50 hover:text-[var(--color-accent)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Move Up"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </button>
          <button
            onClick={() => onMoveDown(index)}
            disabled={isLast}
            className="p-1.5 text-[var(--color-fg)]/50 hover:text-[var(--color-accent)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Move Down"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          <button
            onClick={() => onRemove(index)}
            className="p-1.5 text-[var(--color-fg)]/50 hover:text-red-500 transition-colors"
            title="Remove Rule"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {renderRuleFields()}
    </div>
  );
};

interface PreviewTableProps {
  previews: RenamePreview[];
}

const PreviewTable = ({ previews }: PreviewTableProps) => {
  if (previews.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--color-fg)]/40 text-sm">
        No files selected
      </div>
    );
  }

  return (
    <div className="overflow-auto h-full">
      <table className="w-full text-xs">
        <thead className="sticky top-0 bg-[var(--color-surface)]">
          <tr className="border-b border-[var(--color-border)]">
            <th className="text-left py-2 px-3 text-[10px] uppercase tracking-wider font-bold text-[var(--color-fg)]/50">
              Original Name
            </th>
            <th className="text-center px-2 text-[var(--color-fg)]/30 w-8">→</th>
            <th className="text-left py-2 px-3 text-[10px] uppercase tracking-wider font-bold text-[var(--color-fg)]/50">
              New Name
            </th>
            <th className="text-center py-2 px-3 text-[10px] uppercase tracking-wider font-bold text-[var(--color-fg)]/50 w-20">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {previews.map((preview, index) => (
            <tr
              key={index}
              className={clsx(
                'border-b border-[var(--color-border)]/30 transition-colors',
                preview.hasError && 'bg-red-500/10',
                preview.hasConflict && !preview.hasError && 'bg-amber-500/10',
              )}
            >
              <td className="py-2 px-3 text-[var(--color-fg)]/70 font-mono truncate max-w-[200px]">
                {preview.originalName}
              </td>
              <td className="text-center text-[var(--color-fg)]/30">→</td>
              <td
                className={clsx(
                  'py-2 px-3 font-mono truncate max-w-[200px]',
                  preview.hasError
                    ? 'text-red-400'
                    : preview.hasConflict
                      ? 'text-amber-400'
                      : preview.originalName !== preview.newName
                        ? 'text-[var(--color-accent)]'
                        : 'text-[var(--color-fg)]/70',
                )}
              >
                {preview.newName}
              </td>
              <td className="py-2 px-3 text-center">
                {preview.hasError ? (
                  <span
                    className="inline-flex items-center gap-1 text-red-400"
                    title={preview.errorMessage}
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M15 9l-6 6M9 9l6 6" />
                    </svg>
                    <span className="text-[10px] uppercase">Error</span>
                  </span>
                ) : preview.hasConflict ? (
                  <span
                    className="inline-flex items-center gap-1 text-amber-400"
                    title="Duplicate filename"
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="text-[10px] uppercase">Conflict</span>
                  </span>
                ) : preview.originalName !== preview.newName ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400">
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span className="text-[10px] uppercase">Ready</span>
                  </span>
                ) : (
                  <span className="text-[10px] uppercase text-[var(--color-fg)]/30">Unchanged</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const BatchRenameDialog = ({ isOpen, onClose, files, onApply }: BatchRenameDialogProps) => {
  const [rules, setRules] = useState<RenameRule[]>([createEmptyRule('findReplace')]);

  const previews = useMemo(() => generatePreview(files, rules), [files, rules]);

  const hasErrors = previews.some((p) => p.hasError);
  const hasConflicts = previews.some((p) => p.hasConflict);
  const hasChanges = previews.some((p) => p.originalName !== p.newName);

  const stats = useMemo(() => {
    const changed = previews.filter((p) => p.originalName !== p.newName && !p.hasError).length;
    const errors = previews.filter((p) => p.hasError).length;
    const conflicts = previews.filter((p) => p.hasConflict).length;
    return { changed, errors, conflicts, total: previews.length };
  }, [previews]);

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

  const handleAddRule = useCallback(() => {
    setRules((prev) => [...prev, createEmptyRule('findReplace')]);
  }, []);

  const handleRuleChange = useCallback((index: number, rule: RenameRule) => {
    setRules((prev) => prev.map((r, i) => (i === index ? rule : r)));
  }, []);

  const handleRemoveRule = useCallback((index: number) => {
    setRules((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleMoveUp = useCallback((index: number) => {
    if (index === 0) return;
    setRules((prev) => {
      const newRules = [...prev];
      [newRules[index - 1], newRules[index]] = [newRules[index], newRules[index - 1]];
      return newRules;
    });
  }, []);

  const handleMoveDown = useCallback((index: number) => {
    setRules((prev) => {
      if (index === prev.length - 1) return prev;
      const newRules = [...prev];
      [newRules[index], newRules[index + 1]] = [newRules[index + 1], newRules[index]];
      return newRules;
    });
  }, []);

  const handleApply = useCallback(() => {
    if (!hasErrors && !hasConflicts && hasChanges) {
      onApply(previews);
      onClose();
    }
  }, [hasErrors, hasConflicts, hasChanges, previews, onApply, onClose]);

  const handleReset = useCallback(() => {
    setRules([createEmptyRule('findReplace')]);
  }, []);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in-fade"
      onClick={handleBackdropClick}
    >
      <div className="glass-panel w-[900px] h-[700px] max-h-[90vh] rounded-lg shadow-2xl border border-[var(--color-border)] animate-in-scale relative overflow-hidden flex flex-col">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent opacity-60" />
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[var(--color-accent)] opacity-60" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[var(--color-accent)] opacity-60" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[var(--color-accent)] opacity-60" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[var(--color-accent)] opacity-60" />

        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold uppercase tracking-wider text-[var(--color-accent)]">
                Batch Rename
              </h2>
              <p className="text-[10px] uppercase tracking-wide text-[var(--color-fg)]/40">
                {files.length} file{files.length !== 1 ? 's' : ''} selected
              </p>
            </div>
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

        <div className="flex-1 flex overflow-hidden">
          <div className="w-[380px] border-r border-[var(--color-border)] flex flex-col">
            <div className="px-4 py-3 border-b border-[var(--color-border)]/50 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-fg)]/50">
                Rename Rules
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="text-[10px] uppercase tracking-wider text-[var(--color-fg)]/50 hover:text-[var(--color-accent)] transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {rules.map((rule, index) => (
                <RuleEditor
                  key={index}
                  rule={rule}
                  index={index}
                  onChange={handleRuleChange}
                  onRemove={handleRemoveRule}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  isFirst={index === 0}
                  isLast={index === rules.length - 1}
                />
              ))}
            </div>

            <div className="p-4 border-t border-[var(--color-border)]/50">
              <Button variant="ghost" size="sm" onClick={handleAddRule} className="w-full">
                <svg
                  className="w-4 h-4 mr-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add Rule
              </Button>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="px-4 py-3 border-b border-[var(--color-border)]/50 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-fg)]/50">
                Preview
              </span>
              <div className="flex items-center gap-4 text-[10px] uppercase tracking-wider">
                <span className="text-[var(--color-fg)]/40">
                  <span className="text-emerald-400 font-bold">{stats.changed}</span> changes
                </span>
                {stats.errors > 0 && (
                  <span className="text-red-400">
                    <span className="font-bold">{stats.errors}</span> errors
                  </span>
                )}
                {stats.conflicts > 0 && (
                  <span className="text-amber-400">
                    <span className="font-bold">{stats.conflicts}</span> conflicts
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-hidden bg-[var(--color-bg)]/50">
              <PreviewTable previews={previews} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-bg)]/50">
          <div className="text-[10px] uppercase tracking-wide text-[var(--color-fg)]/40">
            {hasErrors ? (
              <span className="text-red-400">Fix errors before applying</span>
            ) : hasConflicts ? (
              <span className="text-amber-400">Resolve conflicts before applying</span>
            ) : !hasChanges ? (
              <span>No changes to apply</span>
            ) : (
              <span className="text-emerald-400">Ready to rename</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleApply}
              disabled={hasErrors || hasConflicts || !hasChanges}
            >
              Apply Rename
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
