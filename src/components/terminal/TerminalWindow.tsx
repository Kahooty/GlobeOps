import type { ReactNode } from 'react';
import type { PanelStatus } from '@/types';
import { StatusIndicator } from './StatusIndicator';

interface TerminalWindowProps {
  title: string;
  status?: PanelStatus;
  children: ReactNode;
  className?: string;
  headerRight?: ReactNode;
}

export function TerminalWindow({
  title,
  status = 'live',
  children,
  className = '',
  headerRight,
}: TerminalWindowProps) {
  return (
    <div className={`terminal-border flex flex-col h-full overflow-hidden ${className}`}>
      {/* Title bar */}
      <div className="flex items-center justify-between px-2 py-1 border-b border-terminal-border bg-terminal-bg-header shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-terminal-primary-dim text-xs">{'['}</span>
          <span className="text-xs font-bold tracking-widest uppercase text-glow">
            {title}
          </span>
          <span className="text-terminal-primary-dim text-xs">{']'}</span>
        </div>

        <div className="flex items-center gap-3">
          <StatusIndicator status={status} />
          {headerRight && (
            <div className="relative z-10">{headerRight}</div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-2 min-h-0">
        {children}
      </div>
    </div>
  );
}
