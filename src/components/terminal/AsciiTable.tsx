import { BOX, padRight, padLeft, horizontalLine } from '@/utils/ascii';

interface Column<T> {
  key: keyof T;
  header: string;
  width: number;
  align?: 'left' | 'right';
  render?: (value: T[keyof T], row: T) => string;
}

interface AsciiTableProps<T> {
  columns: Column<T>[];
  data: T[];
  maxRows?: number;
  highlightRow?: (row: T) => boolean;
  onRowClick?: (row: T) => void;
}

export function AsciiTable<T>({
  columns,
  data,
  maxRows,
  highlightRow,
  onRowClick,
}: AsciiTableProps<T>) {
  const visibleData = maxRows ? data.slice(0, maxRows) : data;
  const remaining = maxRows && data.length > maxRows ? data.length - maxRows : 0;

  function renderCell(col: Column<T>, row: T): string {
    const value = row[col.key];
    const text = col.render ? col.render(value, row) : String(value ?? '');
    return col.align === 'right' ? padLeft(text, col.width) : padRight(text, col.width);
  }

  const divider =
    BOX.T_RIGHT +
    columns.map((c) => horizontalLine(c.width + 2)).join(BOX.CROSS) +
    BOX.T_LEFT;

  const topBorder =
    BOX.TL +
    columns.map((c) => horizontalLine(c.width + 2)).join(BOX.T_DOWN) +
    BOX.TR;

  const bottomBorder =
    BOX.BL +
    columns.map((c) => horizontalLine(c.width + 2)).join(BOX.T_UP) +
    BOX.BR;

  function renderRow(cells: string[]): string {
    return BOX.V + cells.map((c) => ` ${c} `).join(BOX.V) + BOX.V;
  }

  const headerRow = renderRow(
    columns.map((c) => padRight(c.header, c.width))
  );

  const lines: string[] = [topBorder, headerRow, divider];

  visibleData.forEach((row) => {
    lines.push(renderRow(columns.map((c) => renderCell(c, row))));
  });

  lines.push(bottomBorder);

  if (remaining > 0) {
    lines.push(`  ... ${remaining} more`);
  }

  return (
    <pre className="text-xs leading-tight whitespace-pre overflow-x-auto">
      {lines.map((line, i) => {
        const row = visibleData[i - 3]; // offset for top border, header, divider
        const highlighted = row && highlightRow?.(row);
        const clickable = row && onRowClick;
        return (
          <div
            key={i}
            className={`${highlighted ? 'text-terminal-amber text-glow-amber' : ''} ${clickable ? 'cursor-pointer hover:bg-terminal-bg-highlight transition-colors' : ''}`}
            onClick={clickable ? () => onRowClick(row) : undefined}
          >
            {line}
          </div>
        );
      })}
    </pre>
  );
}
