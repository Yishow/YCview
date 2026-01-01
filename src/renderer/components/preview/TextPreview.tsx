import React, { useMemo } from 'react';

interface TextPreviewProps {
  content: string;
  language?: string;
}

export function TextPreview({ content, language = 'text' }: TextPreviewProps) {
  const lines = useMemo(() => content.split('\n'), [content]);

  const highlightLine = (line: string): React.ReactNode => {
    if (language === 'text') return line;

    const tokenized = [];
    let remaining = line;
    let key = 0;

    const rules = [
      { type: 'comment', regex: /^(\/\/.*|#.*)/ },
      { type: 'string', regex: /^(".*?"|'.*?'|`.*?`)/ },
      {
        type: 'keyword',
        regex:
          /^(import|export|from|const|let|var|function|return|if|else|for|while|class|interface|type|extends|implements)\b/,
      },
      { type: 'number', regex: /^\d+/ },
      { type: 'operator', regex: /^([=+\-*/%&|<>!?:;,.(){}[\]])/ },
      { type: 'whitespace', regex: /^\s+/ },
      { type: 'identifier', regex: /^[a-zA-Z_$][a-zA-Z0-9_$]*/ },
    ];

    while (remaining.length > 0) {
      let matched = false;
      for (const rule of rules) {
        const match = remaining.match(rule.regex);
        if (match) {
          const value = match[0];
          tokenized.push(
            <span key={key++} className={`token-${rule.type} syntax-${rule.type}`}>
              {value}
            </span>,
          );
          remaining = remaining.slice(value.length);
          matched = true;
          break;
        }
      }
      if (!matched) {
        tokenized.push(<span key={key++}>{remaining[0]}</span>);
        remaining = remaining.slice(1);
      }
    }
    return tokenized;
  };

  return (
    <div className="flex h-full flex-col bg-[#1e1e1e] font-mono text-sm text-[#d4d4d4]">
      <div className="flex items-center justify-between border-b border-[#333] bg-[#252526] px-4 py-2 text-xs">
        <span className="font-bold text-[var(--color-accent)]">{language.toUpperCase()}</span>
        <span className="text-[#666]">{lines.length} LINES</span>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="flex min-h-full min-w-full">
          <div className="flex select-none flex-col border-r border-[#333] bg-[#1e1e1e] py-4 text-right text-[#555]">
            {lines.map((_, i) => (
              <div key={i} className="px-3 leading-6 hover:text-[#888]">
                {i + 1}
              </div>
            ))}
          </div>

          <div className="flex-1 overflow-auto py-4">
            {lines.map((line, i) => (
              <div key={i} className="whitespace-pre px-4 leading-6 hover:bg-[#ffffff05]">
                {highlightLine(line) || <br />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .syntax-comment { color: #6a9955; font-style: italic; }
        .syntax-string { color: #ce9178; }
        .syntax-keyword { color: #569cd6; font-weight: bold; }
        .syntax-number { color: #b5cea8; }
        .syntax-operator { color: #d4d4d4; }
        .syntax-identifier { color: #9cdcfe; }
      `}</style>
    </div>
  );
}
