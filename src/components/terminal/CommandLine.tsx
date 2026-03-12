import { useState, useCallback, useRef, type KeyboardEvent } from 'react';

interface CommandLineProps {
  onCommand: (command: string) => void;
  prompt?: string;
  placeholder?: string;
}

export function CommandLine({
  onCommand,
  prompt = '> ',
  placeholder = 'type command...',
}: CommandLineProps) {
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && value.trim()) {
        onCommand(value.trim());
        setHistory((h) => [value.trim(), ...h]);
        setValue('');
        setHistoryIdx(-1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (history.length > 0) {
          const next = Math.min(historyIdx + 1, history.length - 1);
          setHistoryIdx(next);
          setValue(history[next]);
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIdx > 0) {
          const next = historyIdx - 1;
          setHistoryIdx(next);
          setValue(history[next]);
        } else {
          setHistoryIdx(-1);
          setValue('');
        }
      } else if (e.key === 'Escape') {
        setValue('');
        setHistoryIdx(-1);
      }
    },
    [value, history, historyIdx, onCommand]
  );

  return (
    <div
      className="flex items-center gap-1 border-t border-terminal-border px-2 py-1 shrink-0 cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      <span className="text-terminal-primary-dim text-xs shrink-0">{prompt}</span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-terminal-primary text-xs outline-none placeholder:text-terminal-primary-dim/40 caret-terminal-primary"
        spellCheck={false}
        autoComplete="off"
      />
      <span className="text-terminal-primary animate-cursor-blink text-xs">{'\u2588'}</span>
    </div>
  );
}
