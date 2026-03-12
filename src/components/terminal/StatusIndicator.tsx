import type { PanelStatus } from '@/types';

const STATUS_CONFIG: Record<PanelStatus, { label: string; colorClass: string; glow: string }> = {
  live: { label: 'LIVE', colorClass: 'text-terminal-green', glow: 'text-glow-green' },
  stale: { label: 'STALE', colorClass: 'text-terminal-amber', glow: 'text-glow-amber' },
  error: { label: 'ERR', colorClass: 'text-terminal-red', glow: 'text-glow-red' },
  offline: { label: 'OFF', colorClass: 'text-terminal-white/30', glow: '' },
  loading: { label: 'LOAD', colorClass: 'text-terminal-cyan', glow: 'text-glow-cyan' },
};

interface StatusIndicatorProps {
  status: PanelStatus;
  showLabel?: boolean;
}

export function StatusIndicator({ status, showLabel = true }: StatusIndicatorProps) {
  const config = STATUS_CONFIG[status];
  const pulse = status === 'live' || status === 'loading' ? 'animate-status-pulse' : '';

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${config.colorClass}`}>
      <span className={`${pulse} ${config.glow}`}>{'\u25CF'}</span>
      {showLabel && <span className="uppercase tracking-wider">{config.label}</span>}
    </span>
  );
}
