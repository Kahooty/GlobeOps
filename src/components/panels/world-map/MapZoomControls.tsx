import type { ZoomConfig } from './use-map-viewport';

interface MapZoomControlsProps {
  zoomConfig: ZoomConfig;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
}

export function MapZoomControls({
  zoomConfig,
  onZoomIn,
  onZoomOut,
  onReset,
  canZoomIn,
  canZoomOut,
}: MapZoomControlsProps) {
  const btnClass =
    'text-terminal-primary-dim hover:text-terminal-primary text-[9px] cursor-pointer disabled:opacity-30 disabled:cursor-default';

  return (
    <div className="flex items-center gap-1 text-[9px]">
      <button className={btnClass} onClick={onZoomOut} disabled={!canZoomOut} title="Zoom Out">
        [−]
      </button>
      <button className={btnClass} onClick={onZoomIn} disabled={!canZoomIn} title="Zoom In">
        [+]
      </button>
      <button className={btnClass} onClick={onReset} title="Reset View">
        [⌂]
      </button>
      <span className="text-terminal-primary-dim ml-1">
        Z:{zoomConfig.level}{' '}
        <span className="text-terminal-primary">{zoomConfig.label}</span>
      </span>
    </div>
  );
}
