import { sparkline, horizontalBar } from '@/utils/ascii';

interface AsciiChartProps {
  data: number[];
  type?: 'sparkline' | 'horizontal-bar';
  labels?: string[];
  width?: number;
  label?: string;
  variant?: 'primary' | 'amber' | 'cyan';
}

const VARIANT_CLASS: Record<string, string> = {
  primary: 'text-terminal-primary',
  amber: 'text-terminal-amber',
  cyan: 'text-terminal-cyan',
};

export function AsciiChart({
  data,
  type = 'sparkline',
  labels,
  width = 20,
  label,
  variant = 'primary',
}: AsciiChartProps) {
  if (data.length === 0) return <span className="text-terminal-primary-dim text-xs">No data</span>;

  const max = Math.max(...data, 1);

  if (type === 'sparkline') {
    return (
      <span className={`text-xs font-mono ${VARIANT_CLASS[variant]}`}>
        {label && <span className="text-terminal-primary-dim">{label} </span>}
        {sparkline(data)}
      </span>
    );
  }

  // Horizontal bar chart
  return (
    <pre className={`text-xs leading-snug ${VARIANT_CLASS[variant]}`}>
      {data.map((value, i) => {
        const lbl = labels?.[i] ?? String(i);
        const bar = horizontalBar(value, max, width);
        const pct = max > 0 ? Math.round((value / max) * 100) : 0;
        return (
          <div key={i}>
            <span className="text-terminal-primary-dim">{lbl.padEnd(8)}</span>
            <span>{' ['}{bar}{'] '}</span>
            <span className="text-terminal-primary-dim">{String(pct).padStart(3)}%</span>
          </div>
        );
      })}
    </pre>
  );
}
