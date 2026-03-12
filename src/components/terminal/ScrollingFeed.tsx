import { useRef, useEffect, useState, useCallback } from 'react';
import { formatTime } from '@/utils/formatters';
import { truncate } from '@/utils/formatters';

export interface FeedEntry {
  id: string;
  timestamp: Date;
  text: string;
  source?: string;
  category?: string;
  severity?: 'normal' | 'important' | 'critical';
}

interface ScrollingFeedProps {
  items: FeedEntry[];
  maxVisible?: number;
  showTimestamps?: boolean;
  onItemClick?: (id: string) => void;
}

const SEVERITY_CLASSES: Record<string, string> = {
  normal: 'text-terminal-primary',
  important: 'text-terminal-amber text-glow-amber',
  critical: 'text-terminal-red text-glow-red',
};

const CATEGORY_COLORS: Record<string, string> = {
  'world-news': 'text-terminal-primary',
  'us-news': 'text-terminal-cyan',
  defense: 'text-terminal-amber',
  government: 'text-terminal-blue',
  'think-tanks': 'text-terminal-magenta',
  finance: 'text-terminal-cyan',
  tech: 'text-terminal-white',
  'regional-asia': 'text-terminal-primary',
  'regional-europe': 'text-terminal-primary',
  'regional-mideast': 'text-terminal-amber',
  'regional-africa': 'text-terminal-primary',
  'regional-latam': 'text-terminal-primary',
};

export function ScrollingFeed({
  items,
  maxVisible = 100,
  showTimestamps = true,
  onItemClick,
}: ScrollingFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const visibleItems = items.slice(0, maxVisible);

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleItems.length, autoScroll]);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    setAutoScroll(atBottom);
  }, []);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 space-y-0"
      >
        {visibleItems.length === 0 && (
          <div className="text-terminal-primary-dim text-xs py-4 text-center">
            Waiting for data...
          </div>
        )}
        {visibleItems.map((item) => (
          <div
            key={item.id}
            className={`flex gap-2 py-0.5 text-xs leading-snug cursor-pointer hover:bg-terminal-bg-highlight transition-colors ${
              SEVERITY_CLASSES[item.severity || 'normal']
            }`}
            onClick={() => onItemClick?.(item.id)}
          >
            {showTimestamps && (
              <span className="text-terminal-primary-dim shrink-0">
                [{formatTime(item.timestamp)}]
              </span>
            )}
            {item.source && (
              <span className={`shrink-0 font-bold w-[9ch] text-right ${CATEGORY_COLORS[item.category || ''] || 'text-terminal-primary'}`}>
                [{truncate(item.source, 7).padEnd(7)}]
              </span>
            )}
            <span className="min-w-0 break-words">{item.text}</span>
          </div>
        ))}
      </div>
      {!autoScroll && (
        <div
          className="text-center text-xs text-terminal-amber py-1 cursor-pointer hover:text-terminal-amber/80"
          onClick={() => {
            setAutoScroll(true);
            containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
          }}
        >
          [PAUSED - click to resume]
        </div>
      )}
    </div>
  );
}
